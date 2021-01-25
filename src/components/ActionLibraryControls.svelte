<script>
    import {createEventDispatcher} from 'svelte';

    const dispatch = createEventDispatcher();

    export let
        inAddMode = false,
        inEditMode = false;

    function toggleEditMode() {
        inEditMode = !inEditMode;
        dispatch('modeChanged', {'inEditMode': inEditMode});
    }

    function add() {
        inAddMode = true;
        dispatch('modeChanged', {'inAddMode': inAddMode});
    }
</script>

<div class="mb2">
    {#if !inAddMode}
        <button class="m0" on:click|preventDefault={add}>Add an action</button>
    {/if}
    {#if !inEditMode}
        <button class="m0" on:click|preventDefault={toggleEditMode}>Edit</button>
    {:else}
        <button class="m0" on:click|preventDefault={toggleEditMode}>Done</button>
    {/if}
</div>
