<script>
    import {filterByGroup} from './Helpers.svelte';
    import {serverIPStore} from './stores';
    import CollapsibleLibrary from "./CollapsibleLibrary.svelte";
    import LibraryControls from "./LibraryControls.svelte";
    import MotionLibraryItemEdit from "./MotionLibraryItemEdit.svelte";
    import MotionSearch from "./MotionSearch.svelte";
    import MotionLibraryGroups from "./MotionLibraryGroups.svelte";

    let inAddMode = false;
    let inEditMode = false;
    let isFetchNeeded = true;
    let items = [];
    let itemsByGroup = null;

    $: {
        if (isFetchNeeded) {
            fetch(`http://` + $serverIPStore + `:8080/api/moves/`)
                .then(r => r.json())
                .then(d => {
                    items = d.data;
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

<CollapsibleLibrary title="Motions">
    <LibraryControls bind:inAddMode={inAddMode} bind:inEditMode={inEditMode}/>
    {#if inAddMode}
        <MotionLibraryItemEdit bind:inAddMode={inAddMode} bind:fetchNeeded={isFetchNeeded}/>
    {/if}
    <MotionSearch bind:items={items} bind:itemsByGroup={itemsByGroup}/>
    <MotionLibraryGroups bind:itemsByGroup={itemsByGroup} bind:isFetchNeeded={isFetchNeeded}
                         {inEditMode}/>
</CollapsibleLibrary>
