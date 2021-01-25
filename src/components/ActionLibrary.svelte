<script>
    import {slide} from 'svelte/transition';
    import {notify, sendInstruction} from './Helpers.svelte';
    import {serverIPStore} from './stores';
    import ActionItemEdit from "./ActionItemEdit.svelte";
    import ActionLibraryControls from "./ActionLibraryControls.svelte";
    import ActionLibraryGroups from "./ActionLibraryGroups.svelte";

    let actions = [];
    let groups = [];
    let actionsByGroups = {};
    let isCollapsed = false;
    let inEditMode = false;
    let inAddMode = false;
    let isLoading = true;

    let fetchNeeded = true;
    $: {
        if (fetchNeeded) {
            fetch(`http://` + $serverIPStore + `:8080/api/actions/`)
                .then(r => r.json())
                .then(d => {
                    actions = d.data;
                    populateGroups(actions);
                    populateActionsByGroups(actions, groups);
                    fetchNeeded = false;
                    isLoading = false;
                })
                .catch(err => {
                    console.error("error:", err);
                    fetchNeeded = false;
                    isLoading = false;
                });
        }
    }

    function populateGroups(actions) {
        groups = [];
        if (!actions || actions.length === 0) {
            return;
        }
        let localGroups = new Set();
        for (const action of actions) {
            localGroups.add(action.Group);
        }
        groups = localGroups;
    }

    function populateActionsByGroups(actions, groups) {
        actionsByGroups = {};
        if (!actions || actions.length === 0 || !groups || groups.length === 0) {
            return;
        }
        for (const group of groups) {
            actionsByGroups[group] = actions.filter(item => item.Group === group);
        }
    }

    function handleModeChange(event) {
        if ('inEditMode' in event.detail) {
            inEditMode = event.detail.inEditMode;
        }
        if ('inAddMode' in event.detail) {
            inAddMode = event.detail.inAddMode;
        }
    }

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
            {#if isLoading}
                <p>Loading...</p>
            {:else}
                <ActionLibraryGroups on:command={handleCommands} actionsByGroups={actionsByGroups} inEditMode={inEditMode}/>
            {/if}
        </div>
    {/if}
</section>
