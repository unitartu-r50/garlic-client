<script>
    import {notify} from "../Helpers.svelte";
    import Instruction from "../Instruction.svelte";

    export let
        inEditMode,
        isFetchNeeded,
        itemsByGroup;

    function removeAction(event) {
        const id = event.target.dataset.id;
        const name = event.target.dataset.name;

        let confirmation = window.confirm(`Are you sure you want to remove the action: ${name}?`);
        if (!confirmation) {
            return;
        }

        fetch(`http://` + window.location.hostname + `:8080/api/actions/${id}`, {
            method: "DELETE"
        })
            .then(response => response.json())
            .then((response) => {
                console.log("server response:", response);
                if (response["error"] && response["error"].length > 0) {
                    notify("negative", response["error"]);
                } else {
                    notify("positive", response["message"]);
                    isFetchNeeded = true;
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

{#if itemsByGroup}
    {#each Object.keys(itemsByGroup) as groupName}
        <h3 class="h4">{groupName}</h3>
        <div class="actions-grid">
            {#each itemsByGroup[groupName] as action}
                <div class="action-grid">
                    <Instruction item={action} name={action.Name} small={true} expanded={false}/>
                    {#if inEditMode}
                        <div>
                            <button class="m0 mb1" on:click|preventDefault={removeAction} data-id="{action.ID}"
                                    data-name="{action.Name}">Remove
                            </button>
                        </div>
                    {/if}
                </div>
            {/each}
        </div>
    {/each}
{:else}
    <p><em>No actions found.</em></p>
{/if}
