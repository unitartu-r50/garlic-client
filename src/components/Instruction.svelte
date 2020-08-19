<script>
    import {sendInstruction} from '../App.svelte';

    export let item, index = 0, expanded = false;

    function markVisited(id) {
        document.getElementById(id).style.background = "rgba(159, 241, 255, .15)";
    }
</script>

{#if expanded}
    {#if item}
        <article id="{item.SayItem.ID}" class="instruction flex flex-column justify-between"
                 on:click={markVisited(item.SayItem.ID)} on:click={sendInstruction(item.SayItem.ID)}>
            <p class="h6 m0 mb4 bold caps">Question {index + 1}</p>
            <div>
                <p class="h2 m0 mb1">{item.SayItem.Phrase}</p>
                <div class="h6 m0"><span class="bold">audio</span>: {item.SayItem.FilePath}</div>
                {#if item.MoveItem}
                    <div class="h6 m0"><span
                            class="bold">motion</span>: {item.MoveItem.Name}
                        {#if item.MoveItem.Delay > 0}
                            <span class="bold">with delay</span>: {item.MoveItem.Delay / 1e9}s
                        {/if}
                    </div>
                {/if}
                <audio id="audio-{item.SayItem.ID}" src="http://localhost:8080/{item.SayItem.FilePath}">
                    Your browser does not support the <code>audio</code> element.
                </audio>
            </div>
        </article>
    {/if}
{:else}
    {#if item}
        <article id="{item.SayItem.ID}" class="instruction" on:click={markVisited(item.SayItem.ID)}
                 on:click={sendInstruction(item.SayItem.ID)}>
            <p class="h2 m0 mb1">{item.SayItem.Phrase}</p>
            {#if item.SayItem.FilePath.length > 0}
                <p class="h6 m0"><span class="bold">audio</span>: {item.SayItem.FilePath}</p>
            {/if}
            {#if item.MoveItem}
                <p class="h6 m0"><span
                        class="bold">motion</span>: {item.MoveItem.Name}
                    {#if item.MoveItem.Delay > 0}
                        <span class="bold">with delay</span>: {item.MoveItem.Delay / 1e9}s
                    {/if}
                </p>
                <audio id="audio-{item.SayItem.ID}" src="http://localhost:8080/{item.SayItem.FilePath}">
                    Your browser does not support the <code>audio</code> element.
                </audio>
            {/if}
        </article>
    {/if}
{/if}

