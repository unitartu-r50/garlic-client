<script>
    import {makeID} from './Helpers.svelte';

    export let search;

    let query = "";

    $: search(query);
</script>

<!--
<span class="flex items-baseline">
    <label for="{makeID(4)}-search">Filter:
        <input id="{makeID(4)}-search" type="text" bind:value={query} on:input={search(query)}
               placeholder="Type in your query here">
    </label>
    <div>
        <button class="ml1" on:click|preventDefault={searchReset}>Reset</button>
    </div>
</span>
-->
<span class="ui small action input">
    <input id="{makeID(4)}-search" type="text" bind:value={query} placeholder="Filter actions">
    <button class="ui icon button" on:click|preventDefault={() => (query = "")}>
        <i class="times icon"></i>
    </button>
</span>