<script>
    export let URLItem;

    function removeURL() {
        URLItem.ID = null;
        URLItem.Name = "";
        URLItem.URL = "";
        URLItem.Delay = 0;
        URLItem.Group = "";
    }
</script>

<style>
    input[type=number] {
        width: 5em;
    }
</style>

{#if URLItem}
    <section>
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 3px;">
            <h3 style="margin: 0;">URL</h3>
            <span class="ui labeled input">
                <span class="ui label">URL delay (s):</span>
                <input type="number" id="{URLItem.ID}-UtteranceItem.Delay" placeholder="0" style="padding-top: 8px !important;" bind:value={URLItem.Delay}>
            </span>
        </div>
        <div style="display: flex;">
            <span class="ui labeled input">
                <div class="ui label">Web URL:</div>
                <input type="text" bind:value={URLItem.URL}>
            </span>
            <span style="margin-left: 14px;">
                <button data-tooltip="Remove URL" data-inverted="" data-position="bottom center"
                        class="ui {URLItem.URL ? "" : "disabled "}icon button" on:click|preventDefault={removeURL}><i class="trash icon"></i></button>
            </span>
        </div>
    </section>
{/if}
