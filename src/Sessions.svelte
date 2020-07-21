<script>
    import { notify, sendInstruction } from './App.svelte';

    let sessions;
    let fetchNeeded = true;
    let currentSession;

    $: {
        if (fetchNeeded) {
            fetch("http://localhost:8080/api/sessions/")
                    .then(r => r.json())
                    .then(d => {
                        sessions = d.data;
                        fetchNeeded = false;
                        if (!currentSession) {
                            currentSession = sessions[0];
                        }
                    })
                    .catch(err => {
                        console.error("error:", err);
                        fetchNeeded = false;
                    });
        }
    }

    function markVisited(id) {
        document.getElementById(id).style.background = "rgba(159, 241, 255, .15)";
    }
</script>

<style>
    .session-item {
        display: grid;
        grid-template-columns: 4fr 1fr;
        grid-gap: .3rem;
    }

    .positive {
        color: #6AE57B;
    }

    .negative {
        color: #FD8181;
    }

    .answers {
        display: grid;
        grid-template-rows: 1fr 1fr;
        grid-gap: .3rem;
    }

    .drop-area {
        border: 1px dotted black;
        padding: 1em;
        border-radius: 1em;
    }
</style>

<section>
    <h2 class="h2 m0 mb1">{currentSession ? currentSession.Name : "Choose a session"}</h2>
    {#if sessions}
        <select name="sessions" id="sessions" class="m0" bind:value={currentSession}>
            <option value="">Please, select a session</option>
            {#each sessions as session, i}
                <option value="{session}">{session.Name}</option>
            {/each}
        </select>
    {/if}

    {#if currentSession}
        {#each currentSession.Items as item, i}
            <div class="session-item my2">
                <article id="{item.Question.SayItem.ID}" class="instruction flex flex-column justify-between" on:click={markVisited(item.Question.SayItem.ID)} on:click={sendInstruction(item.Question.SayItem.ID)}>
                    <p class="h6 m0 mb4 bold caps">Question {i+1}</p>
                    <div>
                        <p class="h2 m0 mb1">{item.Question.SayItem.Phrase}</p>
                        <div class="h6 m0"><span class="bold">audio</span>: {item.Question.SayItem.FilePath}</div>
                        {#if item.Question.MoveItem}
                            <div class="h6 m0"><span
                                    class="bold">motion</span>: {item.Question.MoveItem.Name} {#if item.Question.MoveItem.Delay > 0}
                                <span class="bold">with delay</span>: {item.Question.MoveItem.Delay / 1e9}s{/if}</div>
                        {/if}
                        <audio id="audio-{item.Question.ID}" src="/{item.Question.SayItem.FilePath}" data-itemid="{item.Question.ID}">
                            Your browser does not support the <code>audio</code> element.
                        </audio>
                    </div>
                </article>
                <!--answers-->
                <div class="answers">
                    {#if item.PositiveAnswer}
                        <article id="{item.PositiveAnswer.SayItem.ID}" class="instruction" on:click={markVisited(item.PositiveAnswer.SayItem.ID)} on:click={sendInstruction(item.PositiveAnswer.SayItem.ID)}>
                            <p class="h2 m0 mb1">{item.PositiveAnswer.SayItem.Phrase}</p>
                            {#if item.PositiveAnswer.MoveItem}
                                <p class="h6 m0"><span
                                        class="bold">motion</span>: {item.PositiveAnswer.MoveItem.Name} {#if item.PositiveAnswer.MoveItem.Delay > 0}
                                    <span class="bold">with delay</span>: {item.PositiveAnswer.MoveItem.Delay / 1e9}
                                    s{/if}
                                </p>
                                <audio id="audio-{item.PositiveAnswer.ID}" src="/{item.PositiveAnswer.SayItem.FilePath}"
                                       data-itemid="{item.PositiveAnswer.ID}">
                                    Your browser does not support the <code>audio</code> element.
                                </audio>
                            {/if}
                        </article>
                    {/if}

                    {#if item.NegativeAnswer}
                        <article id="{item.NegativeAnswer.SayItem.ID}" class="instruction" on:click={markVisited(item.NegativeAnswer.SayItem.ID)} on:click={sendInstruction(item.NegativeAnswer.SayItem.ID)}>
                            <p class="h2 m0 mb1">{item.NegativeAnswer.SayItem.Phrase}</p>
                            {#if item.NegativeAnswer}
                                <p class="h6 m0"><span
                                        class="bold">motion</span>: {item.NegativeAnswer.MoveItem.Name} {#if item.NegativeAnswer.MoveItem.Delay > 0}
                                    <span class="bold">with delay</span>: {item.NegativeAnswer.MoveItem.Delay / 1e9}
                                    s{/if}
                                </p>
                                <audio id="audio-{item.NegativeAnswer.ID}" src="/{item.NegativeAnswer.SayItem.FilePath}" data-itemid="{item.NegativeAnswer.ID}">
                                    Your browser does not support the <code>audio</code> element.
                                </audio>
                            {/if}
                        </article>
                    {/if}
                </div>
            </div>
        {/each}
    {/if}
</section>