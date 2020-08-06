<script>
    import {notify, sendInstruction} from '../App.svelte';

    let moves;
    let moveGroups;
    let movesByGroups;
    let fetchNeeded = true;

    $: {
        if (fetchNeeded) {
            fetch("http://localhost:8080/api/moves/")
                    .then(r => r.json())
                    .then(d => {
                        moves = d.data;
                        populateMoveGroups();
                        populateMoveByGroups()
                        fetchNeeded = false;
                    })
                    .catch(err => {
                        console.error("error:", err);
                        fetchNeeded = false;
                    });
        }
    }

    function populateMoveGroups() {
        let groups = new Set();
        for (const move of moves) {
            groups.add(move.Group);
        }
        moveGroups = groups;
    }

    function populateMoveByGroups() {
        movesByGroups = {};
        for (const group of moveGroups) {
            movesByGroups[group] = moves.filter(item => item.Group === group);
        }
    }

    function markVisited(id) {
        document.getElementById(id).style.background = "rgba(159, 241, 255, .15)";
    }
</script>

<style>
    .move-group {
        display: grid;
        grid-template-columns: 1fr 1fr;
        grid-gap: .3em;
    }

</style>

<section>
    <h2 class="h2 m0 mb1">Motion Library</h2>
    {#if movesByGroups}
        {#each Object.keys(movesByGroups) as groupName}
            <h3 class="h3">{groupName}</h3>
            <section class="move-group">
                {#each movesByGroups[groupName] as move}
                    <article class="instruction move" id="{move.ID}" on:click={markVisited(move.ID)}
                             on:click={sendInstruction(move.ID)}>
                        {move.Name}
                    </article>
                {/each}
            </section>
        {/each}
    {:else}
        <p><em>No motions found.</em></p>
    {/if}
</section>