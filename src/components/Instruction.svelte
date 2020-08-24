<script>
    import {sendInstruction, notify} from './Helpers.svelte'

    export let item, index = 0, expanded = false;

    function markVisited(id) {
        document.getElementById(id).style.background = "rgba(159, 241, 255, .15)";
    }

    function playAudio(itemID, delay) {
        let delayMillis = delay / 1000000;
        const audioElement = document.getElementById("audio-" + itemID);
        if (audioElement) {
            console.log("playing audio");
            // NOTE: this timer could be non-exact, read more at https://stackoverflow.com/questions/29971898/how-to-create-an-accurate-timer-in-javascript
            console.log("setting a timer");
            setTimeout(() => {
                console.log("playing");
                audioElement.play()
                    .catch(err => {
                        console.error(err);
                        notify("negative", err);
                    });
            }, delayMillis);
        } else {
            console.log("not playing audio");
        }
    }
</script>

<style>
    .icon {
        height: 1em;
        margin-right: .25em;
        margin-bottom: .35em;
    }
</style>

{#if expanded}
    {#if item && item.SayItem}
        <article id="{item.SayItem.ID}" class="instruction flex flex-column justify-between"
                 on:click={markVisited(item.SayItem.ID)}
                 on:click={sendInstruction(item.SayItem.ID)}
                 on:click={playAudio(item.SayItem.ID, item.SayItem.Delay)}>
            <p class="h6 m0 mb4 bold caps">Question {index + 1}</p>
            <div>
                <p class="h2 m0 mb1">{item.SayItem.Phrase}</p>
                {#if item.SayItem.FilePath && item.SayItem.FilePath.length > 0}
                    {#if item.SayItem.Delay > 0}
                        <img class="icon" src="/images/speech-delay.svg" alt="audio with delay is present"
                             title="audio with delay is present">
                    {:else}
                        <img class="icon" src="/images/speech.svg" alt="audio is present" title="audio is present">
                    {/if}
                {/if}
                {#if item.MoveItem && (item.MoveItem.Name || item.MoveItem.FilePath)}
                    {#if item.MoveItem.Delay > 0}
                        <img class="icon" src="/images/pepper-icon-delay.svg" alt="movement with delay is present"
                             title="movement with delay is present">
                    {:else}
                        <img class="icon" src="/images/pepper-icon.svg" alt="movement is present"
                             title="movement is present">
                    {/if}
                {/if}
                <audio id="audio-{item.SayItem.ID}" src="http://localhost:8080/{item.SayItem.FilePath}">
                    Your browser does not support the <code>audio</code> element.
                </audio>
            </div>
        </article>
    {/if}
{:else}
    {#if item}
        <article id="{item.SayItem.ID}" class="instruction flex flex-column justify-between items-start"
                 on:click={markVisited(item.SayItem.ID)}
                 on:click={sendInstruction(item.SayItem.ID)}
                 on:click={playAudio(item.SayItem.ID, item.SayItem.Delay)}>
            <p class="h2 m0 mb1">{item.SayItem.Phrase}</p>
            <div>
                {#if item.SayItem.FilePath && item.SayItem.FilePath.length > 0}
                    {#if item.SayItem.Delay > 0}
                        <img class="icon" src="/images/speech-delay.svg" alt="audio with delay is present"
                             title="audio with delay is present">
                    {:else}
                        <img class="icon" src="/images/speech.svg" alt="audio is present" title="audio is present">
                    {/if}
                {/if}
                {#if item.MoveItem && (item.MoveItem.Name || item.MoveItem.FilePath)}
                    {#if item.MoveItem.Delay > 0}
                        <img class="icon" src="/images/pepper-icon-delay.svg" alt="movement with delay is present"
                             title="movement with delay is present">
                    {:else}
                        <img class="icon" src="/images/pepper-icon.svg" alt="movement is present"
                             title="movement is present">
                    {/if}
                {/if}
            </div>
            {#if item.SayItem.FilePath.length > 0}
                <audio id="audio-{item.SayItem.ID}" src="http://localhost:8080/{item.SayItem.FilePath}">
                    Your browser does not support the <code>audio</code> element.
                </audio>
            {/if}
        </article>
    {/if}
{/if}

