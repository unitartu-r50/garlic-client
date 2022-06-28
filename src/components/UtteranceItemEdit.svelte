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

    function playAudio () {
        var audio = new Audio('http://' + window.location.hostname + ':8080/' + utteranceItem.FilePath + '?' + new Date().getTime());
        audio.play();
    }

    function synthesize() {
        if (utteranceItem.Phrase === "") {
            notify("negative", "Enter a phrase to synthesize!");
            return;
        }
        jQuery('#audio-dimmer').dimmer('show');
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
        .finally(() => {
            jQuery('#audio-dimmer').dimmer('hide');
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
    <section>
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 3px;">
            <h3 style="margin: 0;">Say</h3>
            <span class="ui labeled input">
                <span class="ui label">Audio delay (s):</span>
                <input type="number" id="{utteranceItem.ID}.UtteranceItem.Delay" placeholder="0" style="padding-top: 8px !important;" bind:value={utteranceItem.Delay}>
            </span>
        </div>
        <textarea class="full-width"
                    placeholder="Enter a phrase..."
                    name="phrase"
                    id="{utteranceItem.ID}.UtteranceItem.Phrase"
                    rows="3"
                    style="resize: vertical; min-height: 50px;"
                    bind:value={utteranceItem.Phrase}></textarea>
        <div style="display: flex; justify-content: space-between;">
            <span class="ui blurring buttons" id="audio-src-span">
                <button class="ui icon button" on:click|preventDefault={synthesize}><i class="magic icon"  style="border-radius: .28571429rem; margin-right: 6px !important;"></i>Synthesize</button>
                <span class="ui inverted dimmer" id="audio-dimmer">
                </span>
                <span class="or"></span>
                <form class="ui form" style="display: inline;">
                    <label for="textupload" class="ui icon button" style="border-radius: 0 .28571429rem .28571429rem 0;">
                        <i class="upload icon"></i>
                        Upload
                    </label>
                    <input type="file" id="textupload" class="ui file input" on:change={audioUpload}>
                </form>
            </span>
            <span>
                <button class="ui icon {audioLinked ? '' : 'disabled'} button" on:click|preventDefault={playAudio}><i class="play icon"></i></button>
                <label style="display: inline;" for="{utteranceItem.ID}.UtteranceItem.FilePath">Audio linked:</label>
                {#if audioLinked}
                    <i class="green check icon"></i>
                {:else}
                    <i class="red times icon"></i>
                {/if}
            </span>
        </div>
    </section>
{/if}
