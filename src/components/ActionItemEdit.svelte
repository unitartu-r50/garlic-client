<script>
    import {notify} from './Helpers.svelte';
    import {serverIPStore} from './stores';
    import ActionItemEditSayItem from "./ActionItemEditSayItem.svelte";
    import ActionItemEditMoveItem from "./ActionItemEditMoveItem.svelte";
    import ActionItemEditImageItem from "./ActionItemEditImageItem.svelte";
    import ActionItemEditURLItem from "./ActionItemEditURLItem.svelte";

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

    function add(event) {
        // TODO: check required fields
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
                            imageUpload(); // this function runs the next action
                        } else {
                            item.SayItem.ID = response["id"];
                            item.SayItem.FilePath = response["filepath"];
                            imageUpload(); // this function runs the next action
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
            imageUpload(); // this function runs the next action
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
                            createAction(); // this function runs the next action
                        } else {
                            item.ImageItem.ID = response["id"];
                            item.ImageItem.FilePath = response["filepath"];
                            createAction(); // this function runs the next action
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
            createAction(); // this function runs the next action
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
            <ActionItemEditSayItem bind:sayItem={item.SayItem}/>
            <ActionItemEditMoveItem bind:moveItem={item.MoveItem}/>
            <ActionItemEditImageItem bind:imageItem={item.ImageItem}/>
            <ActionItemEditURLItem bind:URLItem={item.URLItem}/>
            <div class="mt3">
                <button on:click|preventDefault={add}>Add</button>
                <button on:click|preventDefault={cancelForm}>Cancel</button>
            </div>
        </div>
    </fieldset>
</form>
