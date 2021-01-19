<script>
    import {notify} from './Helpers.svelte';
    import Instruction from './Instruction.svelte';
    import SessionItemEdit from './SessionItemEdit.svelte';
    import {serverIPStore} from './stores';

    let sessions = [];
    let fetchNeeded = true;
    let currentSession;
    let inEditingMode = false;
    let inPresentationMode = true;
    let currentPresentationItemIndex = 0;
    let currentPresentationItem = null;

    $: {
        if (fetchNeeded) {
            fetch(`http://` + $serverIPStore + `:8080/api/sessions/`)
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
                    console.log("current session", currentSession);
                })
                .catch(err => {
                    console.error("error:", err);
                    fetchNeeded = false;
                });
        }

        if (inEditingMode) {
            inPresentationMode = false;
        }

        if (currentSession && currentSession.Items.length > 0) {
            currentPresentationItem = currentSession.Items[currentPresentationItemIndex];
        }
    }

    function markVisited(id) {
        document.getElementById(id).style.background = "rgba(159, 241, 255, .15)";
    }

    function editSession(id) {
        inEditingMode = true;
        inPresentationMode = false;
    }

    function saveSession(id) {
        if (!currentSession["ID"] || currentSession["ID"].length === 0) {
            console.log("posting a new session", currentSession);
            fetch(`http://` + $serverIPStore + `:8080/api/sessions/`, {
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
            fetch(`http://` + $serverIPStore + `:8080/api/sessions/${id}`, {
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

    function removeSession(event) {
        const id = event.target.dataset.id;
        const name = event.target.dataset.name;

        let confirmation = window.confirm(`Are you sure you want to remove the session: ${name}?`);
        if (!confirmation) {
            return;
        }

        fetch(`http://` + $serverIPStore + `:8080/api/sessions/${id}`, {
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
        const command = event.detail.command;
        console.log("dispatcher", command);
        if (command === "remove") {
            const itemID = event.detail.id;
            const index = event.detail.index;
            currentSession.Items.splice(index, 1);
            currentSession.Items = currentSession.Items;
            console.log("remove item", itemID);
        } else if (command === "move-up") {
            const index = parseInt(event.detail.index);
            if (index === 0) {
                console.log("already the first");
                return;
            }
            let item = currentSession.Items[index];
            currentSession.Items.splice(index, 1);
            currentSession.Items.splice(index - 1, 0, item);
            currentSession.Items = currentSession.Items;
        } else if (command === "move-down") {
            const index = parseInt(event.detail.index);
            if (index >= currentSession.Items.length - 1) {
                console.log("already the last");
                return;
            }
            let item = currentSession.Items[index];
            currentSession.Items.splice(index, 1);
            currentSession.Items.splice(index + 1, 0, item);
            currentSession.Items = currentSession.Items;
        } else {
            console.log("unknown command on dispatch:", command);
        }
    }

    function importSessions(event) {
    }

    function exportSessions(event) {
    }

    function nextQuestion() {
        currentPresentationItemIndex += 1;
        if (currentPresentationItemIndex >= currentSession.Items.length) {
            currentPresentationItemIndex = currentSession.Items.length - 1;
            console.log("already the last question in the list");
        } else {
            console.log("currentPresentationItem = ", currentPresentationItem);
            currentPresentationItem = currentSession.Items[currentPresentationItemIndex];
        }
    }

    function previousQuestion() {
        currentPresentationItemIndex -= 1;
        if (currentPresentationItemIndex < 0) {
            currentPresentationItemIndex = 0;
            console.log("already the first question in the list");
        } else {
            console.log("currentPresentationItem = ", currentPresentationItem);
            currentPresentationItem = currentSession.Items[currentPresentationItemIndex];
        }
    }
</script>

<style>
    .session-item {
        display: grid;
        grid-template-columns: 5fr 2fr;
        grid-gap: .3rem;
    }

    @media (max-width: 1080px) {
        .session-item {
            grid-template-columns: 50% 50%;
        }
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

    .presentation-label {
        font-weight: normal;
        color: rgba(159, 241, 255, 1);
    }
</style>

<section class="mb4">
    <!-- title and presentation/detailed mode label-->
    {#if currentSession}
        {#if inEditingMode}
            <label for="session-name" class="mb2">Session name:
                <input id="session-name" type="text"
                       bind:value={currentSession.Name}></label>
        {:else}
            <h2 class="h2 m0 mb1 flex flex-wrap justify-between">{currentSession.Name}
                {#if inPresentationMode}
                    <span class="presentation-label">Presentation Mode</span>
                {/if}
            </h2>
        {/if}
    {:else}
        <h2 class="h2 m0 mb1">Choose a session</h2>
    {/if}

    <!-- select field and session control buttons-->
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
            {#if inPresentationMode}
                <button on:click|preventDefault={() => {inPresentationMode = !inPresentationMode}}>Detailed mode
                </button>
            {:else}
                {#if inEditingMode}
                    <button on:click={() => {saveSession(currentSession.ID)}}>Save</button>
                {:else}
                    <button on:click={() => {editSession(currentSession.ID)}}>Edit</button>
                {/if}
                <button on:click|preventDefault={removeSession} data-id="{currentSession.ID}" data-name="{currentSession.Name}">Remove</button>
                <button on:click|preventDefault={addSession}>Add a session</button>
                <button on:click|preventDefault={() => {inPresentationMode = !inPresentationMode}}>Presentation mode
                </button>
            {/if}
        {/if}
        <!--        <button on:click|preventDefault={exportSessions}>Export sessions</button>-->
    {:else}
        <p><em>No sessions found.</em></p>
        <button on:click|preventDefault={addSession}>Add a session</button>
    {/if}
    <!--    <button on:click|preventDefault={importSessions}>Import sessions</button>-->

    <!-- current session list-->
    {#if currentSession && currentSession.Items}
        {#if inPresentationMode && currentSession.Items.length > 0}
            <div class="session-item my2">
                {#if currentPresentationItem && currentPresentationItem.Actions.length > 0}
                    <Instruction item="{currentPresentationItem.Actions[0]}"
                                 name="{currentPresentationItem.Actions[0].SayItem.Phrase}"
                                 index="{currentPresentationItemIndex}" expanded={true}/>
                    <div class="answers">
                        {#each currentPresentationItem.Actions as action, actionIndex}
                            {#if actionIndex > 0}
                                <Instruction item="{action}" index="{currentPresentationItemIndex}"
                                             name="{action.SayItem.Phrase}"/>
                            {/if}
                        {/each}
                    </div>
                {/if}
            </div>
            <button on:click|preventDefault={previousQuestion}>&larr;</button>
            <button on:click|preventDefault={nextQuestion}>&rarr;</button>
        {:else}
            {#each currentSession.Items as item, i}
                {#if inEditingMode}
                    <SessionItemEdit item="{item}" index="{i}" on:message={handleItemEditMessage}/>
                {:else}
                    <div class="session-item my2">
                        {#if item.Actions.length > 0}
                            <Instruction item="{item.Actions[0]}" name="{item.Actions[0].SayItem.Phrase}" index="{i}"
                                         expanded={true}/>
                            <div class="answers">
                                {#each item.Actions as action, actionIndex}
                                    {#if actionIndex > 0}
                                        <Instruction item="{action}" name="{action.SayItem.Phrase}" index="{i}"/>
                                    {/if}
                                {/each}
                            </div>
                        {/if}
                    </div>
                {/if}
            {/each}
        {/if}

        {#if inEditingMode}
            <div><button on:click|preventDefault={addQuestion}>Add a question</button></div>
        {/if}
    {/if}
</section>
