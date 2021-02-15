<script>
    import {notify} from '../Helpers.svelte';
    import {serverIPStore} from '../stores';
    import SayItemEdit from "../SayItemEdit.svelte";
    import MoveItemEdit from "../MoveItemEdit.svelte";
    import ImageItemEdit from "../ImageItemEdit.svelte";
    import URLItemEdit from "../URLItemEdit.svelte";

    export let inAddMode, fetchNeeded;

    let item = {
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
        },
        URLItem: {
            ID: "",
            Name: "",
            URL: "",
            Delay: 0,
            Group: ""
        }
    };

    function cancelForm() {
        resetNewFormItem();
        inAddMode = false;
    }

    function add() {
        // TODO: check required fields
        console.log("adding the action:", item);
        fetch(`http://` + $serverIPStore + `:8080/api/actions/`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(item)
        })
            .then(response => response.json())
            .then((response) => {
                console.log("server response:", response);
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
                    fetchNeeded = true;
                } else {
                    console.error("unrecognized response:", response);
                }
                inAddMode = false;
                resetNewFormItem();
            })
            .catch((err) => {
                console.error(err);
                notify("negative", err);
            });
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
            },
            URLItem: {
                ID: "",
                Name: "",
                URL: "",
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
</style>

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
            <SayItemEdit bind:sayItem={item.SayItem}/>
            <MoveItemEdit bind:moveItem={item.MoveItem}/>
            <ImageItemEdit bind:imageItem={item.ImageItem}/>
            <URLItemEdit bind:URLItem={item.URLItem}/>
            <div class="mt3">
                <button on:click|preventDefault={add}>Add</button>
                <button on:click|preventDefault={cancelForm}>Cancel</button>
            </div>
        </div>
    </fieldset>
</form>
