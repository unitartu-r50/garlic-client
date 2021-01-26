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
        <label class="mb1" for="action-lib-new-url">Web URL:
            <input type="text" id="action-lib-new-url" name="action-lib-new-url"
                   bind:value={URLItem.URL}>
        </label>
        <label class="mb1" for="action-lib-new-url-delay">URL delay, s:
            <input type="number" id="action-lib-new-url-delay" name="action-lib-new-url-delay"
                   bind:value={URLItem.Delay}>
        </label>
    </section>
{/if}
