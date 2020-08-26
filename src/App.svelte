<script>
    // Routing
    //
    // import Login from './pages/Login.svelte';
    // import Home from './pages/Home.svelte';
    // import About from './pages/About.svelte';
    // import Sessions from './pages/Sessions.svelte';
    //
    // import router from "page";
    //
    // let currentPage = Home;
    //
    // router('/', () => router.redirect("/sessions"));
    // router('/login', () => currentPage = Login);
    // router('/about', () => currentPage = About);
    // router('/sessions', () => currentPage = Sessions);
    // router.start();

    // Alternative routing

    // import { onMount } from 'svelte';

    import SiteHeader from './components/SiteHeader.svelte';
    import Introduction from './components/Introduction.svelte';
    import SessionsList from './components/SessionsList.svelte';
    import Motions from './components/Motions.svelte';
    import AudioLibrary from './components/AudioLibrary.svelte';

    let currentPage = "";
    let isPepperConnected = false;

    $: {
        currentPage = localStorage.getItem("location");
        if (!currentPage) {
            currentPage = "";
        }
        setPepperStatus();
    }

    setInterval(() => setPepperStatus(), 5000);

    function handlePseudoRedirect(event) {
        currentPage = event.detail.text;
    }

    function setPepperStatus() {
        fetch("http://localhost:8080/api/pepper/status")
            .then(response => response.json())
            .then((response) => {
                isPepperConnected = response["status"] === 1
            })
            .catch(err => console.error(err))
    }
</script>

<!--<svelte:component this={currentPage}/>-->

<style>
    main {
        display: grid;
        grid-template-columns: 2fr 2fr;
        grid-gap: 2em;
    }
</style>

<SiteHeader on:message={handlePseudoRedirect}/>
{#if currentPage === ""}
    <main class="p2">
        home
    </main>
{:else if currentPage === "sessions" }
    <Introduction title="Sessions Control" description="This dashboard allows the control of the Pepper robot through the local network simply by clicking corresponding
        buttons, either questions, or positive answers, or negative answers. On the right side, there is available the
        general motion library, so a user can initiate any movement at any time.">
        {#if isPepperConnected}
            <p>Pepper status: 🟢</p>
        {:else}
            <p>Pepper status: ⚪</p>
        {/if}
    </Introduction>
    <main class="p2 mt4">
        <SessionsList/>
        <div>
            <AudioLibrary/>
            <Motions/>
        </div>
    </main>
{:else if currentPage === "about" }
    <Introduction title="Pepper Project"
                  description="Some words about the project, Pepper control, whom to ask if there are question about the robot and the software, etc."/>
    <main class="p2 mt4">
        about
    </main>
{:else if currentPage === "login" }
    <Introduction title="Login" description="To get access to the system, please, enter the password given to you."/>
    <main class="p2 mt4">
        <form action="">
            <label for="password">
                <span class="mb1 block">Password</span>
                <input type="password" name="password" id="password">
            </label>
            <input type="submit" value="Login">
        </form>
    </main>
{/if}

<div id="notifications" class="notifications"></div>