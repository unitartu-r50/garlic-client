<script>
    import ActionItemEdit from "./ActionItemEdit.svelte";
    import LibraryControls from "./LibraryControls.svelte";
    import ActionLibraryGroups from "./ActionLibraryGroups.svelte";
    import CollapsibleLibrary from "./CollapsibleLibrary.svelte";
    import {serverIPStore} from "./stores";
    import {filterByGroup} from "./Helpers.svelte";

    let inAddMode = false;
    let inEditMode = false;
    let isFetchNeeded = true;
    let itemsByGroup = null;

    $: {
        if (isFetchNeeded) {
            fetch(`http://` + $serverIPStore + `:8080/api/actions/`)
                .then(r => r.json())
                .then(d => {
                    itemsByGroup = filterByGroup(d.data);
                    isFetchNeeded = false;
                })
                .catch(err => {
                    console.error("error:", err);
                    isFetchNeeded = false;
                });
        }
    }
</script>

<CollapsibleLibrary title="Quick Actions" isCollapsed={false}>
    <LibraryControls bind:inAddMode={inAddMode} bind:inEditMode={inEditMode}/>
    {#if inAddMode}
        <ActionItemEdit bind:inAddMode={inAddMode} bind:fetchNeeded={isFetchNeeded}/>
    {/if}
    <ActionLibraryGroups bind:isFetchNeeded={isFetchNeeded} bind:itemsByGroup={itemsByGroup} {inEditMode}/>
</CollapsibleLibrary>
