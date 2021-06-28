<script>
    import Introduction from '../Introduction.svelte';
    import {serverIPStore} from "../stores";
    import {notify} from "../Helpers.svelte";

    let payload = {
        "text": "",
        "speaker": "Albert",
        "speed": 1.0
    };
    let audioFormat = "wav";

    const speakers = [
        "Albert", "Kalev", "Külli", "Meelis", "Vesta"
    ]

    const formats = [
        "wav"
    ];

    let downloadURL = null;

    function send() {
        fetch(`https://api.tartunlp.ai/text-to-speech/v2`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        })
            .then(r => {
                if (!r.ok) {
                    throw Error(r.statusText);
                }

                const mimetype = r.headers.get("Content-Type") ?? "audio/wav";

                r.blob().then(data => {
                    downloadURL = URL.createObjectURL(data);
                    notify("positive", "Audio is ready");
                }).catch((err) => {
                    console.error(err);
                    notify("negative", err);
                });
            })
            .catch(e => {
                console.error(e);
                notify("negative", e);
            });
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

<Introduction title="Neurokõne Speech Synthesizer">
    <slot>
        <p>This page uses the public HTTP-service located at <a href="https://neurokone.ee">neurokone.ee</a>
            and kindly provided by <a href="https://tartunlp.ai">NLP research group</a> at the University of Tartu.</p>
    </slot>
</Introduction>

<main class="p2 mt4">
    <form class="my2" style="width: 400px;">
        <fieldset class="m0 mb2">
            <legend class="h5 m0 bold caps mb1">Audio parameters</legend>
            <div class="full-width">
                <div class="mb3">
                    <label for="synth-text" class="mb2">Text:
                        <br>
                        <textarea name="text" id="synth-text" bind:value={payload["text"]} cols="43" rows="5"
                                  required></textarea>
                    </label>
                    <label for="synth-speaker" class="mb2">Voice:
                        <select name="speaker" id="synth-speaker" bind:value={payload["speaker"]}>
                            {#each speakers as speaker}
                                <option value={speaker}>{speaker}</option>
                            {/each}
                        </select>
                    </label>
                    <label for="synth-speed" class="mb2">Speed:
                        <input id="synth-speed" name="speed" type="range" min="0.5" max="2.0" step="0.25" bind:value={payload["speed"]}> {payload["speed"]}
                    </label>
                </div>
                <div class="mt3 flex justify-between">
                    <button type="submit" on:click|preventDefault={send}>Generate</button>
                    {#if downloadURL}
                        <span class="ml1"><a href="{downloadURL}" download="audio.wav">Download audio</a></span>
                    {/if}
                </div>
            </div>
        </fieldset>
    </form>
</main>
