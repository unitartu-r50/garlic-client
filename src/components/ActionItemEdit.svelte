<script>
    import {createEventDispatcher} from 'svelte';
    import {notify} from './Helpers.svelte';
    import {serverIPStore} from './stores';
    import Select from 'svelte-select';

    const dispatch = createEventDispatcher();
    export let item;

    let moves;
    let movesFetchNeeded = true;
    let newActionMove;

    // Select extensions
    const groupBy = (option) => option.Group;
    const getOptionLabel = (option) => option.Name;
    const getSelectionLabel = (option) => option.Name;

    $: {
        if (movesFetchNeeded) {
            fetch(`http://` + $serverIPStore + `:8080/api/moves/`)
                .then(r => r.json())
                .then(d => {
                    moves = d.data;
                    movesFetchNeeded = false;
                })
                .catch(err => {
                    console.error("error:", err);
                    movesFetchNeeded = false;
                });
        }
    }

    function add(event) {
        dispatch('message', {
            command: 'add',
        });
    }

    function cancelForm() {
        dispatch('message', {
            command: 'cancel',
        });
    }

    function handleMoveDelay(event) {
        for (let action of item.Actions) {
            if (action.MoveItem) {
                action.MoveItem.Delay = event.target.value * 1000000000;
            }
        }
    }

    function handleSayDelay(event) {
        for (let action of item.Actions) {
            if (action.SayItem) {
                action.SayItem.Delay = event.target.value * 1000000000;
            }
        }
    }

    function handleImageDelay(event) {
        for (let action of item.Actions) {
            if (action.ImageItem) {
                action.ImageItem.Delay = event.target.value * 1000000000;
            }
        }
    }

    function resetMoveItem() {
        for (let action of item.Actions) {
            if (action.MoveItem) {
                action.MoveItem.Name = "";
                action.MoveItem.FilePath = "";
                // action.MoveItem.Group = "";
            }
        }
    }

    function handleMoveSelect() {
        for (let action of item.Actions) {
            if (action.MoveItem) {
                action.MoveItem.Name = newActionMove.Name;
                action.MoveItem.FilePath = newActionMove.FilePath;
                action.MoveItem.Delay = newActionMove.Delay;
                // action.MoveItem.Group = newActionMove.Group;
            }
        }
    }
</script>

<style>
    fieldset {
        border: 4px solid rgba(159, 241, 255, .35);
        border-radius: .5em;
        background: rgba(228, 249, 254, .5);
    }

    .full-width {
        width: 100%;
    }

    label {
        display: block;
    }

    input[type=number] {
        width: 5em;
    }

    .searchable-select {
        --border: 1px solid rgb(185, 185, 185);
        --borderFocusColor: rgb(120, 120, 120);
        --borderHoverColor: rgb(120, 120, 120);
        --inputPadding: .5em;
        --placeholderColor: rgb(169, 169, 169);
        --borderRadius: 0;
    }
</style>

{#if item}
    <form class="my2">
        <fieldset class="m0 mb2">
            <legend class="h5 m0 bold caps mb1">Adding an action</legend>
            <div class="full-width">
                {#each item.Actions as action}
                    {#if action.SayItem}
                        <section class="mb3">
                            <h3 class="h4 m0 mb2">Say</h3>
                            <label class="mb1" for="action-lib-new-audio-phrase">Phrase
                                <input id="action-lib-new-audio-phrase" type="text" bind:value={action.SayItem.Phrase}>
                            </label>
<!--                            <label class="mb1" for="action-lib-new-audio-group">Group-->
<!--                                <input id="action-lib-new-audio-group" type="text" bind:value={action.SayItem.Group}>-->
<!--                            </label>-->
                            <label class="mb1" for="action-lib-new-audio-file">Audio file
                                <input id="action-lib-new-audio-file" type="file" accept="audio/*">
                            </label>
                            <label class="mb1" for="action-lib-new-audio-delay">Audio delay, s:
                                <input type="number" id="action-lib-new-audio-delay" name="action-lib-new-audio-delay"
                                       value={action.SayItem.Delay / 1000000000}
                                       on:change={handleSayDelay}>
                            </label>
                        </section>
                    {/if}
                    {#if action.MoveItem}
                        <section class="mb3 searchable-select">
                            <h3 class="h4 m0 mb2">Move</h3>
                            <Select items={moves} bind:selectedValue={newActionMove} placeholder="Search for a move"
                                    {groupBy} {getOptionLabel} {getSelectionLabel} on:select={handleMoveSelect} on:clear={resetMoveItem}></Select>
                            <label class="my1" for="{action.MoveItem.ID}-delay">Move delay, s:
                                <input type="number" id="{action.MoveItem.ID}-delay" name="action-lib-new-move-delay"
                                       value={action.MoveItem.Delay / 1000000000}
                                       on:change={handleMoveDelay}>
                            </label>
                        </section>
                    {/if}
                    {#if action.ImageItem}
                        <section>
                            <h3 class="h4 m0 mb2">Show image</h3>
                            <label class="mb1" for="action-lib-new-image-file">Image file:
                                <span class="h6">{action.ImageItem.FilePath}</span>
                                <input type="file" id="action-lib-new-image-file" accept="image/*">
                            </label>
                            <label class="mb1" for="action-lib-new-image-delay">Image delay, s:
                                <input type="number" id="action-lib-new-image-delay" name="action-lib-new-image-delay"
                                       value={action.ImageItem.Delay / 1000000000}
                                       on:change={handleImageDelay}>
                            </label>
                        </section>
                    {/if}
                {/each}
                <div class="mt3">
                    <button on:click|preventDefault={add}>Add</button>
                    <button on:click|preventDefault={cancelForm}>Cancel</button>
                </div>
            </div>
        </fieldset>
    </form>
{/if}
