<script>
    import {filterByGroup} from "../Helpers.svelte";
    import ActionItemEdit from "./ActionItemEdit.svelte";
    import LibraryControls from "../LibraryControls.svelte";
    import ActionLibraryGroups from "./ActionLibraryGroups.svelte";
    import CollapsibleLibrary from "../CollapsibleLibrary.svelte";
    import Search from "../Search.svelte";

    let inAddMode = false;
    let inEditMode = false;
    let isFetchNeeded = true;
    let items = [];
    let itemsByGroup = null;

    $: if (isFetchNeeded) {
        fetch(`http://` + window.location.hostname + `:8080/api/actions/`)
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

    function search(query) {
        let filteredItems = [];
        for (const item of items) {
            if (item.Name.toLowerCase().includes(query.toLowerCase())) {
                filteredItems.push(item);
            }
        }
        itemsByGroup = filterByGroup(filteredItems);
    }
</script>

<CollapsibleLibrary title="Actions" isCollapsed={false}>
    <LibraryControls bind:inAddMode={inAddMode} bind:inEditMode={inEditMode}/>
    {#if inAddMode}
        <ActionItemEdit bind:inAddMode={inAddMode} bind:fetchNeeded={isFetchNeeded}/>
    {/if}
    <Search {search}/>
    <ActionLibraryGroups bind:isFetchNeeded={isFetchNeeded} bind:itemsByGroup={itemsByGroup} {inEditMode}/>
</CollapsibleLibrary>
