<script>
    import {serverIPStore} from '../stores';
    import SessionTitle from "./SessionTitle.svelte";
    import SessionItems from "./SessionItems.svelte";
    import SessionControls from "./SessionControls.svelte";

    export let isFetchNeeded = true;

    let sessions = [];
    let currentSession;
    let currentSessionIndex = window.localStorage.getItem("currentSessionIndex") ? window.localStorage.getItem("currentSessionIndex") : 0;
    let inEditMode = false;
    let inPresentationMode = true;

    $: if (sessions && sessions.length - 1 >= currentSessionIndex) {
        currentSession = sessions[currentSessionIndex];
        window.localStorage.setItem("currentSessionIndex", currentSessionIndex);
    }

    $: {
        if (isFetchNeeded) {
            fetch(`http://` + $serverIPStore + `:8080/api/sessions/`)
                .then(r => r.json())
                .then(d => {
                    sessions = d.data;
                    isFetchNeeded = false;
                    if (!currentSession) {
                        currentSession = sessions[currentSessionIndex];
                    }
                })
                .catch(err => {
                    console.error("error:", err);
                    isFetchNeeded = false;
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

    <SessionControls bind:sessions={sessions}
                     bind:currentSession={currentSession}
                     bind:currentSessionIndex={currentSessionIndex}
                     bind:inEditMode={inEditMode}
                     bind:inPresentationMode={inPresentationMode}
                     bind:isFetchNeeded={isFetchNeeded}/>

    {#if !sessions && sessions.length === 0}
        <p><em>No sessions found.</em></p>
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
