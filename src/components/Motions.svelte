<script>
    import {notify, sendInstruction} from './Helpers.svelte';

    let moves;
    let moveGroups;
    let movesByGroups;
    let fetchNeeded = true;
    let isAddingMotion = false;
    let inEditingMode = false;
    let searchQuery = "";

    let motionName = "";
    let motionGroup = "";

    $: {
        if (fetchNeeded) {
            fetch("http://localhost:8080/api/moves/")
                .then(r => r.json())
                .then(d => {
                    moves = d.data;
                    populateMoveGroups(moves);
                    populateMoveByGroups(moves, moveGroups)
                    fetchNeeded = false;
                })
                .catch(err => {
                    console.error("error:", err);
                    fetchNeeded = false;
                });
        }
    }

    function populateMoveGroups(moves) {
        let groups = new Set();
        for (const move of moves) {
            groups.add(move.Group);
        }
        moveGroups = groups;
    }

    function populateMoveByGroups(moves, moveGroups) {
        movesByGroups = {};
        for (const group of moveGroups) {
            movesByGroups[group] = moves.filter(item => item.Group === group);
        }
    }

    function search() {
        let filteredMoves = [];
        for (const move of moves) {
            if (move.Name.toLowerCase().includes(searchQuery.toLowerCase())) {
                filteredMoves.push(move);
            }
        }
        populateMoveGroups(filteredMoves);
        populateMoveByGroups(filteredMoves, moveGroups);
    }

    function searchReset() {
        searchQuery = "";
        search();
    }

    function markVisited(id) {
        document.getElementById(id).style.background = "rgba(159, 241, 255, .15)";
    }

    function dragStartHandler(event) {
        event.dataTransfer.setData("text/plain", event.target.dataset.id);
        event.dataTransfer.dropEffect = "copy";
    }

    function showForm(event) {
        isAddingMotion = true;
    }

    function addMotion(event) {
        const input = document.getElementById("new-motion-file");

        console.log("add motion", input.files);
        isAddingMotion = false;

        if (!input.files) {
            notify("negative", "please, attach a motion file")
            return;
        }

        console.log("file upload", motionName, motionGroup, input.files[0]);

        const reader = new FileReader();
        reader.addEventListener('loadend', (e) => {
            let data = new FormData();
            data.append("file_content", input.files[0]);
            data.append("name", motionName);
            data.append("group", motionGroup);

            fetch("http://localhost:8080/api/upload/move", {
                method: "POST",
                body: data
            })
                .then(response => response.json())
                .then((response) => {
                    console.log(response);
                    if (response["error"] && response["error"].length > 0) {
                        notify("negative", response["error"]);
                    } else {
                        notify("positive", response["message"]);
                        fetchNeeded = true;
                        motionName = "";
                        motionGroup = "";
                    }
                })
                .catch((err) => {
                    console.error(err);
                    notify("negative", err);
                })
        })
        reader.readAsText(input.files[0]);
    }

    function cancelForm(event) {
        isAddingMotion = false;
        motionName = "";
        motionGroup = "";
    }

    function toggleEditMode() {
        inEditingMode = !inEditingMode;
    }

    function removeMove(id) {
        console.log("removing", id);
        fetch("http://localhost:8080/api/moves/" + id, {
            method: "DELETE",
            headers: {"Content-Type": "application/json"}
        })
            .then(response => response.json())
            .then((response) => {
                console.log(response);
                if (response["error"] && response["error"].length > 0) {
                    notify("negative", response["error"]);
                } else {
                    notify("positive", response["message"]);
                    fetchNeeded = true;
                }
            })
            .catch((err) => {
                console.error(err);
                notify("negative", err);
            })
    }
</script>

<style>
    .move-group {
        display: grid;
        grid-template-columns: 1fr 1fr;
        grid-gap: .3em;
    }

    label {
        display: block;
    }

    .full-width {
        width: 100%;
    }

    fieldset {
        border: 4px solid rgba(159, 241, 255, .35);
        border-radius: .5em;
        background: rgba(228, 249, 254, .5);
    }

    .sticky {
        position: -webkit-sticky;
        position: sticky;
        top: 20px;
    }
</style>

<section>
    <h2 class="h2 m0 mb1">Motion Library</h2>
    {#if !isAddingMotion}
        <button class="m0" on:click|preventDefault={showForm}>Add a motion</button>
    {/if}
    {#if !inEditingMode}
        <button class="m0" on:click|preventDefault={toggleEditMode}>Edit</button>
    {:else}
        <button class="m0" on:click|preventDefault={toggleEditMode}>Done</button>
    {/if}
    {#if isAddingMotion}
        <form class="my2">
            <fieldset class="mb1">
                <legend class="h5 m0 bold caps mb1">Adding a motion</legend>
                <label class="mb1" for="new-motion-name">Name
                    <input id="new-motion-name" type="text" bind:value={motionName}>
                </label>
                <label class="mb1" for="new-motion-group">Group
                    <input id="new-motion-group" type="text" bind:value={motionGroup}>
                </label>
                <label class="mb1" for="new-motion-file">File
                    <input id="new-motion-file" type="file" accept=".qianim">
                </label>
                <button class="m0 mt2" on:click|preventDefault={addMotion}>Add</button>
                <button class="m0 mt2" on:click|preventDefault={cancelForm}>Cancel</button>
            </fieldset>
        </form>
    {/if}
    <div class="flex items-baseline">
        <label for="move-search" class="m0 mt2">Filter:
            <input id="move-search" type="text" bind:value={searchQuery} on:input={search} placeholder="Type in your query here">
        </label>
        <div>
            <button class="ml1" on:click|preventDefault={searchReset}>Reset</button>
        </div>
    </div>
    {#if movesByGroups}
        {#each Object.keys(movesByGroups) as groupName}
            <h3 class="h3">{groupName}</h3>
            <section class="move-group">
                {#each movesByGroups[groupName] as move}
                    <div>
                        <article class="instruction move" id="{move.ID}" on:click={markVisited(move.ID)}
                                 on:click={sendInstruction(move.ID)}
                                 data-id="{move.ID}"
                                 draggable="true" on:dragstart={dragStartHandler}>
                            {move.Name}
                        </article>
                        {#if inEditingMode}
                            <button class="m0 mb1" on:click|preventDefault={removeMove(move.ID)}>Remove</button>
                        {/if}
                    </div>
                {/each}
            </section>
        {/each}
    {:else}
        <p><em>No motions found.</em></p>
    {/if}
</section>