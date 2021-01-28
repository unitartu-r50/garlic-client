<script>
    import SiteHeader from './components/SiteHeader.svelte';
    import HomePage from './components/pages/HomePage.svelte';
    import SessionsPage from './components/pages/SessionsPage.svelte';
    import AboutPage from "./components/pages/AboutPage.svelte";
    import LoginPage from "./components/pages/LoginPage.svelte";

    let currentPage = "";

    $: {
        currentPage = localStorage.getItem("location");
        if (!currentPage) {
            currentPage = "";
        }
    }
</script>

<SiteHeader bind:currentPage={currentPage}/>
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
