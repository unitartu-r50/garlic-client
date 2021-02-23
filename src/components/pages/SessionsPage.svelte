<script>
    import {serverIPStore} from "../stores";
    import Introduction from '../Introduction.svelte';
    import SessionsList from '../sessions/SessionsList.svelte';
    import AudioLibrary from '../audio/AudioLibrary.svelte';
    import MotionLibrary from '../motions/MotionLibrary.svelte';
    import ActionLibrary from '../actions/ActionLibrary.svelte';
    import {notify} from "../Helpers.svelte";

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

    function importSession(event) {
        const reader = new FileReader();
        reader.addEventListener('load', (e) => {
            let data = new FormData();
            data.append("file_content", event.target.files[0]);

            fetch(`http://` + $serverIPStore + `:8080/api/sessions/import`, {
                method: "POST",
                body: data
            })
                .then(r => {
                    if (!r.ok) {
                        if (r["error"] && r["error"].length > 0) {
                            notify("negative", r["error"]);
                        }
                        throw Error(r.statusText);
                    }
                    return r.json();
                })
                .then(r => {
                    console.log(r);
                    notify("positive", r.message);
                })
                .catch(err => {
                    console.error(err);
                    notify("negative", err);
                })
        })
        reader.readAsArrayBuffer(event.target.files[0]);
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
    <div class="mb1">
        <abbr title="Pepper—server connection indicator">Pepper status</abbr>:
        {#if isPepperConnected}🟢{:else}⚪{/if}
    </div>
    <div class="mb1">
        <label for="serverIP"><abbr title="Enter this IP into the Server's IP field on Pepper's tablet">Server IP</abbr></label>:
        <input id="serverIP" type="text" bind:value={serverIP}/>
        <button on:click={setServerIPManually}>set</button>
    </div>
    <div class="mb1">
        <label for="import-session"><abbr title="You can import an already composed session by uploading its zip-archive">Import session</abbr>:</label>
        <input type="file" id="import-session"
               accept="zip,application/octet-stream,application/zip,application/x-zip,application/x-zip-compressed"
               on:change={importSession}/>

    </div>
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
