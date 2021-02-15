<script>
    export let URLItem;
</script>

<style>
    input[type=number] {
        width: 5em;
    }

    label {
        display: block;
    }
</style>

{#if URLItem}
    <section>
        <h3 class="h4 m0 mb2">Show URL</h3>
        <label class="mb1" for="{URLItem.ID}.URL">Web URL:
            <input type="text" id="{URLItem.ID}.URL"
                   bind:value={URLItem.URL}>
        </label>
        <label class="mb1" for="{URLItem.ID}.Delay">URL delay, s:
            <input type="number" id="{URLItem.ID}.Delay"
                   bind:value={URLItem.Delay}>
        </label>
    </section>
{/if}
