<script>
    import {serverIPStore} from "./stores";
    import Select from 'svelte-select';

    export let moveItem;

    let moves;
    let movesFetchNeeded = true;
    let selectedMove = (moveItem && (moveItem.Name.length > 0 || moveItem.FilePath.length > 0)) ? moveItem : null;

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
            moveItem.Name = selectedMove.Name;
            moveItem.FilePath = selectedMove.FilePath;
            moveItem.Delay = selectedMove.Delay;
            // action.MoveItem.Group = newActionMove.Group;
        }
    }

    function resetMoveItem() {
        if (moveItem) {
            moveItem.Name = "";
            moveItem.FilePath = "";
            moveItem.Delay = 0;
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
        <Select items={moves}
                bind:selectedValue={selectedMove}
                placeholder="Search for a move"
                {groupBy}
                {getOptionLabel}
                {getSelectionLabel}
                on:select={handleMoveSelect}
                on:clear={resetMoveItem}/>
        <label class="my1" for="{moveItem.ID}.MoveItem.Delay">Move delay, s:
            <input type="number" id="{moveItem.ID}.MoveItem.Delay" name="MoveItem.Delay"
                   bind:value={moveItem.Delay}>
        </label>
    </section>
{/if}
