<script>
    import {notify} from "./Helpers.svelte";
    import { speaker } from "./stores";

    export let
        utteranceItem;
    
    let oldUtterance = structuredClone(utteranceItem);
    let audioLinked = utteranceItem.Phrase ? true : false

    $: {
        if (utteranceItem.Phrase === "") {
            audioLinked = false;
        } else if (oldUtterance.Phrase !== utteranceItem.Phrase) {
            utteranceItem.FilePath = null;
            audioLinked = false;
        } else if (utteranceItem.FilePath !== oldUtterance.FilePath) {
            utteranceItem.FilePath = oldUtterance.FilePath;
            audioLinked = true;
        }
    }

    function audioUpload(event) {
        const reader = new FileReader();
        reader.addEventListener('load', (e) => {
            let data = new FormData();
            data.append("file_content", event.target.files[0]);
            data.append("phrase", utteranceItem.Phrase);

            fetch(`http://` + window.location.hostname + `:8080/api/upload/audio`, {
                method: "POST",
                body: data
            })
                .then(response => response.json())
                .then((response) => {
                    utteranceItem.FilePath = response["filepath"];
                    if (response["error"] && response["error"].length > 0) {
                        notify("negative", response["error"]);
                    } else {
                        notify("positive", response["message"]);
                    }
                    audioLinked = true;
                    oldUtterance = structuredClone(utteranceItem);
                })
                .catch((err) => {
                    console.error(err);
                    notify("negative", err);
                })
        })
        reader.readAsArrayBuffer(event.target.files[0]);
    }

    function synthesize() {
        if (utteranceItem.Phrase === "") {
            notify("negative", "Enter a phrase to synthesize!");
            return;
        }
        fetch('http://' + window.location.hostname + ':8080/api/synthesis?' + new URLSearchParams({voice: $speaker}), {
            method: 'POST',
            headers: {
                'Content-Type': 'text/strings'
            },
            body: utteranceItem.Phrase
        })
        .then(r => {
            if (!r.ok) {
                throw Error(r.statusText);
            }
            return r.json();
        })
        .then(r => {
            utteranceItem.FilePath = r.filepath;
            audioLinked = true;
            oldUtterance = structuredClone(utteranceItem);
            notify("positive", r.message);
        })
        .catch(err => {
            console.error(err);
            notify("negative", err);
        })
    }
</script>

<style>
    input[type=number] {
        width: 5em;
    }

    .full-width {
        width: 100%;
    }

    .ui.file.input {
        top: -999999px;
        position: absolute;
    }
</style>

{#if utteranceItem}
    <section class="mb3">
        <h3 class="h4 m0 mb2">Say</h3>
        <textarea class="full-width"
                    placeholder="Enter a phrase..."
                    name="phrase"
                    id="{utteranceItem.ID}.UtteranceItem.Phrase"
                    rows="3"
                    bind:value={utteranceItem.Phrase}></textarea>
        <div class="ui stackable two column grid">
            <div class="six wide column">
                <div class="ui labeled input">
                    <div class="ui label">Audio delay (s):</div>
                    <input type="number" id="{utteranceItem.ID}.UtteranceItem.Delay" placeholder="0" style="padding-top: 8px !important;" bind:value={utteranceItem.Delay}>
                </div>
            </div>
            <div class="ten wide column">
                <label style="display: inline;" for="{utteranceItem.ID}.UtteranceItem.FilePath">Audio linked:</label>
                {#if audioLinked}
                    <i class="green check icon"></i>
                {:else}
                    <i class="red times icon"></i>
                {/if}
                <div class="ui buttons">
                    <button class="ui button" on:click|preventDefault={synthesize}><i class="magic icon"></i>Synthesize</button>
                    <div class="or"></div>
                    <form class="ui form" style="display: inline;">
                        <label for="textupload" class="ui icon button">
                            <i class="upload icon"></i>
                            Upload
                        </label>
                        <input type="file" id="textupload" class="ui file input" on:change={audioUpload}>
                    </form>
                </div>
            </div>
        </div>
    </section>
{/if}
