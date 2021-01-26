<script>
    import {serverIPStore} from './stores';

    export let
        item,
        name,
        isMobile = false,
        small = false,
        expanded = false;

    function truncateLongString(value) {
        // truncate on desktop, mobile has different layout, no need to truncate there
        if (!isMobile) {
            const maxAllowedChars = 40;
            if (value.length > maxAllowedChars) {
                return value.substring(0, maxAllowedChars) + "...";
            }
        }
        return value;
    }
</script>

<style>
    .icon {
        height: 1em;
        margin-right: .25em;
        margin-bottom: .35em;
    }

    .instruction-name {
        font-size: 1.5rem;
    }

    @media (max-width: 600px) {
        .instruction-name {
            font-size: 1.25rem;
        }
    }
</style>

<div>
    {#if expanded}
        <p class="m0 mb1 instruction-name">{name}</p>
    {:else}
        <p class="m0 mb1" class:instruction-name="{!small}">{truncateLongString(name)}</p>
    {/if}
    {#if item.SayItem.FilePath && item.SayItem.FilePath.length > 0}
        {#if item.SayItem.Delay > 0}
            <img class="icon" src="/images/speech-delay.svg" alt="audio with delay is present"
                 title="audio with delay is present">
        {:else}
            <img class="icon" src="/images/speech.svg" alt="audio is present" title="audio is present">
        {/if}
    {/if}
    {#if item.MoveItem && (item.MoveItem.Name || item.MoveItem.FilePath)}
        {#if item.MoveItem.Delay > 0}
            <img class="icon" src="/images/pepper-icon-delay.svg" alt="movement with delay is present"
                 title="movement with delay is present">
        {:else}
            <img class="icon" src="/images/pepper-icon.svg" alt="movement is present"
                 title="movement is present">
        {/if}
    {/if}
    {#if item.ImageItem && item.ImageItem.FilePath}
        {#if item.ImageItem.Delay > 0}
            <img class="icon" src="/images/image-delay.svg" alt="delay is present"
                 title="delay is present">
        {:else}
            <img class="icon" src="/images/image.svg" alt="no delay">
        {/if}
    {/if}
    {#if item.URLItem && item.URLItem.URL.length > 0}
        {#if item.URLItem.Delay > 0}
            <img class="icon" src="/images/url-delay.svg" alt="URL with delay is present"
                 title="URL with delay is present">
        {:else}
            <img class="icon" src="/images/url.svg" alt="URL is present" title="URL is present">
        {/if}
    {/if}
    {#if item.SayItem.FilePath.length > 0}
        <audio id="audio-{item.SayItem.ID}" src="http://{$serverIPStore}:8080/{item.SayItem.FilePath}">
            Your browser does not support the <code>audio</code> element.
        </audio>
    {/if}
</div>
