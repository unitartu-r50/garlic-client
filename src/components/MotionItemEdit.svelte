<script>
    import Select from 'svelte-select';
    import { motionsFetchNeeded, motions } from './stores'

    export let motionItem;

    let motions_list = [];
    for (let index = 0; index < $motions.length; index++) {
        motions_list.push({value: index, label: $motions.at(index).Name, group: $motions.at(index).Group})
    }

    let selectedMove = (motionItem && (motionItem.Name.length > 0 || motionItem.FilePath.length > 0)) ? {value: $motions.indexOf(motionItem), label: motionItem.Name} : null;
    const groupBy = (option) => option.group;

    function handleMoveSelect() {
        console.log(selectedMove);
        motionItem = $motions.at(selectedMove.value);
    }

    function removeMotionItem() {
        motionItem.ID = null;
        motionItem.Name = "";
        motionItem.FilePath = "";
        motionItem.Group = "";
        motionItem.Delay = 0;
    }
</script>

<style>

    input[type=number] {
        width: 5em;
    }

    label {
        display: block;
    }
</style>

{#if motionItem}
    <section>
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 3px;">
            <h3 style="margin: 0;">Motion</h3>
            <span class="ui labeled input">
                <span class="ui label">Motion delay (s):</span>
                <input type="number" id="{motionItem.ID}.UtteranceItem.Delay" placeholder="0" style="padding-top: 8px !important;" bind:value={motionItem.Delay}>
            </span>
        </div>
        <Select items={motions_list} bind:value={selectedMove} placeholder="Search for a move" {groupBy} on:select={handleMoveSelect} on:clear={removeMotionItem}/>
        <label class="my1" for="{motionItem.ID}.MotionItem.Delay">Move delay, s:
            <input type="number" id="{motionItem.ID}.MotionItem.Delay" name="MotionItem.Delay"
                   bind:value={motionItem.Delay}>
        </label>
    </section>
{/if}
