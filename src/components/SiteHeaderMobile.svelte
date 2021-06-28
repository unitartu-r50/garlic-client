<script>
    import {createEventDispatcher} from 'svelte';

    const dispatch = createEventDispatcher();

    export let current, isMobileMenuShown;

    function pseudoRedirect(event) {
        const loc = event.target.dataset.loc;

        localStorage.setItem("location", loc);

        current = loc;
        dispatch('message', {
            text: loc
        });

        // hiding mobile menu on click
        if (isMobileMenuShown) {
            isMobileMenuShown = false;
        }
    }
</script>

<style>
    a {
        color: black;
        text-decoration: none;
        transition: all .2s ease-in-out;
    }

    a:hover, a:focus {
        font-style: italic;
    }

    .active {
        font-style: italic;
    }

    .logotype {
        height: 40px;
    }

    .mobile-menu {
        background: white;
        position: fixed;
        top: 0;
        right: 0;
        width: max-content;
        border: 4px solid rgba(159, 241, 255, .35);
        z-index: 999;
    }

    @media (min-width: 800px) {
        .lt-700 {
            display: none;
        }
    }
</style>

<div class="flex flex-auto justify-between lt-700">
    <img class="flex logotype m1" srcset="/images/pepper.svg, /images/pepper.png, /images/pepper@2x.png"
         src="/images/pepper.png"
         alt="Pepper Control">
    <nav class="flex">
        <a on:click|preventDefault={() => {isMobileMenuShown = !isMobileMenuShown}} data-loc="" href="/"
           title="Menu"
           class="self-center mx2 caps h6">Menu</a>
    </nav>
</div>
{#if isMobileMenuShown}
    <div class="mobile-menu lt-700 flex flex-column p2">
        <a on:click|preventDefault={() => {isMobileMenuShown = false}} data-loc="" href="/" title="Home"
           class="p1 self-center mx2 mb2 caps h2">Close ×</a>
        <nav class="flex flex-column">
            <a on:click|preventDefault={pseudoRedirect} data-loc="" href="/" title="Home"
               class="p1 self-center mx2 caps h6">Home</a>
            <a on:click|preventDefault={pseudoRedirect} data-loc="sessions" href="/sessions" title="Sessions"
               class:active="{current === 'sessions'}" class="p1 self-center mx2 caps h6">sessions</a>
            <a on:click|preventDefault={pseudoRedirect} data-loc="synthesis" href="/synthesis" title="EKI Speech Synthesis"
               class:active="{current === 'synthesis'}" class="p1 self-center mx2 caps h6">EKI</a>
            <a on:click|preventDefault={pseudoRedirect} data-loc="neurokone" href="/synthesis" title="Neurokõne Speech Synthesis"
               class:active="{current === 'neurokone'}" class="p1 self-center mx2 caps h6">Neurokõne</a>
            <a on:click|preventDefault={pseudoRedirect} data-loc="about" href="/about" title="About"
               class:active="{current === 'about'}" class="p1 self-center mx2 caps h6">about</a>
        </nav>
    </div>
{/if}
