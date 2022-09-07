<script>
    import {filterByGroup, notify} from '../Helpers.svelte';
    import CollapsibleLibrary from "../CollapsibleLibrary.svelte";
    import LibraryControls from "../LibraryControls.svelte";
    import MotionLibraryItemEdit from "./MotionLibraryItemEdit.svelte";
    import Search from "../Search.svelte";
    import MotionLibraryGroups from "./MotionLibraryGroups.svelte";
    import { motionsFetchNeeded, motions } from '../stores'

    let inAddMode = false;
    let inEditMode = false;
    let itemsByGroup = null;

    $: if (inAddMode) {
        notify("negative", "Adding motions is not yet supported!");
    }

    $: if ($motionsFetchNeeded) {
        fetch(`http://` + window.location.hostname + `:8080/api/motions/`)
            .then(r => r.json())
            .then(d => {
                $motions = d.motions;
                itemsByGroup = filterByGroup(d.motions);
                $motionsFetchNeeded = false;
            })
            .catch(err => {
                console.error("error:", err);
                $motionsFetchNeeded = false;
            });
    }

    function search(query) {
        let filteredItems = [];
        for (const item of $motions) {
            if (item.Name.toLowerCase().includes(query.toLowerCase())) {
                filteredItems.push(item);
            }
        }
        itemsByGroup = filterByGroup(filteredItems);
    }
</script>

<CollapsibleLibrary title="Motions">
    {#if inAddMode}
        <MotionLibraryItemEdit bind:inAddMode={inAddMode} search={search}/>
    {/if}
    <div style="display: flex; flex-wrap: wrap;">
        <LibraryControls bind:inAddMode={inAddMode} bind:inEditMode={inEditMode}/>
        <Search {search}/>
    </div>
    <MotionLibraryGroups bind:itemsByGroup={itemsByGroup} {inEditMode}/>
</CollapsibleLibrary>
