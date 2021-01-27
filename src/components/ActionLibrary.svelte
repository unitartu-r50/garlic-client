<script>
    import ActionItemEdit from "./ActionItemEdit.svelte";
    import LibraryControls from "./LibraryControls.svelte";
    import ActionLibraryGroups from "./ActionLibraryGroups.svelte";
    import CollapsibleLibrary from "./CollapsibleLibrary.svelte";

    let inEditMode = false;
    let inAddMode = false;
    let fetchNeeded = false;

    function handleCommands(event) {
        switch (event.detail) {
            case "cancel":
            case "finish":
                inAddMode = false;
                break;
            case "fetch":
                fetchNeeded = true;
                break;
            default:
                console.log("unknown command:", event.detail);
        }
    }
</script>

<CollapsibleLibrary title="Quick Actions" isCollapsed={false}>
    <LibraryControls bind:inAddMode={inAddMode} bind:inEditMode={inEditMode}/>
    {#if inAddMode}
        <ActionItemEdit on:command={handleCommands}/>
    {/if}
    <ActionLibraryGroups on:command={handleCommands} inEditMode={inEditMode} isFetchNeeded={fetchNeeded}/>
</CollapsibleLibrary>
