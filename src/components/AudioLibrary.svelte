<script>
    import {filterByGroup} from './Helpers.svelte';
    import {serverIPStore} from './stores';
    import CollapsibleLibrary from "./CollapsibleLibrary.svelte";
    import LibraryControls from "./LibraryControls.svelte";
    import AudioItemEdit from "./AudioItemEdit.svelte";
    import AudioSearch from "./AudioSearch.svelte";
    import AudioLibraryGroups from "./AudioLibraryGroups.svelte";

    let inAddMode = false;
    let inEditMode = false;
    let isFetchNeeded = true;
    let items = [];
    let itemsByGroup = null;

    $: {
        if (isFetchNeeded) {
            fetch(`http://` + $serverIPStore + `:8080/api/audio/`)
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

<CollapsibleLibrary title="Audio">
    <LibraryControls bind:inAddMode={inAddMode} bind:inEditMode={inEditMode}/>
    {#if inAddMode}
        <AudioItemEdit bind:inAddMode={inAddMode} bind:fetchNeeded={isFetchNeeded}/>
    {/if}
    <AudioSearch bind:items={items} bind:itemsByGroup={itemsByGroup}/>
    <AudioLibraryGroups bind:itemsByGroup={itemsByGroup} bind:isFetchNeeded={isFetchNeeded} {inEditMode}/>
</CollapsibleLibrary>
