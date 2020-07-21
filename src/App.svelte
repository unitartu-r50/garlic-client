<script context="module">
    export function notify(label, message) {
        // adding a notification item
        const notification = document.createElement("div");
        notification.classList.add("notification-item");
        notification.classList.add(label);
        notification.innerText = message;

        // global notifications container on each page
        const notifications = document.getElementById("notifications");
        notifications.appendChild(notification);

        // removing the notification after some time
        const timeoutID = window.setTimeout(() => {
            window.clearTimeout(timeoutID);
            notifications.removeChild(notification);
        }, 3000);
    }

    export function sendInstruction(id) {
        notify("positive", "command has been sent");
    }

    // TODO: login, logout page and corresponding auth API
    // TODO: router doesn't load a page on a direct URI, use server-side redirect
    // TODO: send real instructions to the server and display the response
    // TODO: "robot connected" indicator
    // TODO: favorite motions
    // TODO: sessions management system
</script>

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

    import { onMount } from 'svelte';

    import SiteHeader from './components/SiteHeader.svelte';
    import Introduction from './components/Introduction.svelte';
    import SessionsList from './components/SessionsList.svelte';
    import Motions from './components/Motions.svelte';

    let currentPage = "";

    $: {
        currentPage = localStorage.getItem("location");
    }

    function handlePseudoRedirect(event) {
        currentPage = event.detail.text;
    }
</script>

<!--<svelte:component this={currentPage}/>-->

<style>
    main {
        display: grid;
        grid-template-columns: 2fr 1fr;
        grid-gap: 1em;
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
        general motion library, so a user can initiate any movement at any time."/>
    <main class="p2 mt4">
        <SessionsList/>
        <Motions/>
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