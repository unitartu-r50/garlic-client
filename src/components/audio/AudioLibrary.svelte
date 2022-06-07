<script>
    import {filterByGroup} from '../Helpers.svelte';
    import CollapsibleLibrary from "../CollapsibleLibrary.svelte";
    import LibraryControls from "../LibraryControls.svelte";
    import AudioItemEdit from "./AudioItemEdit.svelte";
    import Search from "../Search.svelte";
    import AudioLibraryGroups from "./AudioLibraryGroups.svelte";

    let inAddMode = false;
    let inEditMode = false;
    let isFetchNeeded = true;
    let items = [];
    let itemsByGroup = null;

    $: {
        if (isFetchNeeded) {
            fetch(`http://` + window.location.hostname + `:8080/api/audio/`)
                .then(r => r.json())
                .then(d => {
                    items = d.audio_shortcuts;
                    itemsByGroup = filterByGroup(d.audio_shortcuts);
                    isFetchNeeded = false;
                })
                .catch(err => {
                    console.error("error:", err);
                    isFetchNeeded = false;
                });
        }
    }

    function search(query) {
        let filteredItems = [];
        for (const item of items) {
            if (item.Phrase.toLowerCase().includes(query.toLowerCase())) {
                filteredItems.push(item);
            }
        }
        itemsByGroup = filterByGroup(filteredItems);
    }
</script>

<CollapsibleLibrary title="Audio">
    <LibraryControls bind:inAddMode={inAddMode} bind:inEditMode={inEditMode}/>
    {#if inAddMode}
        <AudioItemEdit bind:inAddMode={inAddMode} bind:fetchNeeded={isFetchNeeded}/>
    {/if}
    <Search {search}/>
    <AudioLibraryGroups bind:itemsByGroup={itemsByGroup} bind:isFetchNeeded={isFetchNeeded} {inEditMode}/>
</CollapsibleLibrary>
