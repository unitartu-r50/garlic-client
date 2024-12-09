<script>
    import {notify} from "./Helpers.svelte";

    export let
        imageItem,
        action;

    let id_placeholder = action.ID + "-ImageItem";

    function imageUpload(event) {
        // console.log("uploading image", event);
        const reader = new FileReader();
        reader.addEventListener('load', (e) => {
            let data = new FormData();
            data.append("file_content", event.target.files[0]);

            fetch(`http://` + window.location.hostname + `:8080/api/upload/image`, {
                method: "POST",
                body: data
            })
                .then(response => response.json())
                .then((response) => {
                    imageItem.FilePath = response["filepath"];
                    imageItem.Name = response["filename"];
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

    function removeImage() {
        imageItem.ID = null;
        imageItem.Name = "";
        imageItem.FilePath = "";
        imageItem.Delay = 0;
        imageItem.Group = "";
    }
</script>

<style>
    input[type=number] {
        width: 5em;
    }

    label {
        display: block;
    }

    .ui.file.input {
        left: -999999px;
        position: absolute;
    }
</style>

{#if imageItem}
    <section>
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 3px;">
            <h3 style="margin: 0;">Image</h3>
            <span class="ui labeled input">
                <span class="ui label">Image delay (s):</span>
                <input type="number" id="{imageItem.ID}.UtteranceItem.Delay" placeholder="0" style="padding-top: 8px !important;" bind:value={imageItem.Delay}>
            </span>
        </div>
        {#if imageItem.FilePath}
        <label class="mb1" for="{imageItem.ID}-ImageItem.FilePath">Current image file:
            <span class="h4">{imageItem.Name ? imageItem.Name : imageItem.FilePath}</span>
        </label>
        {/if}
        <label for="{imageItem.ID ? imageItem.ID : id_placeholder}-ImageItem.FilePath" class="ui icon button">
            <i class="upload icon"></i>
            Upload image
            <input type="file" id="{imageItem.ID ? imageItem.ID : id_placeholder}-ImageItem.FilePath" accept="image/*" class="ui file input" on:change={imageUpload}>
        </label>
        <button class="ui {imageItem.FilePath ? "" : "disabled "}icon button" on:click|preventDefault={removeImage}><i class="trash icon"></i>Remove</button>
    </section>
{/if}
