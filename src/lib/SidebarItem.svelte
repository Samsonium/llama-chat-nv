<script lang="ts">
    import {createEventDispatcher} from 'svelte';
    import chatStore from '../utils/chat.store';
    import selectedStore from '../utils/selected.store';

    /** Event emitter */
    const dispatch = createEventDispatcher<{
        select: void
    }>();

    /** Date timer formatter */
    const dtFormatter = new Intl.DateTimeFormat('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    })

    export let id: string;
    export let name: string;
    export let created: string;

    /** Edited name */
    let editName = name;

    /** Is name edit enabled */
    let isEditing = false;

    /** Handle rename button click */
    function handleRenameStart() {
        editName = name;
        isEditing = true;
    }

    /** Rename submit */
    function handleRename() {
        $chatStore[id].name = editName;
        chatStore.saveChatStore();
        isEditing = false;
    }

    /** Text button click */
    function handleSelect() {
        dispatch('select');
    }
</script>

{#key $selectedStore}
    <div class="chat" class:selected={$selectedStore === id}>
        <button class="text" on:click={handleSelect}>
            <span class="date">{dtFormatter.format(new Date(created))}</span>
            <br/>

            {#if isEditing}
                <input type="text" bind:value={editName}>
            {:else}
                <span class="name">{name}</span>
            {/if}
        </button>

        {#if isEditing}
            <button class="edit" on:click={handleRename}>Done</button>
        {:else}
            <button class="edit" on:click={handleRenameStart}>Edit</button>
        {/if}
    </div>
{/key}

<style>
    div.chat {
        width: 100%;
        border-radius: 8px;
        border: none;
        background: transparent;
        display: flex;
        flex-flow: row nowrap;
        align-items: center;
        justify-content: space-between;
        outline: 8px solid transparent;
        transition: background .2s cubic-bezier(.25, 0, 0, 1),
        outline .2s cubic-bezier(.25, 0, 0, 1);
    }

    div.chat:hover, div.chat.selected {
        outline-color: #2A2A2A;
        background: #2A2A2A;
    }

    div.chat:not(:last-child) {
        margin-bottom: 16px;
    }

    button.text {
        max-width: 80%;
        flex: 1;
        text-align: left;
        border: none;
        background: transparent;
        padding: 0;
        margin: 0;
        overflow: hidden;
        cursor: pointer;
    }

    button.text span.date {
        font: 400 14px 'Noto Sans', sans-serif;
        color: grey;
    }

    button.text span.name {
        display: block;
        width: 100%;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
        font: 500 16px 'Noto Sans', sans-serif;
        color: white;
    }

    button.edit {
        padding: 8px;
        border-radius: 8px;
        border: 1px solid #5A5A5A;
        background: transparent;
        color: white;
        cursor: pointer;
    }
</style>
