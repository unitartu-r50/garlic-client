<script>
    import {notify} from "./Helpers.svelte";
    import {serverIPStore} from "./stores";
    import Instruction from "./Instruction.svelte";

    export let
        itemsByGroup,
        fetchNeeded,
        inEditMode;

    function markVisited(id) {
        document.getElementById(id).style.background = "rgba(159, 241, 255, .15)";
    }

    function playAudio(itemID, delay) {
        let delayMillis = delay * 1000;
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

    function removeAudio(event) {
        const id = event.target.dataset.id;

        let confirmation = window.confirm(`Are you sure you want to remove the audio?`);
        if (!confirmation) {
            return;
        }

        fetch(`http://` + $serverIPStore + `:8080/api/audio/${id}`, {
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
</style>

{#if itemsByGroup}
    {#each Object.keys(itemsByGroup) as groupName}
        <h3 class="h4">{groupName}</h3>
        <section class="audio-group">
            {#each itemsByGroup[groupName] as audio}
                <Instruction item={{SayItem: audio}} name={audio.Phrase} small={true} expanded={false}/>
                {#if inEditMode}
                    <div>
                        <button class="m0 mb1" on:click|preventDefault={removeAudio} data-id="{audio.ID}">Remove
                        </button>
                    </div>
                {/if}
            {/each}
        </section>
    {/each}
{:else}
    <p><em>No audio files found.</em></p>
{/if}
