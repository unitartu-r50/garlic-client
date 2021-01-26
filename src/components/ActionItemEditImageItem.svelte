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
        <label class="mb1" for="action-lib-new-image-file">Image file:
            <span class="h6">{imageItem.FilePath}</span>
            <input type="file" id="action-lib-new-image-file" accept="image/*">
        </label>
        <label class="mb1" for="action-lib-new-image-delay">Image delay, s:
            <input type="number" id="action-lib-new-image-delay" name="action-lib-new-image-delay"
                   bind:value={imageItem.Delay}>
        </label>
    </section>
{/if}
