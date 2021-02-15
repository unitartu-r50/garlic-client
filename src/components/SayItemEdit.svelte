<script>
    import {serverIPStore} from "./stores";
    import {notify} from "./Helpers.svelte";

    export let
        sayItem;

    function audioUpload(event) {
        const reader = new FileReader();
        reader.addEventListener('load', (e) => {
            let data = new FormData();
            data.append("file_content", event.target.files[0]);
            data.append("phrase", sayItem.Phrase);

            fetch(`http://` + $serverIPStore + `:8080/api/upload/audio`, {
                method: "POST",
                body: data
            })
                .then(response => response.json())
                .then((response) => {
                    console.log(response);
                    sayItem.FilePath = response["filepath"];
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
    label {
        display: block;
    }

    input[type=number] {
        width: 5em;
    }

    .full-width {
        width: 100%;
    }
</style>

{#if sayItem}
    <section class="mb3">
        <h3 class="h4 m0 mb2">Say</h3>
        <label class="mb1" for="{sayItem.ID}.SayItem.Phrase">Phrase
            <textarea class="full-width"
                      name="phrase"
                      id="{sayItem.ID}.SayItem.Phrase"
                      rows="3"
                      bind:value={sayItem.Phrase}></textarea>
        </label>
        <label class="mb1" for="{sayItem.ID}.SayItem.FilePath">Audio file:
            <span class="h6">{sayItem.FilePath}</span>
            <input type="file" id="{sayItem.ID}.SayItem.FilePath" accept="audio/*"
                on:change={audioUpload}/>
        </label>
        <label class="mb1" for="{sayItem.ID}.SayItem.Delay">Audio delay, s:
            <input type="number" id="{sayItem.ID}.SayItem.Delay" name="audio-delay"
                   bind:value={sayItem.Delay}>
        </label>
    </section>
{/if}
