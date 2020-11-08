<script>
    import {slide} from 'svelte/transition';
    import {notify, sendInstruction} from './Helpers.svelte';
    import {serverIPStore} from './stores';
    import ActionItemEdit from "./ActionItemEdit.svelte";

    let actions = [];
    let groups = [];
    let actionsByGroups = {};
    let collapsed = false;
    let inEditingMode = false;
    let isAddingAction = false;
    let newFormItem = {
        ID: "",
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
        ImageItem: {
            Name: "",
            FilePath: "",
            Delay: 0,
            Group: ""
        }
    };

    let fetchNeeded = true;
    $: {
        if (fetchNeeded) {
            fetch(`http://` + $serverIPStore + `:8080/api/actions/`)
                .then(r => r.json())
                .then(d => {
                    actions = d.data;
                    populateGroups(actions);
                    populateActionsByGroups(actions, groups);
                    fetchNeeded = false;
                })
                .catch(err => {
                    console.error("error:", err);
                    fetchNeeded = false;
                });
        }
    }

    function populateGroups(actions) {
        if (!actions || actions.length === 0) {
            return;
        }
        let localGroups = new Set();
        for (const action of actions) {
            localGroups.add(action.Group);
        }
        groups = localGroups;
    }

    function populateActionsByGroups(actions, groups) {
        if (!actions || actions.length === 0 || !groups || groups.length === 0) {
            return;
        }
        actionsByGroups = {};
        for (const group of groups) {
            actionsByGroups[group] = actions.filter(item => item.Group === group);
        }
    }

    function toggleEditMode() {
        inEditingMode = !inEditingMode;
    }

    function removeUpload(kind, filepath) {
        fetch(`http://` + $serverIPStore + `:8080/api/upload/${kind}/${filepath}`, {
            method: "DELETE",
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

    function audioUpload() {
        const audioInput = document.getElementById("action-lib-new-audio-file");
        if (newFormItem.SayItem) {
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
                        } else {
                            newFormItem.SayItem.ID = response["id"];
                            newFormItem.SayItem.FilePath = response["filepath"];
                        }
                    })
                    .catch((err) => {
                        console.error(err);
                        notify("negative", err);
                    });
            });
            audioReader.readAsText(audioInput.files[0]);
        }
    }

    function imageUpload() {
        const imageInput = document.getElementById("action-lib-new-image-file");
        if (newFormItem.ImageItem) {
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
                        } else {
                            newFormItem.ImageItem.ID = response["id"];
                            newFormItem.ImageItem.FilePath = response["filepath"];
                        }
                    })
                    .catch((err) => {
                        console.error(err);
                        notify("negative", err);
                    });
            });
            imageReader.readAsText(imageInput.files[0]);
        }
    }

    function uploadAction() {
        audioUpload();
        imageUpload();
        console.log("uploading the action:", newFormItem);

        fetch(`http://` + $serverIPStore + `:8080/api/actions/`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(newFormItem)
        })
            .then(response => response.json())
            .then((response) => {
                console.log(response);
                if (response["error"] && response["error"].length > 0) {
                    notify("negative", response["error"]);
                    removeUpload("audio", newFormItem.SayItem.FilePath);
                    removeUpload("image", newFormItem.ImageItem.FilePath);
                } else {
                    notify("positive", response["message"]);
                    fetchNeeded = true;
                }
                isAddingAction = false;
                resetNewFormItem();
            })
            .catch((err) => {
                console.error(err);
                notify("negative", err);
            });
    }

    function resetNewFormItem() {
        newFormItem = {
            ID: "",
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
            ImageItem: {
                Name: "",
                FilePath: "",
                Delay: 0,
                Group: ""
            }
        };
    }

    function handleActionItemEditMessage(event) {
        const command = event.detail.command;
        console.log("dispatcher", command);
        if (command === "add") {
            uploadAction();
            isAddingAction = false;
            resetNewFormItem();
        } else if (command === "cancel") {
            isAddingAction = false;
            resetNewFormItem();
        } else {
            console.log("unknown command on dispatch:", command);
        }
    }
</script>

<style>
    .audio-group {
        display: grid;
        grid-template-columns: 1fr 1fr;
        grid-gap: .3em;
    }

    label {
        display: block;
    }

    fieldset {
        border: 4px solid rgba(159, 241, 255, .35);
        border-radius: .5em;
        background: rgba(228, 249, 254, .5);
    }

    .icon {
        height: 1em;
    }

    .collapsible {
        cursor: pointer;
        transition: all .2s;
    }

    .collapsible:hover, collapsible:active {
        color: rgb(80, 228, 253);
    }

    .collapsible::before {
        content: "–";
        margin-right: .3em;
        color: rgba(159, 241, 255, 1);
    }

    .collapsed::before {
        content: "+";
        margin-right: .2em;
        color: rgba(159, 241, 255, 1);
    }
</style>

<section class:mb4={!collapsed}>
    <h2 class="h2 m0 mb1 collapsible" class:collapsed={collapsed}
        on:click|preventDefault={() => {collapsed = !collapsed}}>Action Library</h2>
    {#if !collapsed}
        <div transition:slide={{duration: 100}}>
            {#if !isAddingAction}
                <button class="m0" on:click|preventDefault={() => {isAddingAction = true;}}>Add an action</button>
            {/if}
            {#if !inEditingMode}
                <button class="m0" on:click|preventDefault={toggleEditMode}>Edit</button>
            {:else}
                <button class="m0" on:click|preventDefault={toggleEditMode}>Done</button>
            {/if}
            {#if isAddingAction}
                <ActionItemEdit item="{newFormItem}" on:message={handleActionItemEditMessage}/>
            {/if}
            {#each actions as action}
                <div>{action}</div>
            {/each}
        </div>
    {/if}
</section>