<script>
    import {notify} from "./Helpers.svelte";
    import InstructionIcon from "./InstructionIcon.svelte";

    export let
        item,
        name,
        index = 0,
        expanded = false,
        small = false,
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

    async function sendInstruction(id, serverIP, target) {
        markActive(target);
        const payload = {
            "item_id": id
        }
        console.log("sending instruction", payload)
        fetch(`http://${serverIP}:8080/api/pepper/send_command`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        })
            .then(response => response.json())
            .then((response) => {
                if (response[id] === "action_error") {
                    notify("negative", response["message"]);
                    markInactive(target);
                } else if (response[id] !== "action_success") {
                    notify("warning", response["message"]);
                    markInactive(target);
                } else {
                    markComplete(target);
                }
            })
            .catch((err) => {
                console.error(err);
                notify("negative", err);
                markInactive(target);
            })
    }

    function markActive(element) {
        if (element.tagName.toLowerCase() === "article") {
            if (element.style.border === "4px solid rgba(159, 255, 159, .35)") {
                element.style.background = "rgba(159, 255, 159, .15)";
            } else {
                element.style.background = "rgba(159, 241, 255, .15)";
            }
        } else {
            markActive(element.parentElement);
        }
    }

    function markInactive(element) {
        if (element.tagName.toLowerCase() === "article") {
            element.style.background = "";
        } else {
            markInactive(element.parentElement)
        }
    }

    function markComplete(element) {
        if (element.tagName.toLowerCase() === "article") {
            element.style.background = "rgba(159, 255, 159, .05)";
            element.style.border = "4px solid rgba(159, 255, 159, .35)";
        } else {
            markComplete(element.parentElement);
        }
    }

    // determines the instruction correct ID dynamically
    function getID(item) {
        if (item.ID) {
            return item.ID;
        } else if (item.UtteranceItem && item.UtteranceItem.ID) {
            return item.UtteranceItem.ID;
        } else if (item.MotionItem && item.MotionItem.ID) {
            return item.MotionItem.ID;
        //} else if (item.ImageItem && item.ImageItem.ID) {
        //    return item.ImageItem.ID;
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

<article id="instruction-{getID(item)}"
         class="instruction"
         class:items-start={!expanded}
         draggable={isDraggable}
         on:dragstart={dragStartHandler}
         data-moveid={(isDraggable && item.MotionItem) ? item.MotionItem.ID : 'undefined ID'}
         on:click={sendInstruction(getID(item), window.location.hostname, this)}>
    {#if expanded}
        <p class="h6 m0 bold caps {isMobile ? 'mb2' : 'mb4'}">Question {index + 1}</p>
    {:else}
        <p class="m0 mb1" class:instruction-name="{!small}">{truncateLongString(name)}</p>
    {/if}
    <div>
        {#if expanded}
            <p class="m0 mb1 instruction-name">{name}</p>
        {/if}
        {#if item.UtteranceItem && item.UtteranceItem.FilePath && item.UtteranceItem.FilePath.length > 0}
            <InstructionIcon item={item.UtteranceItem} iconBaseName="speech" alt="audio is present"/>
        {/if}
        {#if item.MotionItem && (item.MotionItem.Name || item.MotionItem.FilePath)}
            <InstructionIcon item={item.MotionItem} iconBaseName="pepper-icon" alt="motion is present"/>
        {/if}
        {#if item.ImageItem && item.ImageItem.FilePath}
            <InstructionIcon item={item.ImageItem} iconBaseName="image" alt="graphics is present"/>
        {/if}
        {#if item.URLItem && item.URLItem.URL.length > 0}
            <InstructionIcon item={item.URLItem} iconBaseName="url" alt="URL is present"/>
        {/if}
    </div>
</article>

