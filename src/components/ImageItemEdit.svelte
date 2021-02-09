<script>
    export let imageItem;
</script>

<style>
    input[type=number] {
        width: 5em;
    }

    label {
        display: block;
    }
</style>

{#if imageItem}
    <section class="mb3">
        <h3 class="h4 m0 mb2">Show image</h3>
        <label class="mb1" for="{imageItem.ID}-ImageItem.FilePath">Image file:
            <span class="h6">{imageItem.FilePath}</span>
            <input type="file" id="{imageItem.ID}-ImageItem.FilePath" accept="image/*">
        </label>
        <label class="mb1" for="{imageItem.ID}-ImageItem.Delay">Image delay, s:
            <input type="number" id="{imageItem.ID}-ImageItem.Delay" name="ImageItem.Delay"
                   bind:value={imageItem.Delay}>
        </label>
    </section>
{/if}
