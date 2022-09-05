<script>
    import Instruction from "../Instruction.svelte";
    import EmptyInstruction from "../EmptyInstruction.svelte";

    export let currentPresentationItem,
               currentPresentationItemIndex;
</script>

<style>
    .column {
        padding: 0 !important;
    }
</style>

<div class="ui centered grid" style="margin: 14px 0 14px 0;">
    {#if currentPresentationItem && currentPresentationItem.Actions.length > 0}
    <div class="sixteen wide column">
        <Instruction item="{currentPresentationItem.Actions[0]}"
                    name="{currentPresentationItem.Actions[0].UtteranceItem.Phrase}"
                    index="{currentPresentationItemIndex}"
                    expanded={true}
                    border_radius={currentPresentationItem.Actions.length > 1 ? 'border-radius: 20px 20px 0 0;' : 'border-radius: 20px;'}/>
    </div>
    {#if currentPresentationItem.Actions.length > 1}
        {#each currentPresentationItem.Actions as action, actionIndex}
            {#if actionIndex > 0}
                <div class="eight wide column">
                    <Instruction item="{action}"
                                index="{currentPresentationItemIndex}"
                                name="{action.UtteranceItem.Phrase}"/>
                </div>
            {/if}
        {/each}
    {/if}
    {:else}
    <div class="sixteen wide column">
        <EmptyInstruction index={currentPresentationItemIndex}></EmptyInstruction>
    </div>
    {/if}
</div>
