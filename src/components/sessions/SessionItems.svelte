<script>
    import SessionItemEdit from "./SessionItemEdit.svelte";
    import PresentationMode from "./PresentationMode.svelte";
    import SessionItem from "./SessionItem.svelte";

    export let currentSession,
               inEditMode,
               inPresentationMode,
               currentPresentationItem,
               currentPresentationItemIndex;
</script>

{#if inPresentationMode && currentSession.Items.length > 0}
    <PresentationMode {inPresentationMode} {currentPresentationItem} {currentPresentationItemIndex}/>
{:else}
    {#each currentSession.Items as item, i}
        {#if inEditMode}
            <SessionItemEdit item="{item}" index="{i}" bind:currentSession={currentSession}/>
        {:else}
            <SessionItem {item} {inPresentationMode} itemIndex={i}/>
        {/if}
    {/each}
{/if}
