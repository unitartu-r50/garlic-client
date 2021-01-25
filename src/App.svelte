<script>
    import SiteHeader from './components/SiteHeader.svelte';
    import HomePage from './components/HomePage.svelte';
    import SessionsPage from './components/SessionsPage.svelte';
    import AboutPage from "./components/AboutPage.svelte";
    import LoginPage from "./components/LoginPage.svelte";

    let currentPage = "";

    $: {
        currentPage = localStorage.getItem("location");
        if (!currentPage) {
            currentPage = "";
        }
    }

    function handlePseudoRedirect(event) {
        currentPage = event.detail.text;
    }
</script>

<SiteHeader on:message={handlePseudoRedirect}/>
{#if currentPage === ""}
    <HomePage/>
{:else if currentPage === "sessions" }
    <SessionsPage/>
{:else if currentPage === "about" }
    <AboutPage/>
{:else if currentPage === "login" }
    <LoginPage/>
{/if}

<div id="notifications" class="notifications"></div>
