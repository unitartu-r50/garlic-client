<script>
    import {notify} from "../Helpers.svelte";
    import Instruction from "../Instruction.svelte";

    export let
        itemsByGroup,
        isFetchNeeded,
        inEditMode;

    function removeAudio(event) {
        const id = event.target.dataset.id;

        let confirmation = window.confirm(`Are you sure you want to remove the audio?`);
        if (!confirmation) {
            return;
        }

        fetch(`http://` + window.location.hostname + `:8080/api/audio/${id}`, {
            method: "DELETE",
            headers: {"Content-Type": "application/json"}
        })
            .then(response => response.json())
            .then((response) => {
                if (response["error"] && response["error"].length > 0) {
                    notify("negative", response["error"]);
                } else {
                    notify("positive", response["message"]);
                    isFetchNeeded = true;
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
                <div>
                    <Instruction item={{UtteranceItem: audio}} name={audio.Phrase} small={true} expanded={false}/>
                    {#if inEditMode}
                        <div>
                            <button class="m0 mb1" on:click|preventDefault={removeAudio} data-id="{audio.ID}">Remove
                            </button>
                        </div>
                    {/if}
                </div>
            {/each}
        </section>
    {/each}
{:else}
    <p><em>No audio files found.</em></p>
{/if}
