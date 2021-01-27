<script>
    export let
        item,
        iconBaseName,
        alt;
</script>

<style>
    .icon {
        height: 1em;
        margin-right: .25em;
        margin-bottom: .35em;
    }
</style>

{#if item.Delay > 0}
    <img class="icon" src="/images/{iconBaseName}-delay.svg" alt="{alt} with delay" title="{alt} with delay">
{:else}
    <img class="icon" src="/images/{iconBaseName}.svg" alt="{alt}" title="{alt}">
{/if}
