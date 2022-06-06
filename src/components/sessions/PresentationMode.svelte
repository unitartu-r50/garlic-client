<script>
    import Instruction from "../Instruction.svelte";
    import EmptyInstruction from "../EmptyInstruction.svelte";

    export let inPresentationMode,
               currentPresentationItem,
               currentPresentationItemIndex;
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
                     name="{currentPresentationItem.Actions[0].UtteranceItem.Phrase}"
                     index="{currentPresentationItemIndex}"
                     expanded={true}
                     clickTracking={!inPresentationMode}/>
        {#if currentPresentationItem.Actions.length > 1}
            <div class="answers">
                {#each currentPresentationItem.Actions as action, actionIndex}
                    {#if actionIndex > 0}
                        <Instruction item="{action}"
                                    index="{currentPresentationItemIndex}"
                                    name="{action.UtteranceItem.Phrase}"
                                    clickTracking={!inPresentationMode}/>
                    {/if}
                {/each}
            </div>
        {/if}
    {:else}
        <EmptyInstruction index={currentPresentationItemIndex}></EmptyInstruction>
    {/if}
</div>
