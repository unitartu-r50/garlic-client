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

<div class="mb2">
    {#if !inAddMode}
        <button class="m0" on:click|preventDefault={toggleAdd}>Add</button>
    {/if}
    {#if !inEditMode}
        <button class="m0" on:click|preventDefault={toggleEdit}>Edit</button>
    {:else}
        <button class="m0" on:click|preventDefault={toggleEdit}>Done</button>
    {/if}
</div>
