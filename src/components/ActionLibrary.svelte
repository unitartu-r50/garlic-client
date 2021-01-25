<script>
    import {slide} from 'svelte/transition';
    import ActionItemEdit from "./ActionItemEdit.svelte";
    import ActionLibraryControls from "./ActionLibraryControls.svelte";
    import ActionLibraryGroups from "./ActionLibraryGroups.svelte";

    let isCollapsed = false;
    let inEditMode = false;
    let inAddMode = false;
    let fetchNeeded = false;

    function handleModeChange(event) {
        if ('inEditMode' in event.detail) {
            inEditMode = event.detail.inEditMode;
        }
        if ('inAddMode' in event.detail) {
            inAddMode = event.detail.inAddMode;
        }
    }

    function handleCommands(event) {
        console.log("handleCommands:", event.detail);
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

<style>
    label {
        display: block;
    }

    .collapsible {
        cursor: pointer;
        transition: all .2s;
    }

    .collapsible:hover, .collapsible:active {
        color: rgb(80, 228, 253);
    }

    .collapsible::before {
        content: "–";
        margin-right: .3em;
        color: rgba(159, 241, 255, 1);
    }

    .collapsed::before {
        content: "+";
        margin-right: .2em;
        color: rgba(159, 241, 255, 1);
    }
</style>

<section class:mb4={!isCollapsed}>
    <h2 class="h2 m0 mb1 collapsible" class:collapsed={isCollapsed}
        on:click|preventDefault={() => {isCollapsed = !isCollapsed}}>Quick Actions</h2>
    {#if !isCollapsed}
        <div transition:slide={{duration: 100}}>
            <ActionLibraryControls on:modeChanged={handleModeChange} inAddMode={inAddMode} inEditMode={inEditMode}/>
            {#if inAddMode}
                <ActionItemEdit on:command={handleCommands}/>
            {/if}
            <ActionLibraryGroups on:command={handleCommands} inEditMode={inEditMode} isFetchNeeded={fetchNeeded}/>
        </div>
    {/if}
</section>
