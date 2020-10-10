<script>
    import {createEventDispatcher} from 'svelte';

    const dispatch = createEventDispatcher();

    let current = "";
    let isMobileMenuShown = false;

    $: {
        current = localStorage.getItem("location");
    }

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
        /*opacity: .5;*/
        /*font-weight: bold;*/
        font-style: italic;
    }

    .active {
        /*background: white;*/
        /*opacity: .5;*/
        /*font-weight: bold;*/
        font-style: italic;
    }

    .logotype {
        height: 40px;
    }

    .logotype-title {
        color: black;
        text-decoration: none;
        font-size: 1.25em;
        padding-bottom: .2em;
    }

    header {
        background: #9FF1FF;
    }

    @media (max-width: 800px) {
        .bt-700 {
            display: none;
        }
    }

    @media (min-width: 800px) {
        .lt-700 {
            display: none;
        }
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
</style>

<header class="flex flex-wrap align-baseline justify-between px1">
    <div class="flex bt-700">
        <img class="logotype m1" srcset="/images/pepper.svg, /images/pepper.png, /images/pepper@2x.png"
             src="/images/pepper.png"
             alt="Pepper Control">
        <nav class="flex">
            <a on:click|preventDefault={pseudoRedirect} data-loc="" href="/" title="Home"
               class="logotype-title self-center mr3 bold italic">pepper</a>
            <a on:click|preventDefault={pseudoRedirect} data-loc="sessions" href="/sessions" title="Sessions"
               class:active="{current === 'sessions'}" class="self-center mx2 caps h6">sessions</a>
            <a on:click|preventDefault={pseudoRedirect} data-loc="about" href="/about" title="About"
               class:active="{current === 'about'}" class="self-center mx2 caps h6">about</a>
        </nav>
    </div>
    <nav class="flex bt-700">
        <a on:click|preventDefault={pseudoRedirect} data-loc="login" href="/login" title="Login"
           class:active="{current === 'login'}" class="self-center mx2 caps h6">login</a>
    </nav>
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
                <a on:click|preventDefault={pseudoRedirect} data-loc="about" href="/about" title="About"
                   class:active="{current === 'about'}" class="p1 self-center mx2 caps h6">about</a>
            </nav>

        </div>
    {/if}
</header>