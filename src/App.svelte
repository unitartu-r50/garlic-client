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
    import MotionLibrary from './components/MotionLibrary.svelte';
    import AudioLibrary from './components/AudioLibrary.svelte';
    import {serverIPStore} from './components/stores';

    let currentPage = "";
    let isPepperConnected = false;
    let serverIP = "unknown";

    $: {
        currentPage = localStorage.getItem("location");
        if (!currentPage) {
            currentPage = "";
        }
        setPepperStatus();
        setServerIP();
    }

    setInterval(() => setPepperStatus(), 5000);

    function handlePseudoRedirect(event) {
        currentPage = event.detail.text;
    }

    function setPepperStatus() {
        fetch(`http://` + $serverIPStore + `:8080/api/pepper/status`)
            .then(response => response.json())
            .then((response) => {
                isPepperConnected = response["status"] === 1
            })
            .catch(err => console.error(err))
    }

    function setServerIP() {
        const value = window.localStorage.getItem("server-ip");
        if (!value || value === 0) {
            console.log("fetching server IP from localhost probably server location");
            fetch(`http://0.0.0.0:8080/api/server_ip`)
                .then(response => response.json())
                .then((response) => {
                    console.log("server IP from API", response["data"]);
                    serverIPStore.set(response["data"]);
                    serverIP = response["data"];
                    window.localStorage.setItem("server-ip", serverIP);
                })
                .catch(err => console.error(err))
        } else {
            console.log("got serverIP from localStorage", value);
            serverIPStore.set(value);
            serverIP = value;
        }
    }

    function setServerIPManually() {
        serverIPStore.set(serverIP);
        window.localStorage.setItem("server-ip", serverIP);
        location.reload();
        console.log("server IP set to", serverIP);
    }
</script>

<!--<svelte:component this={currentPage}/>-->

<style>
    main {
        display: grid;
        grid-template-columns: 4fr 2fr;
        grid-gap: 2em;
    }

    abbr {
        text-decoration: none;
        border-bottom: 1px dotted black;
    }

    @media (max-width: 800px) {
        main {
            grid-template-columns: 1fr;
        }
    }

    .sticky {
        position: sticky;
        top: 1em;
        background: white;
    }
</style>

<SiteHeader on:message={handlePseudoRedirect}/>
{#if currentPage === ""}
    <main class="p2">
        home
    </main>
{:else if currentPage === "sessions" }
    <Introduction title="" description="">
        {#if isPepperConnected}
            <div><abbr title="Pepper—server connection indicator">Pepper status</abbr>: 🟢</div>
        {:else}
            <div><abbr title="Pepper—server connection indicator">Pepper status</abbr>: ⚪</div>
        {/if}
        <div><abbr title="Enter this IP into the Server's IP field on Pepper's tablet">Server IP</abbr>:
            <input type="text" bind:value={serverIP}/> <button on:click={setServerIPManually}>set</button></div>
    </Introduction>
    <main class="p2 mt4">
        <SessionsList/>
        <div>
            <div class="sticky">
                <AudioLibrary/>
                <MotionLibrary/>
            </div>
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