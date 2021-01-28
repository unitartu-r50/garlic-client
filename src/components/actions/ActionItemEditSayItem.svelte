<script>
    export let sayItem;
</script>

<style>
    label {
        display: block;
    }

    input[type=number] {
        width: 5em;
    }
</style>

{#if sayItem}
    <section class="mb3">
        <h3 class="h4 m0 mb2">Say</h3>
        <label class="mb1" for="action-lib-new-audio-phrase">Phrase
            <input id="action-lib-new-audio-phrase" type="text" bind:value={sayItem.Phrase}>
        </label>
        <!--                            <label class="mb1" for="action-lib-new-audio-group">Group-->
        <!--                                <input id="action-lib-new-audio-group" type="text" bind:value={sayItem.Group}>-->
        <!--                            </label>-->
        <label class="mb1" for="action-lib-new-audio-file">Audio file
            <input id="action-lib-new-audio-file" type="file" accept="audio/*">
        </label>
        <label class="mb1" for="action-lib-new-audio-delay">Audio delay, s:
            <input type="number" id="action-lib-new-audio-delay" name="action-lib-new-audio-delay"
                   bind:value={sayItem.Delay}>
        </label>
    </section>
{/if}
