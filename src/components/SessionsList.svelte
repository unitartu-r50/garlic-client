<script>
    import {notify, sendInstruction} from '../App.svelte';
    import Instruction from './Instruction.svelte';

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
                <Instruction item="{item.Question}" index="{i}" expanded={true}/>
                <div class="answers">
                    <Instruction item="{item.PositiveAnswer}"/>
                    <Instruction item="{item.NegativeAnswer}"/>
                </div>
            </div>
        {/each}
    {/if}
</section>