<script>
    import {serverIPStore} from './stores';
    import {sendInstruction, notify} from "./Helpers.svelte";
    import InstructionIcon from "./InstructionIcon.svelte";

    export let
        item,
        name,
        index = 0,
        expanded = false,
        small = false,
        clickTracking = true,
        isDraggable = false;

    let isMobile = false;

    $: isMobile = window.screen.width <= 1280;

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

    // allows execute playAudio only if an item contains the .SayItem field
    function playAudioPlaceholder(item) {
        if (item.SayItem && item.SayItem.FilePath.length > 0) {
            return playAudio(item.SayItem.ID, item.SayItem.Delay);
        }
        return () => {
            console.log("placeholder triggered")
        };
    }

    // determines the instruction correct ID dynamically
    function getID(item) {
        if (item.ID) {
            return item.ID;
        } else if (item.SayItem && item.SayItem.ID) {
            return item.SayItem.ID;
        } else if (item.MoveItem && item.MoveItem.ID) {
            return item.MoveItem.ID;
        } else {
            console.log("getID can't determine the ID of", item);
        }
    }

    function dragStartHandler(event) {
        event.dataTransfer.setData("text/plain", event.target.dataset.moveid);
        event.dataTransfer.dropEffect = "copy";
    }
</script>

<style>
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

<article class="instruction"
         class:items-start={!expanded}
         draggable="{isDraggable ? 'true' : 'false'}"
         on:dragstart={dragStartHandler}
         data-moveid="{(isDraggable && item.MoveItem) ? item.MoveItem.ID : 'undefined ID'}"
         on:click={markVisited}
         on:click={sendInstruction(getID(item), $serverIPStore)}
         on:click={playAudioPlaceholder(item)}>
    {#if expanded}
        <p class="h6 m0 bold caps {isMobile ? 'mb2' : 'mb4'}">Question {index + 1}</p>
    {:else}
        <p class="m0 mb1" class:instruction-name="{!small}">{truncateLongString(name)}</p>
    {/if}
    <div>
        {#if expanded}
            <p class="m0 mb1 instruction-name">{name}</p>
        {/if}
        {#if item.SayItem && item.SayItem.FilePath && item.SayItem.FilePath.length > 0}
            <InstructionIcon item={item.SayItem} iconBaseName="speech" alt="audio is present"/>
        {/if}
        {#if item.MoveItem && (item.MoveItem.Name || item.MoveItem.FilePath)}
            <InstructionIcon item={item.MoveItem} iconBaseName="pepper-icon" alt="movement is present"/>
        {/if}
        {#if item.ImageItem && item.ImageItem.FilePath}
            <InstructionIcon item={item.ImageItem} iconBaseName="image" alt="graphics is present"/>
        {/if}
        {#if item.URLItem && item.URLItem.URL.length > 0}
            <InstructionIcon item={item.URLItem} iconBaseName="url" alt="URL is present"/>
        {/if}
        {#if item.SayItem && item.SayItem.FilePath.length > 0}
            <audio id="audio-{item.SayItem.ID}" src="http://{$serverIPStore}:8080/{item.SayItem.FilePath}">
                Your browser does not support the <code>audio</code> element.
            </audio>
        {/if}
    </div>
</article>

