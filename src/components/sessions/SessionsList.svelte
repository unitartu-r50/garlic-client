<script>
    import {serverIPStore} from '../stores';
    import SessionTitle from "./SessionTitle.svelte";
    import SessionControls from "./SessionControls.svelte";
    import SessionItems from "./SessionItems.svelte";

    let sessions = [];
    let fetchNeeded = true;
    let currentSession;
    let inEditMode = false;
    let inPresentationMode = true;

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

        if (inEditMode) {
            inPresentationMode = false;
        }
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
        inEditMode = true;
    }


</script>

<style>
    button {
        margin: 0;
    }
</style>

<section class="mb4">
    {#if currentSession}
        <SessionTitle bind:title={currentSession.Name} {inEditMode} {inPresentationMode}/>
    {:else}
        <SessionTitle title="No session is selected" {inEditMode} {inPresentationMode}/>
    {/if}

    {#if sessions && sessions.length > 0}
        <SessionControls bind:sessions={sessions}
                         bind:currentSession={currentSession}
                         bind:inEditMode={inEditMode}
                         bind:inPresentationMode={inPresentationMode}
                         bind:fetchNeeded={fetchNeeded}/>

    {:else}
        <p><em>No sessions found.</em></p>
        <button on:click|preventDefault={addSession}>Add a session</button>
    {/if}

    {#if currentSession && currentSession.Items}
        <SessionItems bind:currentSession={currentSession}
                      bind:inEditMode={inEditMode}
                      bind:inPresentationMode={inPresentationMode}/>
        {#if inEditMode}
            <div>
                <button on:click|preventDefault={addQuestion}>Add a question</button>
            </div>
        {/if}
    {/if}
</section>
