<script>
    import {createEventDispatcher} from 'svelte';
    import {notify} from './Helpers.svelte';

    const dispatch = createEventDispatcher();
    export let item, index;

    // TODO: drag and drop audio files, display audio file upload, etc + API
    // TODO: add new session UI + API

    function addAction() {
        const length = item.Actions.push({
            SayItem: {
                Phrase: "",
                FilePath: "",
                Delay: 0
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

    function handleSayDelay(event) {
        item.Actions[event.target.dataset.index].SayItem.Delay = event.target.value * 1000000000;
        item.Actions = item.Actions;
    }

    function dragOverHandler(event) {
        event.dataTransfer.dropEffect = "copy";
        const dropzone = document.getElementById("dropzone-" + event.target.dataset.id);
        if (dropzone) {
            dropzone.style.opacity = .5;
        }
    }

    function dragLeave(event) {
        const dropzone = document.getElementById("dropzone-" + event.target.dataset.id);
        if (dropzone) {
            dropzone.style.opacity = 1;
        }
    }

    function dropHandler(event) {
        const id = event.target.dataset.id;
        const actionIndex = event.target.dataset.index;
        const dropzone = document.getElementById("dropzone-" + id);
        if (dropzone) {
            dropzone.style.opacity = 1;
            const moveID = event.dataTransfer.getData("text/plain");
            fetch("http://localhost:8080/api/moves/" + moveID)
                .then(r => {
                    if (!r.ok) {
                        throw Error(r.statusText);
                    }
                    return r.json();
                })
                .then(d => {
                    item.Actions[actionIndex].MoveItem = d.data;
                })
                .catch(err => {
                    console.error("error:", err);
                    notify("negative", err);
                });
        }
    }

    function fileUpload(event) {
        const name = event.target.files[0].name;
        const actionIndex = event.target.dataset.index;
        console.log("file upload", name, event.target.value);

        const reader = new FileReader();
        reader.addEventListener('load', (e) => {
            let data = new FormData();
            data.append("file_content", event.target.files[0]);

            fetch("http://localhost:8080/api/upload/audio", {
                method: "POST",
                body: data
            })
                .then(response => response.json())
                .then((response) => {
                    console.log(response);
                    item.Actions[actionIndex].SayItem.FilePath = response["filepath"];
                    if (response["error"] && response["error"].length > 0) {
                        notify("negative", response["error"]);
                    } else {
                        notify("positive", response["message"]);
                    }
                })
                .catch((err) => {
                    console.error(err);
                    notify("negative", err);
                })
        })
        reader.readAsArrayBuffer(event.target.files[0]);
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

    label {
        display: block;
    }

    input[type=number] {
        width: 5em;
    }

    .item {
        border: 4px solid rgba(159, 241, 255, .35);
        border-radius: .5em;
        padding: 1em;
    }

    .move-dropzone {
        background: white;
        padding: .5em .5em;
        border: 1px dashed black;
    }

    .grey {
        color: darkgray;
    }
</style>

<form class="item my2">
    <h2 class="h3 m0 mb2 bold">Question {index + 1}</h2>
    {#if item.Actions}
        {#each item.Actions as action, i}
            <fieldset class="m0 mb2">
                {#if i === 0}
                    <legend class="h5 m0 bold caps mb1">Main action</legend>
                {:else}
                    <legend class="h5 m0 bold caps mb1">Action</legend>
                {/if}
                <div class="col-2 full-width">
                    {#if action.SayItem}
                        <div>
                            <h3 class="h4 m0 mb2">Say</h3>
                            <div class="mb1">
                                <label for="{action.SayItem.ID}">Phrase:</label>
                                <textarea class="full-width" name="phrase" id="{action.SayItem.ID}" rows="3"
                                          bind:value={action.SayItem.Phrase}></textarea>
                            </div>
                            <label class="mb1" for="{action.SayItem.ID}-filepath">Audio file:
                                <span class="h6">{action.SayItem.FilePath}</span>
                                <input type="file" id="{action.SayItem.ID}-filepath" accept="audio/*"
                                       on:change="{fileUpload}" data-index="{i}">
                            </label>
                            <label class="mb1" for="{action.SayItem.ID}-delay">Audio delay, s:
                                <input type="number" id="{action.SayItem.ID}-delay" name="sayDelay"
                                       value={action.SayItem.Delay / 1000000000}
                                       data-index="{i}"
                                       on:change={handleSayDelay}>
                            </label>
                        </div>
                    {/if}
                    {#if action.MoveItem}
                        <div>
                            <h3 class="h4 m0 mb2">Move</h3>
                            <label>Move name:
                                <div class="move-dropzone mb2" id="dropzone-{action.MoveItem.ID}"
                                     data-id="{action.MoveItem.ID}"
                                     data-index="{i}"
                                     on:dragover|preventDefault={dragOverHandler}
                                     on:drop|preventDefault={dropHandler}
                                     on:dragleave|preventDefault={dragLeave}>
                                    {action.MoveItem.Name}
                                </div>
                            </label>
                            <label class="mb1" for="{action.MoveItem.ID}-delay">Move delay, s:
                                <input type="number" id="{action.MoveItem.ID}-delay" name="moveDelay"
                                       value={action.MoveItem.Delay / 1000000000}
                                       data-index="{i}"
                                       on:change={handleMoveDelay}>
                            </label>
                        </div>
                    {/if}
                </div>
                <button on:click|preventDefault={removeAction} data-index="{i}" class="m0 mt3">Remove the action
                </button>
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
