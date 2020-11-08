<script>
    import {slide} from 'svelte/transition';
    import {notify, sendInstruction} from './Helpers.svelte';
    import {serverIPStore} from './stores';
    import ActionItemEdit from "./ActionItemEdit.svelte";

    let actions = [];
    let groups = [];
    let actionsByGroups = {};
    let collapsed = false;
    let inEditingMode = false;
    let isAddingAction = false;

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
                })
                .catch(err => {
                    console.error("error:", err);
                    fetchNeeded = false;
                });
        }
    }

    function populateGroups(actions) {
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
        if (!actions || actions.length === 0 || !groups || groups.length === 0) {
            return;
        }
        actionsByGroups = {};
        for (const group of groups) {
            actionsByGroups[group] = actions.filter(item => item.Group === group);
        }
    }

    function toggleEditMode() {
        inEditingMode = !inEditingMode;
    }

    function handleActionItemEditMessage(event) {
        const command = event.detail.command;
        console.log("dispatcher", command);
        if (command === "add") {
            isAddingAction = false;
        } else if (command === "cancel" || command === "edit_done") {
            isAddingAction = false;
        } else if (command === "fetch") {
            fetchNeeded = true;
        } else {
            console.log("unknown command on dispatch:", command);
        }
    }
</script>

<style>
    .audio-group {
        display: grid;
        grid-template-columns: 1fr 1fr;
        grid-gap: .3em;
    }

    label {
        display: block;
    }

    fieldset {
        border: 4px solid rgba(159, 241, 255, .35);
        border-radius: .5em;
        background: rgba(228, 249, 254, .5);
    }

    .icon {
        height: 1em;
    }

    .collapsible {
        cursor: pointer;
        transition: all .2s;
    }

    .collapsible:hover, collapsible:active {
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

<section class:mb4={!collapsed}>
    <h2 class="h2 m0 mb1 collapsible" class:collapsed={collapsed}
        on:click|preventDefault={() => {collapsed = !collapsed}}>Action Library</h2>
    {#if !collapsed}
        <div transition:slide={{duration: 100}}>
            {#if !isAddingAction}
                <button class="m0" on:click|preventDefault={() => {isAddingAction = true;}}>Add an action</button>
            {/if}
            {#if !inEditingMode}
                <button class="m0" on:click|preventDefault={toggleEditMode}>Edit</button>
            {:else}
                <button class="m0" on:click|preventDefault={toggleEditMode}>Done</button>
            {/if}
            {#if isAddingAction}
                <ActionItemEdit on:message={handleActionItemEditMessage}/>
            {/if}
            <ul>
                {#each actions as action}
                    <li>
                        <div>{action.SayItem.Phrase}</div>
                        <div>{action.MoveItem.Name}</div>
                        <div>{action.ImageItem.Name}</div>
                    </li>
                    <hr/>
                {/each}
            </ul>
        </div>
    {/if}
</section>