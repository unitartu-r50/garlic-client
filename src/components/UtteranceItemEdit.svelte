<script>
    import {notify} from "./Helpers.svelte";
    import { speaker } from "./stores";

    export let
        utteranceItem;
    
    let oldUtterance = structuredClone(utteranceItem);
    let audioLinked = utteranceItem.Phrase ? true : false;
    let phraseLinked = utteranceItem.Pronunciation ? false : true;
    let id_placeholder = Date.now();

    $: {
        if (utteranceItem.Phrase === "") {
            audioLinked = false;
        } else if (!phraseLinked) {
            if (utteranceItem.Pronunciation === "") {
                audioLinked = false;
            } else if(utteranceItem.Phrase === utteranceItem.Pronunciation) {
                audioLinked = true;
            } else if (utteranceItem.Pronunciation !== oldUtterance.Pronunciation) {
                utteranceItem.FilePath = null;
                audioLinked = false;
            } else if (utteranceItem.FilePath !== oldUtterance.FilePath) {
                utteranceItem.FilePath = oldUtterance.FilePath;
                audioLinked = true;
            }
        } else if (utteranceItem.Phrase !== oldUtterance.Phrase) {
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

    function synthesize(event) {
        if (utteranceItem.Speed > 2 || utteranceItem.Speed < 0.5) {
            notify("negative", "Speed must be a value between 0.5 and 2!");
            return;
        }
        if (utteranceItem.Phrase === "") {
            notify("negative", "Enter a phrase to synthesize!");
            return;
        }
        if (utteranceItem.Phrase === utteranceItem.Pronunciation) {
            utteranceItem.Pronunciation = "";
            phraseLinked = true;
        }
        jQuery(event.target.parentElement).dimmer({closable:false}).dimmer('show');
        fetch('http://' + window.location.hostname + ':8080/api/synthesis', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({'phrase': phraseLinked ? utteranceItem.Phrase : utteranceItem.Pronunciation, 'voice': $speaker, 'speed': utteranceItem.Speed})
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
            jQuery(event.target.parentElement).dimmer('hide');
        })
    }

    function addPronunciation() {
        jQuery('#add-pronunciation').hide();
        jQuery('#remove-pronunciation').show();
        utteranceItem.Pronunciation = utteranceItem.Phrase;
        phraseLinked = false;
    }

    function removePronunciation() {
        jQuery('#add-pronunciation').show();
        jQuery('#remove-pronunciation').hide();
        audioLinked = false;
        utteranceItem.Pronunciation = "";
        phraseLinked = true;
    }

    function removeUtterance() {
        utteranceItem.ID = null;
        utteranceItem.Phrase = "";
        utteranceItem.FilePath = "";
        utteranceItem.Delay = 0;
        utteranceItem.Speed = 1;
    }

    function unsync() {
        audioLinked = false;
    }
</script>

<style>
    .full-width {
        width: 100%;
    }

    .ui.file.input {
        left: -999999px;
        position: absolute;
    }
</style>

{#if utteranceItem}
    <section style="min-width: 450px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 3px;">
            <h3 style="margin: 0;">Audio</h3>
            <span class="ui labeled input">
                <button id="add-pronunciation" data-tooltip="Change pronunciation" data-inverted="" data-position="top center" style="display: {phraseLinked ? "block" : "none"};"
                        class="ui icon button" on:click|preventDefault={addPronunciation}><i class="unlink icon"></i></button>
                <button id="remove-pronunciation" data-tooltip="Use phrase as pronunciation" data-inverted="" data-position="top center" style="display: {phraseLinked ? "none" : "block"};"
                        class="ui icon button" on:click|preventDefault={removePronunciation}><i class="linkify icon"></i></button>
                <span class="ui label">Speed:</span>
                <input type="number" id="{utteranceItem.ID}.UtteranceItem.Delay" placeholder="1.0" min="0.5" max="2.0" step="0.05" style="padding-top: 8px !important; width: 6em;" bind:value={utteranceItem.Speed} on:change={unsync}>
                <span class="ui label">Delay (s):</span>
                <input type="number" id="{utteranceItem.ID}.UtteranceItem.Delay" placeholder="0" style="padding-top: 8px !important; width: 5em;" bind:value={utteranceItem.Delay}>
            </span>
        </div>
        {#if !phraseLinked}
        <h4 style="margin: 5px 0 2px 0;">Phrase</h4>
        {/if}
        <textarea class="full-width"
                    placeholder="Enter a phrase..."
                    name="phrase"
                    id="{utteranceItem.ID}-UtteranceItem.Phrase"
                    rows="3"
                    style="resize: vertical; min-height: 50px;"
                    bind:value={utteranceItem.Phrase}></textarea>
        {#if !phraseLinked}
        <h4 style="margin: 5px 0 2px 0;">Pronunciation:</h4>
        <textarea class="full-width"
                    placeholder="Enter a pronunciation..."
                    name="pronunciation"
                    id="{utteranceItem.ID}-UtteranceItem.Pronunciation"
                    rows="3"
                    style="resize: vertical; min-height: 50px;"
                    bind:value={utteranceItem.Pronunciation}></textarea>
        {/if}
        <div style="display: flex; justify-content: space-between;">
            <span>
                <span class="ui blurring buttons" id="audio-src-span">
                    <button class="ui icon button" on:click|preventDefault={synthesize}><i class="magic icon" style="border-radius: .28571429rem; margin-right: 6px !important;"></i>Synthesize</button>
                    <span class="ui inverted dimmer"></span>
                    <span class="or"></span>
                    <form class="ui form" style="display: inline;">
                        <label for="{utteranceItem.ID ? utteranceItem.ID : id_placeholder}-speechupload" class="ui icon button" style="border-radius: 0 .28571429rem .28571429rem 0;">
                            <i class="upload icon"></i>
                            Upload
                            <input type="file" id="{utteranceItem.ID ? utteranceItem.ID : id_placeholder}-speechupload" class="ui file input" on:change={audioUpload}>
                        </label>
                    </form>
                </span>
                <button data-tooltip="Remove linked audio" data-inverted="" data-position="bottom center"
                        class="ui {utteranceItem.FilePath ? "" : "disabled "}icon button" on:click|preventDefault={removeUtterance}><i class="trash icon"></i></button>
            </span>
            <span>
                <button data-tooltip="Preview audio" data-inverted="" data-position="bottom center" style="margin-right: 0;"
                        class="ui {utteranceItem.FilePath ? '' : 'disabled '}icon button" on:click|preventDefault={playAudio}><i class="play icon"></i></button>
                <span class="ui large {audioLinked ? "green" : "yellow"} label">
                    {#if audioLinked}
                        <i class="white check icon"></i>
                    {:else}
                        <i class="white times icon"></i>
                    {/if}
                    Audio {audioLinked ? "" : "not "}linked
                </span>
            </span>
        </div>
    </section>
{/if}
