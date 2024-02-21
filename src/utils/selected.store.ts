import {writable} from 'svelte/store';

const selectedStore = writable<string>('');
export default selectedStore;
