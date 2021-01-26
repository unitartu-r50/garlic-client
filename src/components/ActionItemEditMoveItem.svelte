<script>
    import {serverIPStore} from "./stores";
    import Select from 'svelte-select';

    export let moveItem;

    let moves;
    let movesFetchNeeded = true;
    let newActionMove;

    $: {
        if (movesFetchNeeded) {
            fetch(`http://` + $serverIPStore + `:8080/api/moves/`)
                .then(r => r.json())
                .then(d => {
                    moves = d.data;
                    movesFetchNeeded = false;
                })
                .catch(err => {
                    console.error("error:", err);
                    movesFetchNeeded = false;
                });
        }
    }

    // Select extensions
    const groupBy = (option) => option.Group;
    const getOptionLabel = (option) => option.Name;
    const getSelectionLabel = (option) => option.Name;

    function handleMoveSelect() {
        if (moveItem) {
            moveItem.Name = newActionMove.Name;
            moveItem.FilePath = newActionMove.FilePath;
            moveItem.Delay = newActionMove.Delay;
            // action.MoveItem.Group = newActionMove.Group;
        }
    }

    function resetMoveItem() {
        if (moveItem) {
            moveItem.Name = "";
            moveItem.FilePath = "";
            // action.MoveItem.Group = "";
        }
    }
</script>

<style>
    .searchable-select {
        --border: 1px solid rgb(185, 185, 185);
        --borderFocusColor: rgb(120, 120, 120);
        --borderHoverColor: rgb(120, 120, 120);
        --inputPadding: .5em;
        --placeholderColor: rgb(169, 169, 169);
        --borderRadius: 0;
    }

    input[type=number] {
        width: 5em;
    }

    label {
        display: block;
    }
</style>

{#if moveItem}
    <section class="mb3 searchable-select">
        <h3 class="h4 m0 mb2">Move</h3>
        <Select items={moves} bind:selectedValue={newActionMove} placeholder="Search for a move"
                {groupBy} {getOptionLabel} {getSelectionLabel} on:select={handleMoveSelect}
                on:clear={resetMoveItem}></Select>
        <label class="my1" for="{moveItem.ID}-delay">Move delay, s:
            <input type="number" id="{moveItem.ID}-delay" name="action-lib-new-move-delay"
                   bind:value={moveItem.Delay}>
        </label>
    </section>
{/if}
