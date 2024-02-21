<script lang="ts">
    import {Marked} from 'marked';
    import {markedHighlight} from 'marked-highlight';
    import hljs from 'highlight.js';
    // @ts-ignore
    import hljs_svelte from 'highlightjs-svelte';
    import 'highlight.js/styles/atom-one-dark.css';

    export let role: 'user' | 'assistant';
    export let content: string;
    export let error = false;

    hljs_svelte(hljs);
    const marked = new Marked(markedHighlight({
        langPrefix: 'hljs language-',
        highlight(code, lang, _) {
            if (!window['copyCode']) {
                window['copyCode'] = (button: HTMLButtonElement) => {
                    if (navigator?.clipboard) {
                        const code = button.parentElement.parentElement;
                        const codeStr = code.innerText.split('\n').slice(2).join('\n');
                        navigator.clipboard.writeText(codeStr);

                        button.innerText = 'Copied!'

                        clearTimeout(copyTimeout);
                        copyTimeout = setTimeout(() => {
                            button.innerText = 'Copy';
                        }, 3000);
                    }
                };
            }

            // if (lang === 'svelte') lang = 'html';
            const language = hljs.getLanguage(lang) ? lang : 'plaintext';
            let copyTimeout: number;
            return (language === 'plaintext' ? '' : '<div class="code-header">' +
                    '<div class="code-header-name">' + language + '</div>' +
                    `<button class="code-header-copy" onclick="copyCode(this)">Copy</button>` +
                    '</div>') +
                hljs.highlight(code, { language }).value;
        }
    }))

    $: markdownContent = marked.parse(content);
</script>

<div class="chat-item" class:assist={role === 'assistant'}>
    <div class="avatar">
        {role.toUpperCase()}
    </div>
    <div class="message" class:error>
        {#if error}
            Message has not been finished due unhandled error
        {:else}
            {@html markdownContent}
        {/if}
    </div>
</div>

<style>
    .chat-item {
        width: 100%;
        display: flex;
        flex-flow: column;
        align-items: flex-start;
    }

    .chat-item {
        margin-bottom: 32px;
    }

    /*.chat-item.assist {*/
    /*    align-items: flex-end;*/
    /*}*/

    .avatar {
        background: limegreen;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 2px 8px;
        border-radius: 16px;
        margin-bottom: 8px;
        font: 500 12px 'Noto Sans', sans-serif;
        color: white;
        border: 1px solid rgba(255, 255, 255, .25);
    }

    .chat-item.assist .avatar {
        background: blueviolet;
    }

    .message {
        width: 100%;
        max-width: 800px;
        font: 400 16px 'Noto Sans', sans-serif;
        color: lightgray;
        /*padding: 8px;*/
        /*border: 1px solid rgba(255, 255, 255, .15);*/
        /*border-radius: 8px;*/
    }

    .message.error {
        width: max-content;
        padding: 8px;
        border: 1px solid orangered;
        border-radius: 8px;
        background: rgba(255, 0, 0, .1);
    }

    :global(.message p) {
        margin: 0;
    }

    :global(.message a) {
        color: dodgerblue;
    }

    :global(.message code::-webkit-scrollbar) {
        height: 6px;
    }

    :global(.message code::-webkit-scrollbar-track) {
        background: #2A2A2A;
        border-radius: 3px;
    }

    :global(.message code::-webkit-scrollbar-thumb) {
        background: #5A5A5A;
        border-radius: 3px;
    }

    :global(.message code) {
        border-radius: 12px;
    }

    :global(.message code:not(:has(div.code-header))) {
        color: white;
        font-weight: 700;
        font-family: monospace;
        padding: 0 4px;
    }

    :global(div.code-header) {
        width: max-content;
        height: 24px;
        background: #2A2A2A;
        border: 1px solid #5A5A5A;
        font: 500 14px 'Noto Sans', sans-serif;
        color: white;
        border-radius: 32px;
        margin-bottom: 12px;
        text-transform: uppercase;
        display: flex;
        flex-flow: row nowrap;
        align-items: center;
        overflow: hidden;
    }

    :global(div.code-header-name) {
        padding: 4px 12px;
    }

    :global(button.code-header-copy) {
        padding: 0 12px;
        height: 100%;
        margin: 0;
        border: none;
        background: lightsteelblue;
        font: 500 12px 'Noto Sans', sans-serif;
        color: black;
        cursor: pointer;
    }
</style>
