<script>
    import {createEventDispatcher} from 'svelte';

    const dispatch = createEventDispatcher();
    export let item, index;

    function addAction() {
        const length = item.Actions.push({
            SayItem: {
                Phrase: "",
                FilePath: ""
            },
            MoveItem: {
                Name: "",
                FilePath: "",
                Delay: 0,
                Group: ""
            },
        });
        item = item;
        console.log("action added, new size is", length);
    }

    function removeAction(event) {
        item.Actions.splice(event.target.dataset.index, 1);
        item = item;
        console.log("action removed, new size is", item.Actions.length);
    }

    function removeItem(event) {
        dispatch('message', {
            id: event.target.dataset.id,
            index: event.target.dataset.index
        });
    }

    function handleMoveDelay(event) {
        item.Actions[event.target.dataset.index].MoveItem.Delay = event.target.value * 1000000000;
        item.Actions = item.Actions;
    }
</script>

<style>
    fieldset {
        border: 4px solid rgba(159, 241, 255, .35);
        border-radius: .5em;
        background: rgba(228, 249, 254, .5);
    }

    label {
        display: block;
    }

    .item {
        /*background: rgba(228, 249, 254, .5);*/
        border: 4px solid rgba(159, 241, 255, .35);
        border-radius: .5em;
        padding: 1em;
    }
</style>

<form class="item my2">
    <h2 class="h3 m0 mb2 bold">Question {index+1}</h2>
    {#if item.Actions}
        {#each item.Actions as action, i}
            <fieldset class="m0 mb2">
                {#if i === 0}
                    <legend class="h5 m0 bold caps mb1">Main action</legend>
                {:else}
                    <legend class="h5 m0 bold caps mb1">Action</legend>
                {/if}
                {#if action.SayItem}
                    <div class="mb1">
                        <label for="{action.SayItem.ID}">Phrase:</label>
                        <textarea name="phrase" id="{action.SayItem.ID}" cols="75" rows="3"
                                  bind:value={action.SayItem.Phrase}></textarea>
                    </div>
                {/if}
                {#if action.MoveItem}
                    <label class="mb1" for="{action.MoveItem.ID}-path">Move File Path:
                        <input type="text" id="{action.MoveItem.ID}-path" name="movePath"
                               bind:value={action.MoveItem.FilePath}>
                    </label>
                    <label class="mb1" for="{action.MoveItem.ID}-name">Move Name:
                        <input type="text" id="{action.MoveItem.ID}-name" name="moveName"
                               bind:value={action.MoveItem.Name}>
                    </label>
                    <label class="mb1" for="{action.MoveItem.ID}-delay">Move Delay:
                        <input type="number" id="{action.MoveItem.ID}-delay" name="moveDelay"
                               value={action.MoveItem.Delay / 1000000000}
                               data-index="{i}"
                               on:change={handleMoveDelay}> seconds
                    </label>
                {/if}
                <button on:click|preventDefault={removeAction} data-index="{i}" class="m0">Remove the action</button>
            </fieldset>
        {/each}

        <button on:click|preventDefault={addAction} class="m0">Add an action</button>
        <button on:click|preventDefault={removeItem} data-id="{item.ID}" data-index="{index}" class="m0">Remove the
            question
        </button>
    {:else}
        <p><em>No actions found.</em></p>
    {/if}
</form>
