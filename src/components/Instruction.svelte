<script>
    import {sendInstruction, notify} from './Helpers.svelte';
    import {serverIPStore} from './stores';

    export let item, index = 0, expanded = false, name, small = false, clickTracking = true;
    let isMobile = false;
    let isSmallMobile = false;

    $: {
        if (window.screen.width <= 1280) {
            isMobile = true;
        }
        if (window.screen.width <= 600) {
            isSmallMobile = true;
        }
    }

    function markVisited(event) {
        if (!clickTracking) {
            return;
        }
        markVisitedRecursive(event.target);
    }

    function markVisitedRecursive(element) {
        if (element.tagName.toLowerCase() === "article") {
            element.style.background = "rgba(159, 241, 255, .15)";
        } else {
            markVisitedRecursive(element.parentElement);
        }
    }

    function playAudio(itemID, delay) {
        let delayMillis = delay * 1000;
        const audioElement = document.getElementById("audio-" + itemID);
        if (audioElement) {
            // NOTE: this timer could be non-exact, read more at https://stackoverflow.com/questions/29971898/how-to-create-an-accurate-timer-in-javascript
            setTimeout(() => {
                audioElement.play()
                    .catch(err => {
                        console.error(err);
                        notify("negative", err);
                    });
            }, delayMillis);
        }
    }

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

    .instruction {
        display: flex;
        flex-direction: column;
        justify-content: space-between;
    }

    @media (max-width: 800px) {
        .instruction {
            justify-content: normal;
        }
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

{#if expanded}
    {#if item && item.SayItem}
        <article class="instruction"
                 on:click={markVisited}
                 on:click={sendInstruction(item.ID, $serverIPStore)}
                 on:click={playAudio(item.SayItem.ID, item.SayItem.Delay)}>
            <p class="h6 m0 bold caps {isMobile ? 'mb2' : 'mb4'}">Question {index + 1}</p>
            <div>
                <p class="m0 mb1 instruction-name">{name}</p>
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
                        <img class="icon" src="/images/image-delay.svg" alt="image with delay is present"
                             title="image with delay is present">
                    {:else}
                        <img class="icon" src="/images/image.svg" alt="image is present" title="image is present">
                    {/if}
                {/if}
            </div>
            {#if item.SayItem.FilePath.length > 0}
                <audio id="audio-{item.SayItem.ID}" src="http://{$serverIPStore}:8080/{item.SayItem.FilePath}">
                    Your browser does not support the <code>audio</code> element.
                </audio>
            {/if}
        </article>
    {/if}
{:else}
    {#if item}
        <article class="instruction items-start"
                 on:click={markVisited}
                 on:click={sendInstruction(item.ID, $serverIPStore)}
                 on:click={playAudio(item.SayItem.ID, item.SayItem.Delay)}>
            <p class="m0 mb1" class:instruction-name="{!small}">{truncateLongString(name)}</p>
            <div>
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
                        <img class="icon" src="/images/image-delay.svg" alt="image with delay is present"
                             title="image with delay is present">
                    {:else}
                        <img class="icon" src="/images/image.svg" alt="image is present" title="image is present">
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
            </div>
            {#if item.SayItem.FilePath.length > 0}
                <audio id="audio-{item.SayItem.ID}" src="http://{$serverIPStore}:8080/{item.SayItem.FilePath}">
                    Your browser does not support the <code>audio</code> element.
                </audio>
            {/if}
        </article>
    {/if}
{/if}

