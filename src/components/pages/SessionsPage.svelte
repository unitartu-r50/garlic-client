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
    let overwrite = false;
    let isSessionsFetchNeeded = true;

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

    function importSession() {
        const el = document.getElementById("import-session-file");
        if (!el) {
            console.error("can't find #import-session-file in the document");
            return
        }

        const reader = new FileReader();
        reader.addEventListener('load', (e) => {
            let data = new FormData();
            data.append("file_content", el.files[0]);
            data.append("overwrite", String(overwrite));

            fetch(`http://` + $serverIPStore + `:8080/api/session_import`, {
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
                    isSessionsFetchNeeded = true;
                    // resetting the form
                    overwrite = false;
                    el.value = "";
                })
                .catch(err => {
                    console.error(err);
                    notify("negative", err);
                })
        })
        reader.readAsArrayBuffer(el.files[0]);
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
        <label for="import-session-file"><abbr title="You can import an already composed session by uploading its zip-archive">Import session</abbr>:</label>
        <div class="block">
            <input class="block mt1 ml2" type="file" id="import-session-file"
                   accept="zip,application/octet-stream,application/zip,application/x-zip,application/x-zip-compressed"/>
            <div class="mt1 ml2 flex items-center">
                <button on:click={importSession}>Import</button>
                <label class="ml1 h6" for="overwrite-on-import" title="Overwrite a session if it exists already">
                    <input type="checkbox" id="overwrite-on-import" bind:checked={overwrite} />
                    overwrite
                </label>
            </div>

        </div>
    </div>
</Introduction>
<main class="p2 mt4">
    <SessionsList bind:isFetchNeeded={isSessionsFetchNeeded} />
    <div>
        <div class="sticky">
            <ActionLibrary/>
            <AudioLibrary/>
            <MotionLibrary/>
        </div>
    </div>
</main>
