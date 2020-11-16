<script>
    import {createEventDispatcher} from 'svelte';
    import {notify} from './Helpers.svelte';
    import {serverIPStore} from './stores';
    import Select from 'svelte-select';

    const dispatch = createEventDispatcher();

    export let item = {
        ID: "",
        Name: "",
        Group: "Default",
        SayItem: {
            ID: "",
            Phrase: "",
            FilePath: "",
            Delay: 0
        },
        MoveItem: {
            ID: "",
            Name: "",
            FilePath: "",
            Delay: 0,
            Group: ""
        },
        ImageItem: {
            ID: "",
            Name: "",
            FilePath: "",
            Delay: 0,
            Group: ""
        }
    };

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

    function cancelForm() {
        resetNewFormItem();
        dispatch('message', {
            command: 'cancel',
        });
    }

    function handleMoveDelay(event) {
        if (item.MoveItem) {
            item.MoveItem.Delay = event.target.value;
        }
    }

    function handleSayDelay(event) {
        if (item.SayItem) {
            item.SayItem.Delay = event.target.value;
        }
    }

    function handleImageDelay(event) {
        if (item.ImageItem) {
            item.ImageItem.Delay = event.target.value;
        }
    }

    function resetMoveItem() {
        if (item.MoveItem) {
            item.MoveItem.Name = "";
            item.MoveItem.FilePath = "";
            // action.MoveItem.Group = "";
        }
    }

    function handleMoveSelect() {
        if (item.MoveItem) {
            item.MoveItem.Name = newActionMove.Name;
            item.MoveItem.FilePath = newActionMove.FilePath;
            item.MoveItem.Delay = newActionMove.Delay;
            // action.MoveItem.Group = newActionMove.Group;
        }
    }

    function add(event) {
        audioUploadChainedWithOtherUploads();
    }

    function removeUpload(kind, filepath) {
        console.log("removing", kind, filepath);
        fetch(`http://` + $serverIPStore + `:8080/api/upload/${kind}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({"filepath": filepath})
        })
            .then(response => response.json())
            .then((response) => {
                console.log(response);
                if (response["error"] && response["error"].length > 0) {
                    notify("negative", response["error"]);
                }
            })
            .catch((err) => {
                console.error(err);
                notify("negative", err);
            });
    }

    function audioUploadChainedWithOtherUploads() {
        console.log("running audioUpload");
        const audioInput = document.getElementById("action-lib-new-audio-file");
        if (audioInput.files.length > 0) {
            const audioReader = new FileReader();
            audioReader.addEventListener('loadend', (e) => {
                let data = new FormData();
                data.append("file_content", audioInput.files[0]);
                fetch(`http://` + $serverIPStore + `:8080/api/upload/audio`, {
                    method: "POST",
                    body: data
                })
                    .then(response => response.json())
                    .then((response) => {
                        console.log(response);
                        if (response["error"] && response["error"].length > 0) {
                            notify("negative", response["error"]);
                            imageUpload();
                        } else {
                            item.SayItem.ID = response["id"];
                            item.SayItem.FilePath = response["filepath"];
                            imageUpload();
                        }
                    })
                    .catch((err) => {
                        console.error(err);
                        notify("negative", err);
                    });
            });
            audioReader.readAsText(audioInput.files[0]);
        } else {
            // still call the closure even if there's no audio to upload
            imageUpload();
        }
    }

    function imageUpload() {
        console.log("running imageUpload");
        const imageInput = document.getElementById("action-lib-new-image-file");
        if (imageInput.files.length > 0) {
            const imageReader = new FileReader();
            imageReader.addEventListener('loadend', (e) => {
                let data = new FormData();
                data.append("file_content", imageInput.files[0]);
                fetch(`http://` + $serverIPStore + `:8080/api/upload/image`, {
                    method: "POST",
                    body: data
                })
                    .then(response => response.json())
                    .then((response) => {
                        console.log(response);
                        if (response["error"] && response["error"].length > 0) {
                            notify("negative", response["error"]);
                            createAction();
                        } else {
                            item.ImageItem.ID = response["id"];
                            item.ImageItem.FilePath = response["filepath"];
                            createAction();
                        }
                    })
                    .catch((err) => {
                        console.error(err);
                        notify("negative", err);
                    });
            });
            imageReader.readAsText(imageInput.files[0]);
        } else {
            // still call the closure even if there's no image to upload
            createAction();
        }
    }

    function createAction() {
        console.log("running create action:", item);
        fetch(`http://` + $serverIPStore + `:8080/api/actions/`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(item)
        })
            .then(response => response.json())
            .then((response) => {
                console.log(response);
                if ("error" in response) {
                    let msg = "cannot create the action with such parameters";
                    if (response["error"] && response["error"].length > 0) {
                        msg = response["error"];
                    }
                    notify("negative", msg);
                    if (item.SayItem && item.SayItem.FilePath.length > 0) {
                        removeUpload("audio", item.SayItem.FilePath);
                    }
                    if (item.ImageItem && item.ImageItem.FilePath.length > 0) {
                        removeUpload("image", item.ImageItem.FilePath);
                    }
                } else if ("message" in response) {
                    notify("positive", response["message"]);
                    dispatch('message', {
                        command: 'fetch',
                    });
                } else {
                    console.error("unrecognized response:", response);
                }
                dispatch('message', {
                    command: 'edit_done',
                });
                resetNewFormItem();
            })
            .catch((err) => {
                console.error(err);
                notify("negative", err);
            });
    }

    function resetNewFormItem() {
        item = {
            ID: "",
            Name: "",
            Group: "Default",
            SayItem: {
                ID: "",
                Phrase: "",
                FilePath: "",
                Delay: 0
            },
            MoveItem: {
                ID: "",
                Name: "",
                FilePath: "",
                Delay: 0,
                Group: ""
            },
            ImageItem: {
                ID: "",
                Name: "",
                FilePath: "",
                Delay: 0,
                Group: ""
            }
        };
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
                <div class="mb3">
                    <label for="action-lib-new-name" class="mb1">Name:
                        <input type="text" id="action-lib-new-name" bind:value={item.Name} required>
                    </label>
                    <label for="action-lib-new-group" class="mb1">Group:
                        <input type="text" id="action-lib-new-group" bind:value={item.Group} required>
                    </label>
                </div>
                {#if item.SayItem}
                    <section class="mb3">
                        <h3 class="h4 m0 mb2">Say</h3>
                        <label class="mb1" for="action-lib-new-audio-phrase">Phrase
                            <input id="action-lib-new-audio-phrase" type="text" bind:value={item.SayItem.Phrase}>
                        </label>
                        <!--                            <label class="mb1" for="action-lib-new-audio-group">Group-->
                        <!--                                <input id="action-lib-new-audio-group" type="text" bind:value={item.SayItem.Group}>-->
                        <!--                            </label>-->
                        <label class="mb1" for="action-lib-new-audio-file">Audio file
                            <input id="action-lib-new-audio-file" type="file" accept="audio/*">
                        </label>
                        <label class="mb1" for="action-lib-new-audio-delay">Audio delay, s:
                            <input type="number" id="action-lib-new-audio-delay" name="action-lib-new-audio-delay"
                                   value={item.SayItem.Delay / 1000000000}
                                   on:change={handleSayDelay}>
                        </label>
                    </section>
                {/if}
                {#if item.MoveItem}
                    <section class="mb3 searchable-select">
                        <h3 class="h4 m0 mb2">Move</h3>
                        <Select items={moves} bind:selectedValue={newActionMove} placeholder="Search for a move"
                                {groupBy} {getOptionLabel} {getSelectionLabel} on:select={handleMoveSelect}
                                on:clear={resetMoveItem}></Select>
                        <label class="my1" for="{item.MoveItem.ID}-delay">Move delay, s:
                            <input type="number" id="{item.MoveItem.ID}-delay" name="action-lib-new-move-delay"
                                   value={item.MoveItem.Delay / 1000000000}
                                   on:change={handleMoveDelay}>
                        </label>
                    </section>
                {/if}
                {#if item.ImageItem}
                    <section>
                        <h3 class="h4 m0 mb2">Show image</h3>
                        <label class="mb1" for="action-lib-new-image-file">Image file:
                            <span class="h6">{item.ImageItem.FilePath}</span>
                            <input type="file" id="action-lib-new-image-file" accept="image/*">
                        </label>
                        <label class="mb1" for="action-lib-new-image-delay">Image delay, s:
                            <input type="number" id="action-lib-new-image-delay" name="action-lib-new-image-delay"
                                   value={item.ImageItem.Delay / 1000000000}
                                   on:change={handleImageDelay}>
                        </label>
                    </section>
                {/if}
                <div class="mt3">
                    <button on:click|preventDefault={add}>Add</button>
                    <button on:click|preventDefault={cancelForm}>Cancel</button>
                </div>
            </div>
        </fieldset>
    </form>
{/if}
