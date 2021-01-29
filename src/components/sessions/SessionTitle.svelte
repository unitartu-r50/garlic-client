<script>
    export let
        title,
        inEditMode,
        inPresentationMode;
</script>

<style>
    .presentation-label {
        font-weight: normal;
        color: rgba(159, 241, 255, 1);
    }

    label {
        display: block;
    }
</style>

{#if inEditMode}
    <label for="session-name" class="mb2">Session name:
        <input id="session-name" type="text"
               bind:value={title}></label>
{:else}
    <h2 class="h2 m0 mb1 flex flex-wrap justify-between">{title}
        {#if inPresentationMode}
            <span class="presentation-label">Presentation Mode</span>
        {/if}
    </h2>
{/if}
