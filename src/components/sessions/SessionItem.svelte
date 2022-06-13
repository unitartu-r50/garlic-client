<script>
    import Instruction from "../Instruction.svelte";
    import EmptyInstruction from "../EmptyInstruction.svelte";

    export let
        item,
        itemIndex,
        inPresentationMode;
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
    {#if item.Actions.length > 0}
        <Instruction item="{item.Actions[0]}"
                     name="{item.Actions[0].UtteranceItem.Phrase}"
                     index="{itemIndex}"
                     expanded={true}
                     clickTracking={!inPresentationMode}/>
        <div class="answers">
            {#each item.Actions as action, actionIndex}
                {#if actionIndex > 0}
                    <Instruction item="{action}"
                                 name="{action.UtteranceItem.Phrase}"
                                 index="{itemIndex}"
                                 clickTracking={!inPresentationMode}/>
                {/if}
            {/each}
        </div>
    {:else}
        <EmptyInstruction index={itemIndex}></EmptyInstruction>
    {/if}
</div>
