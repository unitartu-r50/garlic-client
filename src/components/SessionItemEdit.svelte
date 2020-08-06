<script>
    export let item, index;

    function addAction() {
        console.log("add an action");
        // TODO: addAction implementation
    }
</script>

<style>
    fieldset {
        border: 4px solid rgba(159, 241, 255, .35);
    }

    label {
        display: block;
    }
</style>

<fieldset>
    <legend class="h6 m0 bold caps">Question {index+1}</legend>

    {#if item.Actions}
        {#each item.Actions as action}
            <div class="my2">
                <h4 class="h4 m0 mb1">Action</h4>
                {#if action.SayItem}
                    <label for="{action.SayItem.ID}">Phrase:
                        <input type="text" id="{action.SayItem.ID}" name="phrase"
                               bind:value={action.SayItem.Phrase}>
                    </label>
                {/if}
                {#if action.MoveItem}
                    <label for="{action.MoveItem.ID}-path">Move File Path:
                        <input type="text" id="{action.MoveItem.ID}-path" name="movePath"
                               bind:value={action.MoveItem.FilePath}>
                    </label>
                    <label for="{action.MoveItem.ID}-name">Move Name:
                        <input type="text" id="{action.MoveItem.ID}-name" name="moveName"
                               bind:value={action.MoveItem.Name}>
                    </label>
                    <label for="{action.MoveItem.ID}-delay">Move Delay:
                        <input type="text" id="{action.MoveItem.ID}-delay" name="moveDelay"
                               bind:value={action.MoveItem.Delay}> nanoseconds
                    </label>
                {/if}
            </div>
        {/each}

        <button on:click|preventDefault={addAction} class="m0">Add an action</button>
    {:else}
        <p><em>No actions found.</em></p>
    {/if}
</fieldset>
