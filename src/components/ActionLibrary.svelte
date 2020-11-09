<script>
    import {slide} from 'svelte/transition';
    import {notify, sendInstruction} from './Helpers.svelte';
    import {serverIPStore} from './stores';
    import ActionItemEdit from "./ActionItemEdit.svelte";
    import Instruction from "./Instruction.svelte";

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

    function removeAction(event) {
        const id = event.target.dataset.id;
        const name = event.target.dataset.name;

        let confirmation = window.confirm(`Are you sure you want to remove the action: ${name}?`);
        if (!confirmation) {
            return;
        }

        fetch(`http://` + $serverIPStore + `:8080/api/actions/${id}`, {
            method: "DELETE"
        })
            .then(response => response.json())
            .then((response) => {
                console.log(response);
                if (response["error"] && response["error"].length > 0) {
                    notify("negative", response["error"]);
                } else {
                    notify("positive", response["message"]);
                    fetchNeeded = true;
                }
            })
            .catch((err) => {
                console.error(err);
                notify("negative", err);
            });
    }
</script>

<style>
    label {
        display: block;
    }

    fieldset {
        border: 4px solid rgba(159, 241, 255, .35);
        border-radius: .5em;
        background: rgba(228, 249, 254, .5);
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

    .actions-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        grid-template-rows: 1fr;
        grid-gap: .3em;
    }

    .action-grid {
        display: grid;
        grid-template-columns: 1fr;
        grid-template-rows: 1fr;
    }
</style>

<section class:mb4={!collapsed}>
    <h2 class="h2 m0 mb1 collapsible" class:collapsed={collapsed}
        on:click|preventDefault={() => {collapsed = !collapsed}}>Quick Actions</h2>
    {#if !collapsed}
        <div transition:slide={{duration: 100}}>
            <div class="mb2">
                {#if !isAddingAction}
                    <button class="m0" on:click|preventDefault={() => {isAddingAction = true;}}>Add an action</button>
                {/if}
                {#if !inEditingMode}
                    <button class="m0" on:click|preventDefault={toggleEditMode}>Edit</button>
                {:else}
                    <button class="m0" on:click|preventDefault={toggleEditMode}>Done</button>
                {/if}
            </div>
            {#if isAddingAction}
                <ActionItemEdit on:message={handleActionItemEditMessage}/>
            {/if}
            {#if actionsByGroups}
                {#each Object.keys(actionsByGroups) as groupName}
                    <h3 class="h4">{groupName}</h3>
                    <div class="actions-grid">
                        {#each actionsByGroups[groupName] as action}
                            <div class="action-grid">
                                <Instruction item="{action}" name="{action.Name}" small="{true}" edit="{inEditingMode}"
                                             expanded={false}/>
                                {#if inEditingMode}
                                    <div>
                                        <button class="m0 mb1" on:click|preventDefault={removeAction}
                                                data-id="{action.ID}" data-name="{action.Name}">
                                            Remove
                                        </button>
                                    </div>
                                {/if}
                            </div>
                        {/each}
                    </div>
                {/each}
            {/if}
        </div>
    {/if}
</section>