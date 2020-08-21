<script>
    import {notify} from './Helpers.svelte';

    import Instruction from './Instruction.svelte';
    import SessionItemEdit from './SessionItemEdit.svelte';

    let sessions = [];
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
                    } else if (!currentSession.ID || currentSession.ID.length === 0) {
                        for (let el of sessions) {
                            if (el.Name === currentSession.Name) {
                                currentSession = el;
                            }
                        }
                    } else {
                        for (let el of sessions) {
                            if (el.ID === currentSession.ID) {
                                currentSession = el;
                            }
                        }
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
    }

    function saveSession(id) {
        if (!currentSession["ID"] || currentSession["ID"].length === 0) {
            console.log("posting a new session", currentSession);
            fetch("http://localhost:8080/api/sessions/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(currentSession)
            })
                .then(r => {
                    if (!r.ok) {
                        throw Error(r.statusText);
                    }
                    return r.json();
                })
                .then(r => {
                    notify("positive", r.message);
                    inEditingMode = false;
                    fetchNeeded = true;
                })
                .catch(err => {
                    console.error(err);
                    notify("negative", err);
                    inEditingMode = false;
                    fetchNeeded = true;
                })
        } else {
            console.log("saving session", currentSession);
            fetch("http://localhost:8080/api/sessions/" + id, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                mode: "cors",
                redirect: "follow",
                body: JSON.stringify(currentSession)
            })
                .then(r => {
                    if (!r.ok) {
                        throw Error(r.statusText);
                    }
                    return r.json();
                })
                .then(r => {
                    notify("positive", r.message);
                    inEditingMode = false;
                    fetchNeeded = true;
                })
                .catch(err => {
                    console.error(err);
                    notify("negative", err);
                    inEditingMode = false;
                    fetchNeeded = true;
                })
        }
    }

    function removeSession(id) {
        fetch("http://localhost:8080/api/sessions/" + id, {
            method: "DELETE",
            mode: "cors",
            redirect: "follow",
            body: JSON.stringify(currentSession)
        })
            .then(r => {
                if (!r.ok) {
                    throw Error(r.statusText);
                }
                return r.json();
            })
            .then(r => {
                notify("positive", r.message);
                inEditingMode = false;
                currentSession = null;
                sessions = [];
                fetchNeeded = true;
            })
            .catch(err => {
                console.error(err);
                notify("negative", err);
            })
    }

    function addQuestion() {
        currentSession.Items.push({
            Actions: []
        });
        currentSession.Items = currentSession.Items;
    }

    function addSession() {
        let session = {
            "Name": "New Session",
            "Items": [{
                "Actions": [],
            }]
        };
        currentSession = session;
        sessions.push(session);
        sessions = sessions;
        inEditingMode = true;
    }

    function editingOff() {
        inEditingMode = false;
    }

    function handleItemEditMessage(event) {
        const itemID = event.detail.id;
        const index = event.detail.index;
        console.log("remove item", itemID);
        currentSession.Items.splice(index, 1);
        currentSession.Items = currentSession.Items;
    }
</script>

<style>
    .session-item {
        display: grid;
        grid-template-columns: 5fr 2fr;
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

    label {
        display: block;
    }
</style>

<section>
    {#if currentSession}
        {#if inEditingMode}
            <label for="session-name" class="mb2">Session name:
                <input id="session-name" type="text"
                       bind:value={currentSession.Name}></label>
        {:else}
            <h2 class="h2 m0 mb1">{currentSession.Name}</h2>
        {/if}
    {:else}
        <h2 class="h2 m0 mb1">Choose a session</h2>
    {/if}
    {#if sessions && sessions.length > 0}
        <select name="sessions" id="sessions" class="m0" bind:value={currentSession} on:blur={editingOff}>
            <option value="">Please, select a session</option>
            {#each sessions as session, i}
                {#if session.ID === currentSession.ID}
                    <option value="{session}" selected>{session.Name}</option>
                {:else}
                    <option value="{session}">{session.Name}</option>
                {/if}
            {/each}
        </select>
        {#if currentSession}
            {#if inEditingMode}
                <button on:click={saveSession(currentSession.ID)}>Save</button>
            {:else}
                <button on:click={editSession(currentSession.ID)}>Edit</button>
            {/if}
            <button on:click={removeSession(currentSession.ID)}>Remove</button>
            <button on:click|preventDefault={addSession}>Add a session</button>
        {/if}
    {:else}
        <p><em>No sessions found.</em></p>
        <button on:click|preventDefault={addSession}>Add a session</button>
    {/if}
    {#if currentSession && currentSession.Items}
        {#each currentSession.Items as item, i}
            {#if inEditingMode}
                <SessionItemEdit item="{item}" index="{i}" on:message={handleItemEditMessage}/>
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