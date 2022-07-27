<script>
    import {notify} from '../Helpers.svelte';
    import UtteranceItemEdit from "../UtteranceItemEdit.svelte";
    import MotionItemEdit from "../MotionItemEdit.svelte";
    import ImageItemEdit from "../ImageItemEdit.svelte";
    import URLItemEdit from "../URLItemEdit.svelte";
    import { motionsFetchNeeded } from '../stores'

    export let inAddMode, fetchNeeded;

    let item = {
        ID: null,
        Name: "",
        Group: "Default",
        UtteranceItem: {
            ID: null,
            Phrase: "",
            FilePath: "",
            Delay: 0
        },
        MotionItem: {
            ID: null,
            Name: "",
            FilePath: "",
            Delay: 0,
            Group: ""
        },
        ImageItem: {
            ID: null,
            Name: "",
            FilePath: "",
            Delay: 0,
            Group: ""
        },
        URLItem: {
            ID: null,
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
        $motionsFetchNeeded = true;
        // TODO: check required fields
        console.log("adding the action:", item);
        fetch(`http://` + window.location.hostname + `:8080/api/actions/`, {
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
                    if (item.UtteranceItem && item.UtteranceItem.FilePath.length > 0) {
                        removeUpload("audio", item.UtteranceItem.FilePath);
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
        fetch(`http://` + window.location.hostname + `:8080/api/upload/${kind}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({"filepath": filepath})
        })
            .then(response => response.json())
            .then((response) => {
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
            ID: null,
            Name: "",
            Group: "Default",
            UtteranceItem: {
                ID: null,
                Phrase: "",
                FilePath: "",
                Delay: 0
            },
            MotionItem: {
                ID: null,
                Name: "",
                FilePath: "",
                Delay: 0,
                Group: ""
            },
            ImageItem: {
                ID: null,
                Name: "",
                FilePath: "",
                Delay: 0,
                Group: ""
            },
            URLItem: {
                ID: null,
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
</style>

<form class="my2">
    <fieldset class="m0 mb2">
        <legend class="h5 m0 bold caps mb1">Adding an action</legend>
        <div class="full-width">
            <div class="mb3" style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                <span class="ui small labeled input">
                    <div class="ui label">Name:</div>
                    <input type="text" bind:value={item.Name} required>
                </span>
                <span class="ui small labeled input">
                    <div class="ui label">Group:</div>
                    <input type="text" bind:value={item.Group} required>
                </span>
            </div>
            <UtteranceItemEdit bind:utteranceItem={item.UtteranceItem}/>
            <div class="ui divider"></div>
            <MotionItemEdit bind:motionItem={item.MotionItem}/>
            <div class="ui divider"></div>
            <ImageItemEdit bind:imageItem={item.ImageItem}/>
            <div class="ui divider"></div>
            <URLItemEdit bind:URLItem={item.URLItem}/>
            <div class="mt3" style="display: flex; justify-content: flex-end;">
                <button class="ui green button" on:click|preventDefault={add}>Add</button>
                <button class="ui red button" on:click|preventDefault={cancelForm}>Cancel</button>
            </div>
        </div>
    </fieldset>
</form>
