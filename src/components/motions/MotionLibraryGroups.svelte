<script>
    import Instruction from "../Instruction.svelte";
    import { motionsFetchNeeded } from "../stores";
    import {notify} from "../Helpers.svelte";

    export let
        itemsByGroup,
        inEditMode;

    // TODO: Remove
    function removeMove(event) {
        const id = event.target.dataset.id;
        const name = event.target.dataset.name;

        let confirmation = window.confirm(`Are you sure you want to remove the motion: ${name}?`);
        if (!confirmation) {
            return;
        }

        console.log("removing", id);
        fetch(`http://` + window.location.hostname + `:8080/api/motions/${id}`, {
            method: "DELETE",
            headers: {"Content-Type": "application/json"}
        })
            .then(response => response.json())
            .then((response) => {
                if (response["error"] && response["error"].length > 0) {
                    notify("negative", response["error"]);
                } else {
                    notify("positive", response["message"]);
                    $motionsFetchNeeded = true;
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
        grid-template-rows: 1fr;
        grid-gap: .3em;
    }
</style>

{#if itemsByGroup}
    {#each Object.keys(itemsByGroup) as groupName}
        <h4 class="ui header" style="margin: 14px 0 7px 0;">{groupName}</h4>
        <div class="move-group">
            {#each itemsByGroup[groupName] as item}
                <Instruction item={{MotionItem: item}} name={item.Name} small={true} expanded={false} isDraggable={true} inEditMode={inEditMode} isMove={true} border_radius={'border-radius: 20px;'}/>
            {/each}
        </div>
    {/each}
{:else}
    <p><em>No motions found.</em></p>
{/if}
