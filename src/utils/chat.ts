import {tick} from 'svelte';
import {get, writable, type Writable} from 'svelte/store';
import chatStore from './chat.store';
import selectedStore from './selected.store';

export default class Chat {
    private readonly API_KEY: string = import.meta.env.VITE_NV_API_TOKEN;
    private readonly API_URL: string = 'https://api.nvcf.nvidia.com/v2/nvcf/pexec/functions/2ae529dc-f728-4a46-9b8d-2697213666d8';
    private readonly seed: number;

    public readonly history: Writable<{
        role: 'user' | 'assistant';
        content: string;
        error?: boolean;
    }[]>;
    public readonly stream: Writable<{
        running: boolean;
        message: string;
    }>;

    public constructor(chat?: {role: 'user' | 'assistant', content: string, error?: boolean}[]) {
        this.seed = Math.floor(Math.random() * (1000 - 10) + 10)
        this.history = writable(chat ?? []);
        this.stream = writable({
            running: false,
            message: ''
        });
    }

    /** Add message to history */
    public addMessage(message: string) {
        this.history.update(chat => [...chat, {
            role: 'user',
            content: message
        }]);
    }

    /** Call the API */
    public async request() {
        this.stream.set({
            running: true,
            message: ''
        });

        const response = await fetch(this.API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.API_KEY}`,
                'Accept': 'text/event-stream',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                messages: get(this.history).slice(-5),
                temperature: 0.2,
                top_p: 0.7,
                max_tokens: 1024,
                seed: this.seed,
                stream: true
            })
        });

        // Catch error
        if (response.status >= 400 && response.status < 600) {
            console.groupCollapsed('Request error');
            console.log('Error:', response.statusText);
            console.groupEnd();

            this.history.update(history => [...history, {
                error: true,
                role: 'assistant',
                content: 'Unexpected error'
            }]);

            this.stream.set({
                running: false,
                message: ''
            });

            chatStore.update(chats => ({
                ...chats,
                [get(selectedStore)]: {
                    ...chats[get(selectedStore)],
                    messages: get(this.history)
                }
            }));

            await tick();
            chatStore.saveChatStore();
            return;
        }

        // Create reader and decoder
        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        // Iterate over stream chunks
        let done: boolean, value: Uint8Array, error: boolean;
        while (!done) {
            ({ done, value } = await reader.read());
            if (!value) continue;

            // Create chunks array:
            // 1. Split by lines
            // 2. Filter empty lines
            // 3. Prepare chunks to JSON parsing
            const chunks = decoder.decode(value)
                .split('\n')
                .filter(Boolean)
                .map((chunk) => chunk.replace('data:', '').trim());

            // Iterate over chunks and append message data
            for (const chunk of chunks) {
                if (chunk.includes('[DONE]')) {
                    done = true;
                    break;
                }

                try {
                    const json = JSON.parse(chunk);
                    const content = json.choices?.[0]?.delta?.content;
                    if (content == undefined) continue;

                    this.stream.update(stream => ({
                        ...stream,
                        message: stream.message + content
                    }));
                } catch (e) {
                    console.groupCollapsed('Chunk parse error');
                    console.log('Chunk:', chunk);
                    console.log('Error:', e);
                    console.groupEnd();

                    error = true;
                    done = true;
                    break;
                }
            }
        }

        // Update chat history
        const { message } = get(this.stream);
        this.history.update(history => [
            ...history,
            {
                error,
                role: 'assistant',
                content: message
            }
        ]);

        // Reset stream
        this.stream.set({
            running: false,
            message: ''
        });

        chatStore.update(chats => ({
            ...chats,
            [get(selectedStore)]: {
                ...chats[get(selectedStore)],
                messages: get(this.history)
            }
        }));

        await tick();
        chatStore.saveChatStore();
    }
}
