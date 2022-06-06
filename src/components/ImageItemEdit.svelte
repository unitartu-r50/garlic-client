<script>
    import {notify} from "./Helpers.svelte";

    export let
        imageItem;

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
    input[type=number] {
        width: 5em;
    }

    label {
        display: block;
    }
</style>

{#if imageItem}
    <section class="mb3">
        <h3 class="h4 m0 mb2">Show image</h3>
        <label class="mb1" for="{imageItem.ID}-ImageItem.FilePath">Image file:
            <span class="h6">{imageItem.FilePath}</span>
            <input type="file" id="{imageItem.ID}-ImageItem.FilePath" accept="image/*"
                   on:change={imageUpload}>
        </label>
        <label class="mb1" for="{imageItem.ID}-ImageItem.Delay">Image delay, s:
            <input type="number" id="{imageItem.ID}-ImageItem.Delay" name="ImageItem.Delay"
                   bind:value={imageItem.Delay}>
        </label>
    </section>
{/if}
