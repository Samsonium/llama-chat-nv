import {get, writable} from 'svelte/store';
import selectedStore from './selected.store';

/** LocalStorage key */
const key = 'code-llama-70b-chats';

/** Chat histories store */
const chatStore = writable<Record<string, {
    name: string;
    createdAt: string;
    messages: {
        role: 'user' | 'assistant';
        content: string;
        error?: boolean;
    }[];
}>>({});

/** Generate UUID-like identifier */
function generateId() {
    return 'xxxx-xxxx-xxxx'.replaceAll(
        /x/g,
        () => Math.floor(Math.random() * 16).toString(16)
    );
}

/** Loads chat from localStorage */
function loadChatStore() {
    const storeItem = localStorage.getItem(key);
    if (storeItem) {
        try {
            const json = JSON.parse(storeItem);
            chatStore.set(json);
        } catch (e) {
            console.log('Cannot parse localStorage', key, 'contents');
            localStorage.removeItem(key);
        }
    }

    if (!Object.keys(get(chatStore)).length) createChat();

    let last;
    for (const id of Object.keys(get(chatStore))) {
        if (!last) {
            last = id;
            continue;
        }

        const lastDt = new Date(get(chatStore)[last].createdAt);
        const nowDt = new Date(get(chatStore)[id].createdAt);
        if (nowDt > lastDt) last = id;
    }

    selectedStore.set(last);
}

/** Save chat histories to localStorage */
function saveChatStore() {
    localStorage.setItem(key, JSON.stringify(get(chatStore)));
}

/** Creates empty chat */
function createChat() {
    const id = generateId();
    chatStore.update(chats => ({
        ...chats,
        [id]: {
            name: ('New chat ' + (Object.keys(chats).length || '')).trim(),
            createdAt: (new Date()).toISOString(),
            messages: []
        }
    }));
    saveChatStore();
    return id;
}

export default {
    ...chatStore,
    loadChatStore,
    saveChatStore,
    createChat
}
