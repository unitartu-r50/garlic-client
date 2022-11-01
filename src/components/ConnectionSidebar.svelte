<script>
    import { pepperConnectionID, rec_disk_fill } from './stores';

    var ping_period = 5000;
    let status_time;

    function sidebar_notify(label, message) {
        const notification = document.getElementById("sidebar-notification-msg");
        notification.className = notification.className.replace(/(warning)|(negative)|(positive)/g, `${label}`)
        notification.innerText = message;
        notification.style.opacity = '1';

        let fadetime = 5000;
        if (label !== "positive") {
            fadetime = 3000;
        }

        const timeoutID = window.setTimeout(() => {
            window.clearTimeout(timeoutID);
            notification.style.opacity = '0';
        }, fadetime);
    }

    function setPepperStatus() {
        clearTimeout(status_time);
        fetch(`http://` + window.location.hostname + `:8080/api/pepper/status?` + new URLSearchParams({'conn': $pepperConnectionID}))
            .then(response => response.json())
            .then((response) => {
                if (response["status"] === 1) {
                    ping_period = 12000;
                    status_time = setTimeout(setPepperStatus, ping_period);
                } else {
                    $pepperConnectionID = null;
                }
                $rec_disk_fill = response["rec_fill"];
            })
            .catch(err => console.error(err))
    }

    function stop_video() {
        fetch('http://' + window.location.hostname + ':8080/api/pepper/stop_video?' + new URLSearchParams({'conn': $pepperConnectionID}))
            .then(r => r.json())
            .then(r => {
                if (r.message) {
                    sidebar_notify("positive", r.message);
                } else {
                    sidebar_notify("negative", r.error);
                }
            })
    }

    function connect() {
        const conn_id = jQuery('#conn_id_input').val();
        console.log("Attempting to connect to " + conn_id);
        fetch('http://' + window.location.hostname + ':8080/api/pepper/connect?' + new URLSearchParams({'conn': conn_id}))
            .then(response => response.json())
            .then((r) => {
                if (r['error']) {
                    sidebar_notify("negative", r['error']);
                } else {
                    $pepperConnectionID = conn_id;
                    status_time = setPepperStatus()
                    sidebar_notify("positive", r['message']);
                }
            })
            .catch(error => {
                sidebar_notify("negative", error);
                console.log(error)
            })
    }

    function disconnect() {
        fetch('http://' + window.location.hostname + ':8080/api/pepper/disconnect?' + new URLSearchParams({'conn': $pepperConnectionID}))
            .then(response => response.json())
            .then((r) => {
                if (r['error']) {
                    sidebar_notify("negative", r['error']);
                } else {
                    $pepperConnectionID = null;
                    window.clearTimeout(status_time);
                    sidebar_notify("positive", r['message']);
                }
            })
    }

    function input_keyup(event) {
        if (event.key == "Enter") {
            connect();
        }
    }
</script>

<style>
    #connection_sidebar {
        background-color: white;
        border-color: lightcyan;
        border-width: 5px;
    }

    #conn_id_input::-webkit-outer-spin-button,
    #conn_id_input::-webkit-inner-spin-button {
        -webkit-appearance: none;
        margin: 0;
    }

    #sidebar-notification-msg {
        position: absolute;
        bottom: 0;
        margin-left: auto;
        margin-right: auto;
        left: 0;
        right: 0;
        text-align: center;
        transition: opacity 1s;
        opacity: 0;
    }
</style>

<div class="ui sidebar inverted vertical menu" id="connection_sidebar" style="display: inline-block;">
    <div class="ui container" style="height: 100%;">
        <div class="ui hidden divider"></div>
        <div style="margin: 0 auto;">
            <abbr title="You are linked to a robot!">Pepper connection</abbr>:
            {#if $pepperConnectionID !== null}<i class="check icon"></i>{:else}<i class="times icon"></i>{/if}
        </div>
        <div class="ui hidden divider"></div>
        {#if $pepperConnectionID == null}
        <div style="margin: 0 auto;">
            <h5>Enter your connection code here:</h5>
        </div>
        <div style="margin: 0 auto;">
            <span class="ui input">
                <input type="text" id="conn_id_input" pattern="^[0-9]{4}$" placeholder="XXXX" style="padding-top: 8px !important; width: 5em; text-align: center;" on:keyup={input_keyup}>
            </span>
            <button class="ui button" on:click={connect} style="width: 7em;">Connect</button>
        </div>
        {:else}
        <div style="margin: 0 auto;">
            <button class="ui button" on:click={disconnect}>Disconnect robot</button>
        </div>
        <div class="ui hidden divider"></div>
        <div style="margin: 0 auto;">
            <button class="ui button" on:click={stop_video}>Stop Video Playback</button>
        </div>
        {/if}
        <div style="height: 100%; position: relative; width: 100%;">
            <span id="sidebar-notification-msg" class="ui positive message">
                Notification placeholder
            </span>
        </div>
    </div>
</div>