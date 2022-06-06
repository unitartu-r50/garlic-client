<script>
    import {slide} from 'svelte/transition';
    import { motionsFetchNeeded } from './stores'

    export let title, isCollapsed = true;

    $: {
        if (title === 'Motions' && !isCollapsed) {
            $motionsFetchNeeded = true;
        }
    }
</script>

<style>
    .collapsible {
        cursor: pointer;
        transition: all .2s;
    }

    .collapsible:hover, .collapsible:active {
        color: rgb(80, 228, 253);
    }

    .collapsible::before {
        content: "–";
        margin-right: .3em;
        color: rgba(159, 241, 255, 1);
    }

    .collapsed::before {
        content: "+";
        margin-right: .2em;
        color: rgba(159, 241, 255, 1);
    }
</style>

<section class:mb4={!isCollapsed}>
    <h2 class="h2 m0 mb1 collapsible" class:collapsed={isCollapsed}
        on:click|preventDefault={() => {isCollapsed = !isCollapsed}}>{title}</h2>
    {#if !isCollapsed}
        <div transition:slide={{duration: 100}}>
           <slot/>
        </div>
    {/if}
</section>
