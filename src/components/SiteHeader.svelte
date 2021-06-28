<script>
    import SiteHeaderMobile from "./SiteHeaderMobile.svelte";

    export let currentPage;

    let isMobileMenuShown = false;

    function redirect(event) {
        const location = event.target.dataset.loc;
        localStorage.setItem("location", location);
        currentPage = location;

        // hiding mobile menu on any click
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
</style>

<header class="flex flex-wrap align-baseline justify-between px1">
    <div class="flex bt-700">
        <img class="logotype m1" srcset="/images/pepper.svg, /images/pepper.png, /images/pepper@2x.png"
             src="/images/pepper.png"
             alt="Pepper Control">
        <nav class="flex">
            <a on:click|preventDefault={redirect} data-loc="" href="/" title="Home"
               class="logotype-title self-center mr3 bold italic">pepper</a>
            <a on:click|preventDefault={redirect} data-loc="sessions" href="/sessions" title="Sessions"
               class:active="{currentPage === 'sessions'}" class="self-center mx2 caps h6">sessions</a>
            <a on:click|preventDefault={redirect} data-loc="synthesis" href="/synthesis" title="EKI Speech Synthesis"
               class:active="{currentPage === 'synthesis'}" class="self-center mx2 caps h6">EKI</a>
            <a on:click|preventDefault={redirect} data-loc="neurokone" href="/synthesis" title="Neurokõne Speech Synthesis"
               class:active="{currentPage === 'neurokone'}" class="self-center mx2 caps h6">Neurokõne</a>
            <a on:click|preventDefault={redirect} data-loc="about" href="/about" title="About"
               class:active="{currentPage === 'about'}" class="self-center mx2 caps h6">about</a>
        </nav>
    </div>
    <nav class="flex bt-700">
        <a on:click|preventDefault={redirect} data-loc="login" href="/login" title="Login"
           class:active="{currentPage === 'login'}" class="self-center mx2 caps h6">login</a>
    </nav>
    <SiteHeaderMobile bind:current={currentPage} bind:isMobileMenuShown={isMobileMenuShown}/>
</header>
