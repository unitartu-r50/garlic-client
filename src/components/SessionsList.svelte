<script>
    import {notify} from '../App.svelte';

    import Instruction from './Instruction.svelte';
    import SessionItemEdit from './SessionItemEdit.svelte';

    let sessions;
    let fetchNeeded = true;
    let currentSession;
    let inEditingMode = false;

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

    function editSession(id) {
        inEditingMode = true;
        console.log("in editing:", inEditingMode)
        notify("warning", "entering editing mode")
    }

    function saveSession(id) {
        inEditingMode = false;
        notify("positive", "session has been saved")
        // TODO: saveSession implementation
    }

    function removeSession(id) {
        notify("positive", "session has been removed")
        // TODO: removeSession implementation with confirmation
    }

    function addQuestion() {
        notify("positive", "question has been added")
        // TODO: addQuestion implementation with confirmation
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

    button {
        margin: 0;
    }

    fieldset {
        border: 4px solid rgba(159, 241, 255, .35);
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
        {#if currentSession}
            {#if inEditingMode}
                <button on:click={saveSession(currentSession.ID)}>Save</button>
            {:else}
                <button on:click={editSession(currentSession.ID)}>Edit</button>
            {/if}
            <button on:click={removeSession(currentSession.ID)}>Remove</button>
        {/if}
    {:else}
        <p><em>No sessions found.</em></p>
    {/if}

    {#if currentSession}
        {#each currentSession.Items as item, i}
            {#if inEditingMode}
                <div class="session-item-edit my2">
                    <form>
                        <SessionItemEdit item="{item}" index="{i}"/>
                    </form>
                </div>
            {:else}
                <div class="session-item my2">
                    {#if item.Actions.length > 0}
                        <Instruction item="{item.Actions[0]}" index="{i}" expanded={true}/>
                        <div class="answers">
                            {#each item.Actions as action, actionIndex}
                                {#if actionIndex > 0}
                                    <Instruction item="{action}" index="{i}"/>
                                {/if}
                            {/each}
                        </div>
                    {/if}
                </div>
            {/if}
        {/each}

        {#if inEditingMode}
            <button on:click|preventDefault={addQuestion}>Add a question</button>
        {/if}
    {/if}
</section>