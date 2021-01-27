<script>
    import {notify} from "./Helpers.svelte";
    import {serverIPStore} from "./stores";

    export let inAddMode, fetchNeeded;

    let audioPhrase = "";
    let audioGroup = "";

    function cancelForm() {
        inAddMode = false;
        audioPhrase = "";
        audioGroup = "";
    }

    function addAudio() {
        const input = document.getElementById("new-audio-file");

        inAddMode = false;

        if (!input.files) {
            notify("negative", "please, attach a motion file")
            return;
        }

        console.log("file upload", audioPhrase, audioGroup, input.files[0]);

        const reader = new FileReader();
        reader.addEventListener('loadend', (e) => {
            let data = new FormData();
            data.append("file_content", input.files[0]);
            data.append("phrase", audioPhrase);
            data.append("group", audioGroup);

            fetch(`http://` + $serverIPStore + `:8080/api/audio/`, {
                method: "POST",
                body: data
            })
                .then(response => response.json())
                .then((response) => {
                    console.log(response);
                    if (response["error"] && response["error"].length > 0) {
                        notify("negative", response["error"]);
                    } else {
                        notify("positive", response["message"]);
                        fetchNeeded = true;
                        audioPhrase = "";
                        audioGroup = "";
                    }
                })
                .catch((err) => {
                    console.error(err);
                    notify("negative", err);
                })
        })
        reader.readAsText(input.files[0]);
    }
</script>

<style>
    fieldset {
        border: 4px solid rgba(159, 241, 255, .35);
        border-radius: .5em;
        background: rgba(228, 249, 254, .5);
    }

    label {
        display: block;
    }
</style>

<form class="my2">
    <fieldset class="mb1">
        <legend class="h5 m0 bold caps mb1">Adding an audio</legend>
        <label class="mb1" for="new-audio-phrase">Phrase
            <input id="new-audio-phrase" type="text" bind:value={audioPhrase}>
        </label>
        <label class="mb1" for="new-audio-group">Group
            <input id="new-audio-group" type="text" bind:value={audioGroup}>
        </label>
        <label class="mb1" for="new-audio-file">File
            <input id="new-audio-file" type="file" accept="audio/*">
        </label>
        <button class="m0 mt2" on:click|preventDefault={addAudio}>Add</button>
        <button class="m0 mt2" on:click|preventDefault={cancelForm}>Cancel</button>
    </fieldset>
</form>
