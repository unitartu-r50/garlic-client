<script>
    import {makeID} from './Helpers.svelte';

    export let search;

    let query = "";

    function searchReset() {
        query = "";
        search(query);
    }
</script>

<div class="flex items-baseline">
    <label for="{makeID(4)}-search" class="m0 mt2">Filter:
        <input id="{makeID(4)}-search" type="text" bind:value={query} on:input={search(query)}
               placeholder="Type in your query here">
    </label>
    <div>
        <button class="ml1" on:click|preventDefault={searchReset}>Reset</button>
    </div>
</div>
