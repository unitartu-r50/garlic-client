<script>
    import {sendInstruction, notify} from './Helpers.svelte';
    import {serverIPStore} from './stores';
    import InstructionFooter from "./InstructionFooter.svelte";

    export let
        item,
        name,
        index = 0,
        expanded = false,
        small = false,
        clickTracking = true;
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
</style>

{#if expanded}
    {#if item && item.SayItem}
        <article class="instruction"
                 on:click={markVisited}
                 on:click={sendInstruction(item.ID, $serverIPStore)}
                 on:click={playAudio(item.SayItem.ID, item.SayItem.Delay)}>
            <p class="h6 m0 bold caps {isMobile ? 'mb2' : 'mb4'}">Question {index + 1}</p>
            <InstructionFooter bind:item={item} {name} {expanded}/>
        </article>
    {/if}
{:else}
    {#if item}
        <article class="instruction items-start"
                 on:click={markVisited}
                 on:click={sendInstruction(item.ID, $serverIPStore)}
                 on:click={playAudio(item.SayItem.ID, item.SayItem.Delay)}>
            <InstructionFooter bind:item={item} {name} {small} {isMobile}/>
        </article>
    {/if}
{/if}

