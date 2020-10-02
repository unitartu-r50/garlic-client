<script>
    import {slide} from 'svelte/transition';
    import {notify, sendInstruction} from './Helpers.svelte';

    let sounds;
    let soundGroups;
    let audioByGroups;
    let fetchNeeded = true;
    let isAddingMotion = false;
    let inEditingMode = false;
    let searchQuery = "";

    let audioPhrase = "";
    let audioGroup = "";

    let collapsed = false;

    $: {
        if (fetchNeeded) {
            fetch("http://localhost:8080/api/audio/")
                .then(r => r.json())
                .then(d => {
                    sounds = d.data;
                    populateAudioGroups(sounds);
                    populateAudioByGroups(sounds, soundGroups)
                    fetchNeeded = false;
                })
                .catch(err => {
                    console.error("error:", err);
                    fetchNeeded = false;
                });
        }
    }

    function populateAudioGroups(sounds) {
        let groups = new Set();
        for (const sound of sounds) {
            groups.add(sound.Group);
        }
        soundGroups = groups;
    }

    function populateAudioByGroups(sounds, soundGroups) {
        audioByGroups = {};
        for (const group of soundGroups) {
            audioByGroups[group] = sounds.filter(item => item.Group === group);
        }
    }

    function search() {
        let filteredSounds = [];
        for (const sound of sounds) {
            if (sound.Phrase.toLowerCase().includes(searchQuery.toLowerCase())) {
                filteredSounds.push(sound);
            }
        }
        populateAudioGroups(filteredSounds);
        populateAudioByGroups(filteredSounds, soundGroups);
    }

    function searchReset() {
        searchQuery = "";
        search();
    }

    function markVisited(id) {
        document.getElementById(id).style.background = "rgba(159, 241, 255, .15)";
    }

    function showForm(event) {
        isAddingMotion = true;
    }

    function addAudio(event) {
        const input = document.getElementById("new-audio-file");

        console.log("add motion", input.files);
        isAddingMotion = false;

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

            fetch("http://localhost:8080/api/audio/", {
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

    function playAudio(itemID, delay) {
        let delayMillis = delay / 1000000;
        const audioElement = document.getElementById("audio-" + itemID);
        if (audioElement) {
            // NOTE: this timer could be non-exact, read more at https://stackoverflow.com/questions/29971898/how-to-create-an-accurate-timer-in-javascript
            setTimeout(() => {
                audioElement.play()
                    .catch(err => {
                        console.error(err);
                        notify("negative", err);
                    });
            }, delayMillis);
        } else {
            console.log("no audio element found");
        }
    }

    function cancelForm(event) {
        isAddingMotion = false;
        audioPhrase = "";
        audioGroup = "";
    }

    function toggleEditMode() {
        inEditingMode = !inEditingMode;
    }

    function removeAudio(id) {
        console.log("removing", id);
        fetch("http://localhost:8080/api/audio/" + id, {
            method: "DELETE",
            headers: {"Content-Type": "application/json"}
        })
            .then(response => response.json())
            .then((response) => {
                console.log(response);
                if (response["error"] && response["error"].length > 0) {
                    notify("negative", response["error"]);
                } else {
                    notify("positive", response["message"]);
                    fetchNeeded = true;
                }
            })
            .catch((err) => {
                console.error(err);
                notify("negative", err);
            })
    }
</script>

<style>
    .audio-group {
        display: grid;
        grid-template-columns: 1fr 1fr;
        grid-gap: .3em;
    }

    label {
        display: block;
    }

    fieldset {
        border: 4px solid rgba(159, 241, 255, .35);
        border-radius: .5em;
        background: rgba(228, 249, 254, .5);
    }

    .icon {
        height: 1em;
    }

    .collapsible {
        cursor: pointer;
        transition: all .2s;
    }

    .collapsible:hover {
        color: rgb(80, 228, 253);
    }

    .collapsible::before {
        content: "–";
        margin-right: .3em;
        color: rgba(159, 241, 255, 1);
    }

    .collapsed::before {
        content: "+";
        margin-right: .2em;
        color: rgba(159, 241, 255, 1);
    }
</style>

<section class:mb4={!collapsed}>
    <h2 class="h2 m0 mb1 collapsible" class:collapsed={collapsed}
        on:click|preventDefault={() => {collapsed = !collapsed}}>Audio Library</h2>
    {#if !collapsed}
        <div transition:slide={{duration: 100}}>
            {#if !isAddingMotion}
                <button class="m0" on:click|preventDefault={showForm}>Add an audio</button>
            {/if}
            {#if !inEditingMode}
                <button class="m0" on:click|preventDefault={toggleEditMode}>Edit</button>
            {:else}
                <button class="m0" on:click|preventDefault={toggleEditMode}>Done</button>
            {/if}
            {#if isAddingMotion}
                <form class="my2">
                    <fieldset class="mb1">
                        <legend class="h5 m0 bold caps mb1">Adding an audio</legend>
                        <label class="mb1" for="new-audio-phrase">Phrase
                            <input id="new-audio-phrase" type="text" bind:value={audioPhrase}>
                        </label>
                        <label class="mb1" for="new-motion-group">Group
                            <input id="new-motion-group" type="text" bind:value={audioGroup}>
                        </label>
                        <label class="mb1" for="new-audio-file">File
                            <input id="new-audio-file" type="file" accept="audio/*">
                        </label>
                        <button class="m0 mt2" on:click|preventDefault={addAudio}>Add</button>
                        <button class="m0 mt2" on:click|preventDefault={cancelForm}>Cancel</button>
                    </fieldset>
                </form>
            {/if}
            <div class="flex items-baseline">
                <label for="audio-search" class="m0 mt2">Filter:
                    <input id="audio-search" type="text" bind:value={searchQuery} on:input={search}
                           placeholder="Type in your query here">
                </label>
                <div>
                    <button class="ml1" on:click|preventDefault={searchReset}>Reset</button>
                </div>
            </div>
            {#if audioByGroups}
                {#each Object.keys(audioByGroups) as groupName}
                    <h3 class="h3">{groupName}</h3>
                    <section class="audio-group">
                        {#each audioByGroups[groupName] as audio}
                            <div>
                                <article class="instruction flex justify-between" id="{audio.ID}"
                                         on:click={markVisited(audio.ID)}
                                         on:click={playAudio(audio.ID, audio.Delay)}
                                         data-id="{audio.ID}">
                                    <p class="m0">{audio.Phrase}</p>
                                    {#if audio.FilePath && audio.FilePath.length > 0}
                                        {#if audio.Delay > 0}
                                            <img class="icon" src="/images/speech-delay.svg"
                                                 alt="audio with delay is present"
                                                 title="audio with delay is present">
                                        {:else}
                                            <img class="icon" src="/images/speech.svg" alt="audio is present"
                                                 title="audio is present">
                                        {/if}
                                    {/if}
                                    <audio id="audio-{audio.ID}" src="http://localhost:8080/{audio.FilePath}">
                                        Your browser does not support the <code>audio</code> element.
                                    </audio>
                                </article>
                                {#if inEditingMode}
                                    <button class="m0 mb1" on:click|preventDefault={removeAudio(audio.ID)}>Remove
                                    </button>
                                {/if}
                            </div>
                        {/each}
                    </section>
                {/each}
            {:else}
                <p><em>No audio files found.</em></p>
            {/if}
        </div>
    {/if}
</section>