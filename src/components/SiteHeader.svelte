<script>
    import { pepperConnectionID, recording } from "./stores"
    import { notify } from "./Helpers.svelte";

    let update_ready = false;
    let checking = false;

    function openSidebar() {
        jQuery('.ui.sidebar').sidebar({
            onVisible: function(){
                if ($pepperConnectionID === null) {
                    setTimeout(function(){document.getElementById('conn_id_input').focus()},50)
                }}
        }).sidebar('show');
    }

    function check_update() {
        checking = true;
        fetch(`http://` + window.location.hostname + `:8080/api/check_update`)
            .then(r => r.json())
            .then(d => {
                update_ready = d.update_available;
                if (update_ready) {
                    notify("warning", "Update available!")
                } else {
                    notify("positive", "Up to date!")
                }
            })
            .catch(err => {
                console.error("error:", err);
            })
            .finally(() => {
                checking = false;
            });
    }


    function confirmRebuild() {
        jQuery('#rebuild-modal').dimmer({closable:false}).modal('show');
    }

    function rebuild() {
        fetch(`http://` + window.location.hostname + `:8080/api/rebuild`)
            .then(r => {
                location.reload();
            })
            .catch(err => {
                console.error("error:", err);
            });
    }

    function confirmUpdate() {
        jQuery('#update-modal').dimmer({closable:false}).modal('show');
    }

    function update() {
        fetch(`http://` + window.location.hostname + `:8080/api/update`)
            .then(r => {
                update_ready = false;
                location.reload();
            })
            .catch(err => {
                console.error("error:", err);
            });
    }

    function confirmShutdown() {
        jQuery('#shutdown-modal').dimmer({closable:false}).modal('show');
    }

    function shutdown() {
        fetch(`http://` + window.location.hostname + `:8080/api/shutdown`)
            .catch(err => {
                console.error("error:", err);
            });
    }
</script>

<style>
    #logo-title:hover, #logo-title:focus {
        font-style: italic;
    }

    .logo {
        height: 40px;
    }

    #logo-title {
        color: black;
        text-decoration: none;
        font-size: 1.25em;
        padding-bottom: .2em;
    }

    header {
        background: #9FF1FF;
        width: 100%;
        height: 57px;
        margin-bottom: 14px;
    }

    .span {
        display: inline-flex;
        align-items: center;
        background: #9FF1FF;
        text-align: center;
    }

    .button, .button:hover, .button:focus {
        background: #9FF1FF;
    }

    .serverbutton {
        background: #61D2E6;
    }

    .serverbutton:hover, .serverbutton:focus {
        background: #71DBEE !important;
    }
</style>

<header>
    <div class="ui basic mini modal" id="rebuild-modal">
        <div class="ui icon header">
            <i class="redo icon"></i>
            Rebuild
        </div>
        <div class="content">
            <p>You are about to rebuild the site. This will make the application unusable for a few minutes. Proceed?</p>
        </div>
        <div class="actions" style="display: flex; justify-content: space-between;">
            <span class="ui red basic cancel inverted button" on:click={rebuild}>
                <i class="checkmark icon"></i>Yes
            </span>
            <span class="ui green ok inverted button">
                <i class="remove icon"></i>No
            </span>
        </div>
    </div>
    <div class="ui basic mini modal" id="update-modal">
        <div class="ui icon header">
            <i class="arrow circle down icon"></i>
            Update
        </div>
        <div class="content">
            <p>You are about to update the services. This will make the application unusable for a few minutes. Proceed?</p>
        </div>
        <div class="actions" style="display: flex; justify-content: space-between;">
            <span class="ui red basic cancel inverted button" on:click={update}>
                <i class="checkmark icon"></i>Yes
            </span>
            <span class="ui green ok inverted button">
                <i class="remove icon"></i>No
            </span>
        </div>
    </div>
    <div class="ui basic mini modal" id="shutdown-modal">
        <div class="ui icon header">
            <i class="power off icon"></i>
            Shutdown
        </div>
        <div class="content">
            <p>Really shut down?</p>
        </div>
        <div class="actions" style="display: flex; justify-content: space-between;">
            <span class="ui red basic cancel inverted button" on:click={shutdown}>
                <i class="checkmark icon"></i>Yes
            </span>
            <span class="ui green ok inverted button">
                <i class="remove icon"></i>No
            </span>
        </div>
    </div>
    <div style="display: flex; justify-content: space-between; height: 100%;">
        <span class="ui compact button span" on:click|preventDefault={openSidebar}>
            {#if $pepperConnectionID == null}
            <img src="/images/pepper_silhouette.png" class="logo" alt="Pepper Control">
            {:else}
            <img src="/images/pepper.png" class="logo" alt="Pepper Control">
            {/if}
            <span id="logo-title" class="ui float right">Pepper</span>
        </span>
        {#if $recording}
            <span class="span" style="font-size: 2em;">
                <button class="ui red basic button" style="background-color: #ffffff;">
                    <i class="ui red circle icon"></i>
                    Recording...
                </button>
            </span>
        {/if}
        <span class="span">
            <button data-tooltip="Rebuild site" data-position="bottom right" data-inverted="" class="ui icon button serverbutton" on:click={confirmRebuild}>
                <i class="large redo icon"></i>
            </button>
            {#if update_ready}
                <button id="update" data-tooltip="Update" data-position="bottom right" data-inverted="" class="ui icon button serverbutton" on:click={confirmUpdate}>
                    <i class="large arrow circle down icon"></i>
                </button>
            {:else if checking}
                <button id="checking" data-tooltip="Checking for updates..." data-position="bottom right" data-inverted="" class="ui icon button serverbutton">
                    <i class="large notched circle loading icon"></i>
                </button>
            {:else}
                <button id="check" data-tooltip="Check for updates" data-position="bottom right" data-inverted="" class="ui icon button serverbutton" on:click={check_update}>
                    <i class="large sync alternate icon"></i>
                </button>
            {/if}
            <button data-tooltip="Shut Raspberry down" data-position="bottom right" data-inverted="" class="ui icon button serverbutton" on:click={confirmShutdown}>
                <i class="large power off icon"></i>
            </button>
            <i class="big grey server icon"></i>
        </span>
    </div>
</header>
