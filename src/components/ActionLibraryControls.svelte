<script>
    export let
        inAddMode = false,
        inEditMode = false;

    function toggleEdit() {
        inEditMode = !inEditMode;
    }

    function toggleAdd() {
        inAddMode = !inAddMode;
    }
</script>

<div class="mb2">
    {#if !inAddMode}
        <button class="m0" on:click|preventDefault={toggleAdd}>Add an action</button>
    {/if}
    {#if !inEditMode}
        <button class="m0" on:click|preventDefault={toggleEdit}>Edit</button>
    {:else}
        <button class="m0" on:click|preventDefault={toggleEdit}>Done</button>
    {/if}
</div>
