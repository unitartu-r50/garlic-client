<script>
    import {notify} from '../Helpers.svelte';
    import UtteranceItemEdit from "../UtteranceItemEdit.svelte";
    import MotionItemEdit from "../MotionItemEdit.svelte";
    import ImageItemEdit from "../ImageItemEdit.svelte";
    import URLItemEdit from "../URLItemEdit.svelte";

    export let
        item,
        index,
        currentSession;

    let isFetchNeeded = false;

    $: if (isFetchNeeded) {
        fetch(`http://` + window.location.hostname + `:8080/api/session_items/${item.ID}`)
            .then(r => r.json())
            .then(response => {
                item = response.session_item;
                isFetchNeeded = false;
                if (response["error"] && response["error"].length > 0) {
                    notify("negative", response["error"]);
                }
            })
            .catch(err => {
                console.error("error:", err);
                isFetchNeeded = false;
            });
    }

    function addAction() {
        const length = item.Actions.push({
            ID: null,
            UtteranceItem: {
                Phrase: "",
                FilePath: "",
                Delay: 0
            },
            MotionItem: {
                Name: "",
                FilePath: "",
                Delay: 0,
                Group: ""
            },
            ImageItem: {
                Name: "",
                FilePath: "",
                Delay: 0,
                Group: ""
            },
            URLItem: {
                // ID: "",
                Name: "",
                URL: "",
                Delay: 0,
                Group: ""
            }
        });
        item = item;
        console.log("action added, new size is", length);
    }

    function removeAction(event) {
        const actionIndex = event.target.dataset.index;
        let actionID = item.Actions[actionIndex].ID;
        if (!actionID) {
            console.log("no action ID to remove");
            item.Actions.splice(actionIndex, 1);
            item = item;
            return;
        }

        if (item && item.Actions[actionIndex]) {
            fetch(`http://` + window.location.hostname + `:8080/api/instruction/${actionID}`, {
                method: "DELETE"
            })
                .then(r => r.json())
                .then((response) => {
                    if (response["error"] && response["error"].length > 0) {
                        notify("negative", response["error"]);
                    } else {
                        notify("positive", response["message"]);
                        console.log("positive!");
                    }
                    item.Actions.splice(actionIndex, 1);
                    item = item;
                    isFetchNeeded = true;
                })
                .catch(err => console.log(err));
        }
    }

    function remotionItem() {
        currentSession.Items.splice(index, 1);
        currentSession.Items = currentSession.Items;
    }

    function moveUp() {
        if (index === 0) {
            console.log("already the first");
            return;
        }
        currentSession.Items.splice(index, 1);
        currentSession.Items.splice(index - 1, 0, item);
        currentSession.Items = currentSession.Items;
    }

    function moveDown() {
        if (index >= currentSession.Items.length - 1) {
            console.log("already the last");
            return;
        }
        currentSession.Items.splice(index, 1);
        currentSession.Items.splice(index + 1, 0, item);
        currentSession.Items = currentSession.Items;
    }
</script>

<style>
    fieldset {
        border: 4px solid rgba(159, 241, 255, .35);
        border-radius: .5em;
        background: rgba(228, 249, 254, .5);
    }

    .col-2 {
        display: grid;
        grid-template-columns: 1fr 1fr;
        grid-gap: 2em;
    }

    .full-width {
        width: 100%;
    }

    .item {
        border: 4px solid rgba(159, 241, 255, .35);
        border-radius: .5em;
        padding: 1em;
    }
</style>

<form class="item my2">
    <h2 class="h3 m0 mb2 bold">Question {index + 1}</h2>
    {#if item && item.Actions}
        {#each item.Actions as action, i}
            <fieldset class="m0 mb2">
                {#if i === 0}
                    <legend class="h5 m0 bold caps mb1">Main action</legend>
                {:else}
                    <legend class="h5 m0 bold caps mb1">Action</legend>
                {/if}
                <div class="col-2 full-width">
                    <UtteranceItemEdit bind:utteranceItem={action.UtteranceItem}/>
                    <MotionItemEdit bind:motionItem={action.MotionItem}/>
                    <ImageItemEdit bind:imageItem={action.ImageItem}/>
                    <URLItemEdit bind:URLItem={action.URLItem}/>
                </div>
                <button on:click|preventDefault={removeAction} data-index="{i}" class="m0 mt3">
                    Remove the action
                </button>
            </fieldset>
        {/each}

        <button on:click|preventDefault={addAction} class="m0">Add an action</button>
        <button on:click|preventDefault={remotionItem} data-id="{item.ID}" data-index="{index}" class="m0">
            Remove the question
        </button>
        <button on:click|preventDefault={moveUp} data-index="{index}">&uarr;</button>
        <button on:click|preventDefault={moveDown} data-index="{index}">&darr;</button>
    {:else}
        <p><em>No actions found.</em></p>
    {/if}
</form>
