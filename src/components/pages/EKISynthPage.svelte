<script>
    import Introduction from '../Introduction.svelte';
    import {serverIPStore} from "../stores";
    import {notify} from "../Helpers.svelte";

    let payload = {
        "text": "",
        "voice": 29,
        "emotion": 0
    };
    let audioFormat = "mp3"; // mp3 or wav

    const voices = {
        "Eva (HTS)": 14,
        "Eva (Ossian)": 18,
        "Tõnu (HTS)": 15,
        "Tõnu (Ossian)": 19,
        "Tõnu (DNN)": 27,
        "Liisi (HTS)": 16,
        "Liisi (Ossian)": 20,
        "Riina (HTS)": 17,
        "Riina (Ossian)": 21,
        "Riina (DNN)": 26,
        "Meelis (HTS)": 24,
        "Kihnu (HTS)": 25,
        "Lee (HTS)": 29,
        "Lee (Ossian)": 28,
        "Liivika (HTS)": 30,
        "Einar (Ossian)": 22,
        "Luukas (Ossian)": 23
    };

    const emotions = [
        "neutral",
        "glad",
        "sad",
        "angry"
    ];

    const formats = [
        "mp3",
        "wav"
    ];

    function send() {
        console.log("payload", payload);
        fetch(`http://` + $serverIPStore + `:8080/api/synthesize`, {
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
                return r.json();
            })
            .then(r => {
                console.log("response", r);
                notify("positive", r.message);
                window.open(r[audioFormat]);
            })
            .catch(e => {
                console.error(e);
                notify("negative", e);
            })
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

<Introduction title="Estonian Speech Synthesizer">
    <slot>
        <p>This page uses the public HTTP-service located at <a href='https://www.eki.ee/heli/index.php'>www.eki.ee/heli/</a>
            which is kindly provided by <a href="https://www.eki.ee/">Eesti Keele Instituut</a>.</p>
    </slot>
</Introduction>

<main class="p2 mt4">
    <form class="my2" style="width: 400px;">
        <fieldset class="m0 mb2">
            <legend class="h5 m0 bold caps mb1">Audio generation</legend>
            <div class="full-width">
                <div class="mb3">
                    <label for="synth-text" class="mb2">Text:
                        <br>
                        <textarea name="text" id="synth-text" bind:value={payload['text']} cols="43" rows="5"
                                  required></textarea>
                    </label>
                    <label for="synth-voice" class="mb2">Voice:
                        <select name="voice" id="synth-voice" bind:value={payload['voice']}>
                            {#each Object.keys(voices) as voice}
                                <option value={voices[voice]}>{voice}</option>
                            {/each}
                        </select>
                    </label>
                    <label for="synth-emotion" class="mb2">Emotion:
                        <select name="voice" id="synth-emotion" bind:value={payload['emotion']}>
                            {#each emotions as emotion, i}
                                <option value={i}>{emotion}</option>
                            {/each}
                        </select>
                    </label>
                    <div>
                        <div class="mb1">Audio format:</div>
                        {#each formats as format}
                            <label for="synth-format-{format}" class="mb1">
                                <input id="synth-format-{format}" type="radio" name="format" bind:group={audioFormat}
                                       value={format}/>{format}
                            </label>
                        {/each}
                    </div>
                </div>
                <div class="mt3">
                    <button type="submit" on:click|preventDefault={send}>Generate</button>
                </div>
            </div>
        </fieldset>
    </form>
</main>
