<script>
    import SessionItemEdit from "./SessionItemEdit.svelte";
    import PresentationMode from "./PresentationMode.svelte";
    import SessionItem from "./SessionItem.svelte";

    export let
        currentSession,
        inEditMode,
        inPresentationMode;
</script>

{#if inPresentationMode && currentSession.Items.length > 0}
    <PresentationMode {currentSession} {inPresentationMode}/>
{:else}
    {#each currentSession.Items as item, i}
        {#if inEditMode}
            <SessionItemEdit item="{item}" index="{i}" bind:currentSession={currentSession}/>
        {:else}
            <SessionItem {item} {inPresentationMode} itemIndex={i}/>
        {/if}
    {/each}
{/if}
