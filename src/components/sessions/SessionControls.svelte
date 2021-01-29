<script>
    import {serverIPStore} from "../stores";
    import {notify} from "../Helpers.svelte";

    export let
        inPresentationMode,
        inEditMode,
        currentSession,
        sessions,
        fetchNeeded;

    function add() {
        let session = {
            "Name": "New Session",
            "Items": [{
                "Actions": [],
            }]
        };
        currentSession = session;
        sessions.push(session);
        sessions = sessions;
        inEditMode = true;
    }

    function save() {
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
                    inEditMode = false;
                    fetchNeeded = true;
                })
                .catch(err => {
                    console.error(err);
                    notify("negative", err);
                    inEditMode = false;
                    fetchNeeded = true;
                })
        } else {
            console.log("saving session", currentSession);
            fetch(`http://` + $serverIPStore + `:8080/api/sessions/${currentSession["ID"]}`, {
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
                    inEditMode = false;
                    fetchNeeded = true;
                })
                .catch(err => {
                    console.error(err);
                    notify("negative", err);
                    inEditMode = false;
                    fetchNeeded = true;
                })
        }
    }

    function edit() {
        inEditMode = true;
        inPresentationMode = false;
    }

    function remove() {
        let confirmation = window.confirm(`Are you sure you want to remove the session: ${currentSession.Name}?`);
        if (!confirmation) {
            return;
        }

        fetch(`http://` + $serverIPStore + `:8080/api/sessions/${currentSession.ID}`, {
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
                inEditMode = false;
                currentSession = null;
                sessions = [];
                fetchNeeded = true;
            })
            .catch(err => {
                console.error(err);
                notify("negative", err);
            })
    }
</script>


<select name="sessions" id="sessions" class="m0" bind:value={currentSession} on:blur={() => {inEditMode = false}}>
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
        {#if inEditMode}
            <button on:click={save}>Save</button>
        {:else}
            <button on:click={edit}>Edit</button>
        {/if}
        <button on:click|preventDefault={remove} data-id="{currentSession.ID}"
                data-name="{currentSession.Name}">Remove
        </button>
        <button on:click|preventDefault={add}>Add a session</button>
        <button on:click|preventDefault={() => {inPresentationMode = !inPresentationMode}}>Presentation mode
        </button>
    {/if}
{/if}
