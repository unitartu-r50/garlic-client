<script>
    import Instruction from "../Instruction.svelte";

    export let
        inEditMode,
        isFetchNeeded,
        itemsByGroup;

</script>

<style>
    .actions-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        grid-template-rows: 1fr;
        grid-gap: .3em;
    }
</style>

{#if itemsByGroup}
    {#each Object.keys(itemsByGroup) as groupName}
        <h4 class="ui header" style="margin: 14px 0 7px 0;">{groupName}</h4>
        <div class="actions-grid">
            {#each itemsByGroup[groupName] as action}
                <Instruction item={action} name={action.Name} small={true} expanded={false} inEditMode={inEditMode} bind:isFetchNeeded={isFetchNeeded} border_radius={'border-radius: 20px;'}/>
            {/each}
        </div>
    {/each}
{:else}
    <p><em>No actions found.</em></p>
{/if}
