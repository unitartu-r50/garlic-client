<script>
    import SessionItems from "./SessionItems.svelte";
    import SessionControls from "./SessionControls.svelte";

    export let isFetchNeeded = true;

    let inEditMode = false;
    let currentSession = null;
    let inPresentationMode = true;
    let currentPresentationItem = null;
    let currentPresentationItemIndex = 0;

    $: {
        if (inEditMode) {
            inPresentationMode = false;
        }
        if (currentSession) {
            currentPresentationItem = currentSession.Items[currentPresentationItemIndex];
        }
    }

    function addQuestion() {
        currentSession.Items.push({
            Actions: []
        });
        currentSession.Items = currentSession.Items;
    }    
</script>

<section>
    <SessionControls bind:currentSession={currentSession}
                     bind:inEditMode={inEditMode}
                     bind:inPresentationMode={inPresentationMode}
                     bind:isFetchNeeded={isFetchNeeded}
                     bind:currentPresentationItem={currentPresentationItem}
                     bind:currentPresentationItemIndex={currentPresentationItemIndex}/>
    
    {#if currentSession && currentSession.Items}
        <SessionItems bind:currentSession={currentSession}
                      bind:inEditMode={inEditMode}
                      bind:inPresentationMode={inPresentationMode}
                      {currentPresentationItem}
                      {currentPresentationItemIndex}/>
        {#if inEditMode}
            <div>
                <button on:click|preventDefault={addQuestion}>Add a question</button>
            </div>
        {/if}
    {/if}
    <div class="ui hidden section divider"></div>
</section>
