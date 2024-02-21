<script lang="ts">
    import chatStore from '../utils/chat.store';
    import selectedStore from '../utils/selected.store';
    import SidebarItem from './SidebarItem.svelte';

    /** Group Intl date-time formatter */
    const groupFmt = new Intl.DateTimeFormat('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });

    /** Items grouped by date */
    let grouped: {date: string, items: string[]}[] = [];

    /** Handle new chat button click */
    function handleCreate() {
        $selectedStore = chatStore.createChat();
    }

    function handleSelect(id: string) {
        $selectedStore = id;
    }

    /** Read chat info from store */
    function getChatInfo(id: string) {
        return $chatStore[id];
    }

    /** Group items by dates */
    function groupItems(store: {[id: string]: {name: string, createdAt: string}}) {
        grouped = [];

        for (const id of Object.keys(store).reverse()) {
            const item = store[id];

            const group = grouped.find(g => g.date === groupFmt.format(new Date(item.createdAt)));
            if (group) group.items.push(id);
            else grouped.push({
                date: groupFmt.format(new Date(item.createdAt)),
                items: [id]
            });
        }

        grouped = grouped.sort((a, b) => new Date(a.date) > new Date(b.date) ? -1 : 1);
    }

    $: groupItems($chatStore)
</script>

<div class="sidebar">
    <div class="chat-list">
        {#each grouped as group}
            <div class="group-label">
                {group.date === groupFmt.format(new Date()) ? 'Today' : group.date}
            </div>
            {#each group.items as id}
                {@const { name, createdAt } = getChatInfo(id)}
                <SidebarItem {id} name={name} created={createdAt} on:select={handleSelect.bind(null, id)} />
            {/each}
        {/each}
    </div>
    <button class="create" on:click={handleCreate}>New chat</button>
</div>

<style>
    .sidebar {
        width: 350px;
        height: calc(100vh - 48px - 64px);
        border-right: 1px solid #4A4A4A;
        display: flex;
        flex-flow: column;
        align-items: stretch;
        justify-content: space-between;
    }

    .chat-list {
        overflow-x: hidden;
        overflow-y: auto;
        padding: 8px 8px 8px 16px;
        margin-top: 8px;
        margin-right: 8px;
        margin-bottom: 8px;
    }

    .chat-list::-webkit-scrollbar {
        width: 6px;
    }

    .chat-list::-webkit-scrollbar-thumb {
        background: #5A5A5A;
        border-radius: 3px;
    }

    button.create {
        padding: 16px 0;
        background: transparent;
        border: none;
        border-top: 1px solid #5A5A5A;
        font: 500 16px 'Noto Sans', sans-serif;
        color: white;
        cursor: pointer;
        transition: background .2s cubic-bezier(.25, 0, 0, 1);
    }

    .group-label {
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        text-align: center;
        font: 500 18px 'Noto Sans', sans-serif;
        color: white;
        opacity: .5;
        margin-bottom: 8px;
    }

    button.create:hover {
        background: #2A2A2A;
    }
</style>
