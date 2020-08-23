<script>
    import {createEventDispatcher} from 'svelte';

    const dispatch = createEventDispatcher();

    let current = "";

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
</style>

<header class="flex align-baseline justify-between px1">
    <div class="flex">
        <img class="logotype m1" srcset="/images/pepper.svg, /images/pepper.png, /images/pepper@2x.png" src="/images/pepper.png"
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
    <nav class="flex">
        <a on:click|preventDefault={pseudoRedirect} data-loc="login" href="/login" title="Login"
           class:active="{current === 'login'}" class="self-center mx2 caps h6">login</a>
    </nav>
</header>