<script>
    import {serverIPStore} from "./stores";
    import Introduction from './Introduction.svelte';
    import SessionsList from './SessionsList.svelte';
    import AudioLibrary from './AudioLibrary.svelte';
    import MotionLibrary from './MotionLibrary.svelte';
    import ActionLibrary from './ActionLibrary.svelte';

    let isPepperConnected = false;
    let serverIP = "unknown";

    $: {
        setPepperStatus();
        setServerIP();
    }

    setInterval(() => setPepperStatus(), 5000);

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

<Introduction title="" description="">
    {#if isPepperConnected}
        <div><abbr title="Pepper—server connection indicator">Pepper status</abbr>: 🟢</div>
    {:else}
        <div><abbr title="Pepper—server connection indicator">Pepper status</abbr>: ⚪</div>
    {/if}
    <div><label for="serverIP"><abbr title="Enter this IP into the Server's IP field on Pepper's tablet">Server IP</abbr></label>:
        <input id="serverIP" type="text" bind:value={serverIP}/> <button on:click={setServerIPManually}>set</button></div>
</Introduction>
<main class="p2 mt4">
    <SessionsList/>
    <div>
        <div class="sticky">
            <ActionLibrary/>
            <AudioLibrary/>
            <MotionLibrary/>
        </div>
    </div>
</main>
