<script lang="ts">
    import {onMount} from 'svelte';
    import Header from './lib/Header.svelte';
    import Sidebar from './lib/Sidebar.svelte';
    import Chat from './lib/Chat.svelte';
    import chatStore from './utils/chat.store';
    import selectedStore from './utils/selected.store';

    // let selectedStoreData;
    // $: selectedStoreData = $chatStore[$selectedStore]

    onMount(() => (chatStore.loadChatStore()));
</script>

<Header/>
<div class="content">
    <Sidebar/>
    {#if $selectedStore}
        <Chat chat={$chatStore[$selectedStore]}/>
    {/if}
</div>

<style>
    .content {
        flex: 1;
        display: flex;
        flex-flow: row nowrap;
        align-items: stretch;
    }
</style>
