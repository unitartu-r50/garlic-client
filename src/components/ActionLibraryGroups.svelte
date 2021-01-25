<script>
    import {createEventDispatcher} from 'svelte';
    import {serverIPStore} from "./stores";
    import {notify} from "./Helpers.svelte";
    import Instruction from "./Instruction.svelte";

    const dispatch = createEventDispatcher();

    export let
        actionsByGroups = {},
        inEditMode = false;

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
                    dispatch("command", "fetch");
                }
            })
            .catch((err) => {
                console.error(err);
                notify("negative", err);
            });
    }
</script>

<style>
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

{#each Object.keys(actionsByGroups) as groupName}
    <h3 class="h4">{groupName}</h3>
    <div class="actions-grid">
        {#each actionsByGroups[groupName] as action}
            <div class="action-grid">
                <Instruction item="{action}" name="{action.Name}" small="{true}" expanded={false}/>
                {#if inEditMode}
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
