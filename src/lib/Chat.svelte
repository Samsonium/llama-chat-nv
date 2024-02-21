<script lang="ts">
    import {onMount, tick} from 'svelte';
    import Chat from '../utils/chat';
    import ChatItem from './ChatItem.svelte';

    /** Chat data */
    export let chat: {
        name: string;
        createdAt: string;
        messages: {
            role: 'user' | 'assistant';
            content: string;
        }[]
    };

    /** History container */
    let historyContainer: HTMLDivElement;

    /** Chat class instance */
    let instance = new Chat(chat?.messages);
    let { history, stream } = instance; // <- obtain stores

    /** Message contents */
    let value = '';

    /** Handle message send */
    function handleSend() {
        if (!value.trim()) return;
        instance.addMessage(value);
        instance.request();
        value = '';
    }

    /** Update instance data */
    function updateInstance() {
        instance = new Chat(chat?.messages);
        ({history, stream} = instance);
    }

    /** Handle textarea input */
    function handleInput(e: KeyboardEvent) {
        if (e.shiftKey || e.key !== 'Enter') return;
        e.preventDefault();
        handleSend();
    }

    onMount(() => {
        historyContainer.scrollTo({
            top: historyContainer.scrollHeight
        })
    })

    $: chat, updateInstance();
    $: if ($stream.message || $history.length) historyContainer?.scrollTo({
        top: historyContainer.scrollHeight
    })
</script>

<div class="chat">
    {#if chat}
        <div class="header">Chat "{chat.name}"</div>
        <div class="history" bind:this={historyContainer}>
            <div class="history-messages">
                {#each $history as msg}
                    <ChatItem {...msg} />
                {/each}

                {#if $stream.running}
                    <ChatItem role="assistant" content={$stream.message} />
                {/if}
            </div>
        </div>
        <form on:submit|preventDefault={handleSend}>
            <textarea placeholder="Write me a..." rows="{value.split('\n').length}" on:keypress={handleInput} bind:value></textarea>
            <button class="send" type="submit">Send</button>
        </form>
    {/if}
</div>

<style>
    .chat {
        height: calc(100vh - 48px - 64px);
        flex: 2;
        padding: 16px;
        display: flex;
        flex-flow: column;
    }

    .header {
        height: 40px;
        display: flex;
        flex-flow: row nowrap;
        align-items: flex-start;
        justify-content: center;
        border-bottom: 1px solid #4A4A4A;
        text-align: center;
        font: 500 18px 'Noto Sans', sans-serif;
        color: white;
        margin-bottom: 16px;
    }

    .history {
        position: relative;
        width: 100%;
        height: 100px;
        max-height: calc(100%);
        flex: 1;
        overflow-x: hidden;
        overflow-y: auto;
        padding: 0 16px;
    }

    .history::-webkit-scrollbar {
        width: 6px;
    }

    .history::-webkit-scrollbar-thumb {
        border-radius: 3px;
        background: #5A5A5A;
    }

    .history::-webkit-scrollbar-thumb:hover {
        background: white;
        cursor: pointer;
    }

    .history-messages {
        width: 100%;
        height: 100%;
        display: flex;
        flex-flow: column;
        align-items: stretch;
    }

    form {
        margin-top: 16px;
        display: flex;
        flex-flow: row nowrap;
        align-items: flex-end;
    }

    form textarea {
        min-height: 32px;
        max-height: 300px;
        height: max-content;
        flex: 1;
        background: transparent;
        padding: 4px 16px;
        outline: none;
        font: 400 16px 'Noto Sans', sans-serif;
        color: white;
        resize: none;
        margin-right: 8px;
        border: 1px solid #5A5A5A;
        border-radius: 8px;
    }

    form button.send {
        background: transparent;
        padding: 4px 16px;
        cursor: pointer;
        font: 500 16px 'Noto Sans', sans-serif;
        color: white;
        border: 1px solid #5A5A5A;
        border-radius: 8px;
        transition: background .2s cubic-bezier(.25, 0, 0, 1);
    }

    form button.send:hover {
        background: #2A2A2A;
    }
</style>
