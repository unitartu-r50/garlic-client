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

    // audio
    // let audioPhrase = "";
    // let audioGroup = "";
    // motion
    // let motionName = "";
    // let motionGroup = "";
    // image


    let fetchNeeded = true;
    let actionTypes = [
        "Say",
        "Move",
        "Show image"
    ];
    let newActionType;

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

    function cancelForm(event) {
        isAddingAction = false;
        // audioPhrase = "";
        // audioGroup = "";
    }

    function uploadAction() {
        const audioInput = document.getElementById("action-lib-new-audio-file");
        const imageInput = document.getElementById("action-lib-new-image-file");

        let sayInstruction = newFormItem.Actions.filter(action => action.SayItem);
        console.log("audio data", sayInstruction, audioInput.files);

        let imageInstruction = newFormItem.Actions.filter(action => action.ImageItem);
        console.log("image data", imageInstruction, imageInput.files);

        let moveInstruction = newFormItem.Actions.filter(action => action.MoveItem);
        console.log("motion data", moveInstruction);

        // TODO: upload action with audio, motion, image; look how session item is uploaded with all files

        const reader = new FileReader();
        reader.addEventListener('loadend', (e) => {
            let data = new FormData();
            data.append("audio_file_content", audioInput.files[0]);
            data.append("phrase", sayInstruction.Phrase);

            fetch(`http://` + $serverIPStore + `:8080/api/actions/`, {
                method: "POST",
                body: data
            })
                .then(response => response.json())
                .then((response) => {
                    console.log(response);
                    if (response["error"] && response["error"].length > 0) {
                        notify("negative", response["error"]);
                    } else {
                        notify("positive", response["message"]);
                        fetchNeeded = true;
                        // audioPhrase = "";
                        // audioGroup = "";
                    }
                })
                .catch((err) => {
                    console.error(err);
                    notify("negative", err);
                })
        })
        reader.readAsText(audioInput.files[0]);
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