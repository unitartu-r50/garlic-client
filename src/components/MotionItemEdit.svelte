<script>
    import Select from 'svelte-select';
    import { motionsFetchNeeded, motions } from './stores'

    export let motionItem;

    let selectedMove = (motionItem && (motionItem.Name.length > 0 || motionItem.FilePath.length > 0)) ? motionItem : null;

    // Select extensions
    const groupBy = (option) => option.Group;
    const getOptionLabel = (option) => option.Name;
    const getSelectionLabel = (option) => option.Name;

    function handleMoveSelect() {
        if (motionItem) {
            motionItem.Name = selectedMove.Name;
            motionItem.FilePath = selectedMove.FilePath;
            motionItem.Delay = selectedMove.Delay;
            // action.MotionItem.Group = newActionMove.Group;
        }
    }

    function resetMotionItem() {
        if (motionItem) {
            motionItem.Name = "";
            motionItem.FilePath = "";
            motionItem.Delay = 0;
            // action.MotionItem.Group = "";
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

{#if motionItem}
    <section class="mb3 searchable-select">
        <h3 class="h4 m0 mb2">Move</h3>
        <Select items={$motions}
                bind:value={selectedMove}
                placeholder="Search for a move"
                {groupBy}
                {getOptionLabel}
                {getSelectionLabel}
                on:select={handleMoveSelect}
                on:clear={resetMotionItem}/>
        <label class="my1" for="{motionItem.ID}.MotionItem.Delay">Move delay, s:
            <input type="number" id="{motionItem.ID}.MotionItem.Delay" name="MotionItem.Delay"
                   bind:value={motionItem.Delay}>
        </label>
    </section>
{/if}
