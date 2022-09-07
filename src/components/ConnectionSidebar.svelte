<script>
    import { serverIPStore, isPepperConnected } from './stores';
    import {notify} from "./Helpers.svelte";

    let serverIP = "unknown";
    var ping_period = 5000;
    let timeout;

    $: {
        setPepperStatus();
        setServerIP();
    }

    // setInterval(() => setPepperStatus(), ping_period);

    function setPepperStatus() {
        clearTimeout(timeout);
        fetch(`http://` + window.location.hostname + `:8080/api/pepper/status`)
            .then(response => response.json())
            .then((response) => {
                $isPepperConnected = response["status"] === 1;
                if ($isPepperConnected) {
                    ping_period = 15000
                } else {
                    ping_period = 5000;
                }
            })
            .catch(err => console.error(err))
        timeout = setTimeout(setPepperStatus, ping_period);
    }

    function setServerIP() {
        const value = window.localStorage.getItem("server-ip");
        if (!value || value === 0) {
            fetch('http://' + window.location.hostname + ':8080/api/server_ip')
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

    function stop_video() {
        fetch('http://' + window.location.hostname + ':8080/api/pepper/stop_video')
            .then(r => r.json())
            .then(r => {
                if (r.message) {
                    notify("positive", r.message);
                } else {
                    notify("negative", r.error);
                }
            })
    }

    timeout = setPepperStatus();
</script>

<style>
    #connection_sidebar {
        background-color: white;
        border-color: lightcyan;
        border-width: 5px;
    }
</style>

<div class="ui sidebar inverted vertical menu" id="connection_sidebar" style="display: inline-block;">
    <div class="ui container">
        <div class="ui hidden divider"></div>
        <div style="margin: 0 auto;">
            <abbr title="Pepper <—> Raspberry connection indicator">Pepper status</abbr>:
            {#if $isPepperConnected}<i class="check icon"></i>{:else}<i class="times icon"></i>{/if}
        </div>
        <div class="ui hidden divider"></div>
        <div style="margin: 0 auto;">
            <button class="ui button" on:click={stop_video}>Stop Video Playback</button>
        </div>
    </div>
</div>