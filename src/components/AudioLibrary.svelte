<script>
    import {notify, filterByGroup} from './Helpers.svelte';
    import {serverIPStore} from './stores';
    import CollapsibleLibrary from "./CollapsibleLibrary.svelte";
    import LibraryControls from "./LibraryControls.svelte";
    import AudioItemEdit from "./AudioItemEdit.svelte";
    import AudioSearch from "./AudioSearch.svelte";
    import AudioLibraryGroups from "./AudioLibraryGroups.svelte";

    let inAddMode = false;
    let inEditMode = false;
    let fetchNeeded = true;
    let sounds;
    let audioByGroups;

    $: {
        if (fetchNeeded) {
            fetch(`http://` + $serverIPStore + `:8080/api/audio/`)
                .then(r => r.json())
                .then(d => {
                    sounds = d.data;
                    audioByGroups = filterByGroup(sounds);
                    fetchNeeded = false;
                })
                .catch(err => {
                    console.error("error:", err);
                    fetchNeeded = false;
                });
        }
    }
</script>

<CollapsibleLibrary title="Audio">
    <LibraryControls bind:inAddMode={inAddMode} bind:inEditMode={inEditMode}/>
    {#if inAddMode}
        <AudioItemEdit bind:inAddMode={inAddMode} bind:fetchNeeded={fetchNeeded}/>
    {/if}
    <AudioSearch bind:items={sounds} bind:itemsByGroup={audioByGroups}/>
    <AudioLibraryGroups bind:itemsByGroup={audioByGroups} bind:fetchNeeded={fetchNeeded} {inEditMode}/>
</CollapsibleLibrary>
