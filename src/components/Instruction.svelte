<script>
    import {notify} from "./Helpers.svelte";
    import InstructionIcon from "./InstructionIcon.svelte";
    import ActionItemEdit from "./actions/ActionItemEdit.svelte";

    export let
        item,
        name,
        index = 0,
        expanded = false,
        small = false,
        isDraggable = false,
        border_radius = '',
        inEditMode = false,
        isFetchNeeded = false,
        isMove=false;

    let isMobile = false;
    let actionEdit = false;

    $: isMobile = window.screen.width <= 1280;

    $: if (!inEditMode) {
        actionEdit = false;
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
                if (response[id] == "action_retry_required") {
                    sendInstruction(id, serverIP, target);
                } else if (response[id] === "action_error") {
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
            element.style.background = "rgba(253, 202, 129, .15)";
            element.style.border = "4px solid rgba(253, 202, 129, .50)"
        } else {
            markActive(element.parentElement);
        }
    }

    function markInactive(element) {
        if (element.tagName.toLowerCase() === "article") {
            element.style.background = "rgba(159, 241, 255, .15)";
            element.style.border = "4px solid rgba(159, 241, 255, .50)"
        } else {
            markInactive(element.parentElement)
        }
    }

    function markComplete(element) {
        if (small) {
            markInactive(element);
        } else {
            if (element.tagName.toLowerCase() === "article") {
                element.style.background = "rgba(159, 255, 159, .15)";
                element.style.border = "4px solid rgba(159, 255, 159, .50)";
            } else {
                markComplete(element.parentElement);
            }
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

    function editAction() {
        actionEdit = true;
    }

    function removeAction() {
        if (isMove) {
            notify("negative", "Removing motions is not yet supported!");
            return;
        }

        let confirmation = window.confirm(`Are you sure you want to remove the action: ${name}?`);
        if (!confirmation) {
            return;
        }

        fetch(`http://` + window.location.hostname + `:8080/api/actions/${item.ID}`, {
            method: "DELETE"
        })
            .then(response => response.json())
            .then((response) => {
                console.log("server response:", response);
                if (response["error"] && response["error"].length > 0) {
                    notify("negative", response["error"]);
                } else {
                    notify("positive", response["message"]);
                    isFetchNeeded = true;
                }
            })
            .catch((err) => {
                console.error(err);
                notify("negative", err);
            });
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

{#if (actionEdit && inEditMode)}
<div style="grid-column-start: 1; grid-column-end: 3;">
    <ActionItemEdit inAddMode={false} bind:fetchNeeded={isFetchNeeded} bind:actionEdit={actionEdit} bind:item={item}></ActionItemEdit>
</div>
{:else}
<article id="instruction-{getID(item)}"
         class="instruction"
         class:items-start={!expanded}
         style="{border_radius} min-height: 100%;"
         draggable={isDraggable}
         on:dragstart={dragStartHandler}
         data-moveid={(isDraggable && item.MotionItem) ? item.MotionItem.ID : 'undefined ID'}
         on:click={sendInstruction(getID(item), window.location.hostname, this)}>
    {#if expanded}
        <p class="h6 m0 bold caps {isMobile ? 'mb2' : 'mb4'}" style="margin-bottom: 14px;">Question {index + 1}</p>
    {:else}
        <p class:instruction-name="{!small}" style="margin: 0;">{isMove ? name.replaceAll("_", " ") : name}</p>
    {/if}
    <div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
        <span>
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
        </span>
        <span style={(small && inEditMode) ? 'visibility: visible;' : 'visibility: hidden;'}>
            {#if !isMove}
            <button class="ui tiny basic icon button" on:click|stopPropagation={editAction}>
                <i class="edit icon"></i>
            </button>
            {/if}
            <button class="ui tiny basic icon button" on:click|stopPropagation={removeAction}>
                <i class="red trash alternate outline icon"></i>
            </button>
        </span>
    </div>
</article>
{/if}

