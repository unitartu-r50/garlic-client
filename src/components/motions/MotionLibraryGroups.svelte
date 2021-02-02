<script>
    import Instruction from "../Instruction.svelte";
    import {serverIPStore} from "../stores";
    import {notify} from "../Helpers.svelte";

    export let
        itemsByGroup,
        isFetchNeeded,
        inEditMode;

    function removeMove(event) {
        const id = event.target.dataset.id;
        const name = event.target.dataset.name;

        let confirmation = window.confirm(`Are you sure you want to remove the motion: ${name}?`);
        if (!confirmation) {
            return;
        }

        console.log("removing", id);
        fetch(`http://` + $serverIPStore + `:8080/api/moves/${id}`, {
            method: "DELETE",
            headers: {"Content-Type": "application/json"}
        })
            .then(response => response.json())
            .then((response) => {
                console.log(response);
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
            })
    }
</script>

<style>
    .move-group {
        display: grid;
        grid-template-columns: 1fr 1fr;
        grid-gap: .3em;
    }
</style>

{#if itemsByGroup}
    {#each Object.keys(itemsByGroup) as groupName}
        <h3 class="h4">{groupName}</h3>
        <section class="move-group">
            {#each itemsByGroup[groupName] as item}
                <div>
                    <Instruction item={{MoveItem: item}} name={item.Name} small={true} expanded={false} isDraggable={true}/>
                    {#if inEditMode}
                        <div>
                            <button class="m0 mb1" on:click|preventDefault={removeMove} data-id="{item.ID}"
                                    data-name="{item.Name}">Remove
                            </button>
                        </div>
                    {/if}
                </div>
            {/each}
        </section>
    {/each}
{:else}
    <p><em>No motions found.</em></p>
{/if}
