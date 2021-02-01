<script>
    import Instruction from "../Instruction.svelte";
    import SessionItemEdit from "./SessionItemEdit.svelte";
    import PresentationMode from "./PresentationMode.svelte";

    export let
        currentSession,
        inEditMode,
        inPresentationMode;


    function handleItemEditMessage(event) {
        const command = event.detail.command;
        console.log("dispatcher", command);
        if (command === "remove") {
            const itemID = event.detail.id;
            const index = event.detail.index;
            currentSession.Items.splice(index, 1);
            currentSession.Items = currentSession.Items;
            console.log("remove item", itemID);
        } else if (command === "move-up") {
            const index = parseInt(event.detail.index);
            if (index === 0) {
                console.log("already the first");
                return;
            }
            let item = currentSession.Items[index];
            currentSession.Items.splice(index, 1);
            currentSession.Items.splice(index - 1, 0, item);
            currentSession.Items = currentSession.Items;
        } else if (command === "move-down") {
            const index = parseInt(event.detail.index);
            if (index >= currentSession.Items.length - 1) {
                console.log("already the last");
                return;
            }
            let item = currentSession.Items[index];
            currentSession.Items.splice(index, 1);
            currentSession.Items.splice(index + 1, 0, item);
            currentSession.Items = currentSession.Items;
        } else {
            console.log("unknown command on dispatch:", command);
        }
    }
</script>

<style>
    .session-item {
        display: grid;
        grid-template-columns: 5fr 2fr;
        grid-gap: .3rem;
    }

    @media (max-width: 1080px) {
        .session-item {
            grid-template-columns: 50% 50%;
        }
    }

    .answers {
        display: grid;
        grid-template-rows: 1fr 1fr;
        grid-gap: .3rem;
    }

    button {
        margin: 0;
    }
</style>

{#if inPresentationMode && currentSession.Items.length > 0}
    <PresentationMode {currentSession} {inPresentationMode}/>
{:else}
    {#each currentSession.Items as item, i}
        {#if inEditMode}
            <SessionItemEdit item="{item}" index="{i}" on:message={handleItemEditMessage}/>
        {:else}
            <div class="session-item my2">
                {#if item.Actions.length > 0}
                    <Instruction item="{item.Actions[0]}"
                                 name="{item.Actions[0].SayItem.Phrase}"
                                 index="{i}"
                                 expanded={true}
                                 clickTracking={!inPresentationMode}/>
                    <div class="answers">
                        {#each item.Actions as action, actionIndex}
                            {#if actionIndex > 0}
                                <Instruction item="{action}"
                                             name="{action.SayItem.Phrase}"
                                             index="{i}"
                                             clickTracking={!inPresentationMode}/>
                            {/if}
                        {/each}
                    </div>
                {/if}
            </div>
        {/if}
    {/each}
{/if}
