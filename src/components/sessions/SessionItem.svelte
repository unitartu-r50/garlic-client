<script>
    import Instruction from "../Instruction.svelte";
    import EmptyInstruction from "../EmptyInstruction.svelte";

    export let item,
               itemIndex;
</script>

<style>
    .column {
        padding: 0 !important;
    }
</style>

<div class="ui centered grid" style="margin: 14px 0;">
    {#if item.Actions.length > 0}
    <div class="sixteen wide column">
        <Instruction item="{item.Actions[0]}"
                     name="{item.Actions[0].UtteranceItem.Phrase}"
                     index="{itemIndex}"
                     expanded={true}
                     border_radius={item.Actions.length > 1 ? 'border-radius: 20px 20px 0 0;' : 'border-radius: 20px;'}/>
    </div>
        {#each item.Actions as action, actionIndex}
            {#if actionIndex > 0}
            <div class="eight wide column">
                <Instruction item="{action}"
                                name="{action.UtteranceItem.Phrase}"
                                index="{itemIndex}"/>
            </div>
            {/if}
        {/each}
    {:else}
    <div class="sixteen wide column">
        <EmptyInstruction index={itemIndex}></EmptyInstruction>
    </div>
    {/if}
</div>
{#if item.Actions.length > 1}
<div class="ui hidden divider"></div>
{/if}
