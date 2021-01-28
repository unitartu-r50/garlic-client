<script>
    import {filterByGroup} from './Helpers.svelte';

    export let
        items,
        itemsByGroup;

    let searchQuery = "";

    function search() {
        let filteredItems = [];
        for (const sound of items) {
            if (sound.Phrase.toLowerCase().includes(searchQuery.toLowerCase())) {
                filteredItems.push(sound);
            }
        }
        itemsByGroup = filterByGroup(filteredItems);
    }

    function searchReset() {
        searchQuery = "";
        search();
    }
</script>

<div class="flex items-baseline">
    <label for="move-search" class="m0 mt2">Filter:
        <input id="move-search" type="text" bind:value={searchQuery} on:input={search}
               placeholder="Type in your query here">
    </label>
    <div>
        <button class="ml1" on:click|preventDefault={searchReset}>Reset</button>
    </div>
</div>
