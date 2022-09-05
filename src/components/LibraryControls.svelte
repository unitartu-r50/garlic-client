<script>
    import { motionsFetchNeeded } from './stores'

    export let
        inAddMode = false,
        inEditMode = false;

    function toggleEdit() {
        $motionsFetchNeeded = true;
        inEditMode = !inEditMode;
    }

    function toggleAdd() {
        $motionsFetchNeeded = true;
        inAddMode = !inAddMode;
    }
</script>

<span style="display: flex; flex-wrap: nowrap;">
    {#if !inAddMode}
        <button class="ui button" on:click|preventDefault={toggleAdd}>Add</button>
    {/if}
    {#if !inEditMode}
        <button class="ui button" on:click|preventDefault={toggleEdit}>Edit</button>
    {:else}
        <button class="ui button" on:click|preventDefault={toggleEdit}>Done</button>
    {/if}
</span>
