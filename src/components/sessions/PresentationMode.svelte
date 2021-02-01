<script>
    import Instruction from "../Instruction.svelte";

    export let
        currentSession,
        inPresentationMode;

    let currentPresentationItem;
    let currentPresentationItemIndex = 0;

    $: if (currentSession) {
        currentPresentationItem = currentSession.Items[currentPresentationItemIndex];
    }

    function nextQuestion() {
        currentPresentationItemIndex += 1;
        if (currentPresentationItemIndex >= currentSession.Items.length) {
            currentPresentationItemIndex = currentSession.Items.length - 1;
            console.log("already the last question in the list");
            return;
        }
        currentPresentationItem = currentSession.Items[currentPresentationItemIndex];
    }

    function previousQuestion() {
        currentPresentationItemIndex -= 1;
        if (currentPresentationItemIndex < 0) {
            currentPresentationItemIndex = 0;
            console.log("already the first question in the list");
            return;
        }
        currentPresentationItem = currentSession.Items[currentPresentationItemIndex];
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

    .answers {
        display: grid;
        grid-template-rows: 1fr 1fr;
        grid-gap: .3rem;
    }
</style>

<div class="session-item my2">
    {#if currentPresentationItem && currentPresentationItem.Actions.length > 0}
        <Instruction item="{currentPresentationItem.Actions[0]}"
                     name="{currentPresentationItem.Actions[0].SayItem.Phrase}"
                     index="{currentPresentationItemIndex}"
                     expanded={true}
                     clickTracking={!inPresentationMode}/>
        <div class="answers">
            {#each currentPresentationItem.Actions as action, actionIndex}
                {#if actionIndex > 0}
                    <Instruction item="{action}"
                                 index="{currentPresentationItemIndex}"
                                 name="{action.SayItem.Phrase}"
                                 clickTracking={!inPresentationMode}/>
                {/if}
            {/each}
        </div>
    {/if}
</div>
<button on:click|preventDefault={previousQuestion}>&larr;</button>
<button on:click|preventDefault={nextQuestion}>&rarr;</button>
