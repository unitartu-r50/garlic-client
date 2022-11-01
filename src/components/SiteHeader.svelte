<script>
    import { pepperConnectionID, recording, rec_disk_fill } from "./stores"
    import { notify } from "./Helpers.svelte";
    import { onMount } from 'svelte';

    var bar;
    let update_ready = false;
    let checking = false;

    function openSidebar() {
        jQuery('.ui.sidebar').sidebar('toggle');
    }

    function browse_rec_dir() {
        window.open('http://' + window.location.hostname + ':8080/data/recordings');
    }

    function confirmClear() {
        jQuery('#clearchive-modal').dimmer({closable:false}).modal('show');
    }

    function clearchives() {
        fetch(`http://` + window.location.hostname + `:8080/api/recording/clear_archives`)
            .then(r => r.json())
            .then(r => {
                if (r['error']){
                    notify("negative", r["error"]);
                } else {
                    notify("positive", r["message"]);
                    update_rec_fill();
                }
            })
            .catch(err => {
                console.error("error:", err);
            })
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

    function export_rec() {
        if ($recording) {
            notify("negative", "Please finish recording first!")
        }
        let icon = document.getElementById("export-rec-icon");
        icon.className = icon.className.replace(/(download)/g, 'asterisk loading');
        let btn = document.getElementById("export-rec-btn");
        btn.style.backgroundColor = "#FDCA81";
        notify("warning", "Exporting recording data, this may take a while. Please don't leave this browser session.", 5000);
        fetch('http://' + window.location.hostname + `:8080/api/recording/export`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        })
            .then(r => {
                if (!r.ok) {
                    throw Error(r.statusText);
                }
                return r.json();
            })
            .then(r => {
                notify("positive", r.message);
                window.open('http://' + window.location.hostname + `:8080/${r.relative_path}`);
                icon.className = icon.className.replace(/(asterisk loading)/g, 'download');
                btn.style.backgroundColor = "#61D2E6";
                update_rec_fill();
            })
            .catch(err => {
                console.error(err);
                notify("negative", err);
            });
    }

    function update_rec_fill() {
        fetch(`http://` + window.location.hostname + `:8080/api/pepper/status`)
            .then(response => response.json())
            .then((response) => {
                // I have no idea why this throws a meaningless error
                $rec_disk_fill = response["rec_fill"];
            })
            .catch(err => console.error(err))
    }

    onMount(() => {
        bar = new ProgressBar.Circle('#rec-space-chart', {
            trailColor: '#eee',
            duration: 1000,
            text: {
                autoStyleContainer: false
            },
            easing: 'easeInOut',
            strokeWidth: 8,
            from: {color: '#0F0', a:0},
            to: {color: '#F00', a:1},
            // Set default step function for all animate calls
            step: function(state, circle) {
                circle.path.setAttribute('stroke', state.color);

                var value = Math.round(circle.value() * 100);
                circle.setText(value);
            }
        });

        update_rec_fill();
        jQuery('.ui.dropdown').dropdown();
    });

    $: if ($rec_disk_fill !== -1 && bar) {
        bar.animate($rec_disk_fill)
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

    .item {
        text-align: center;
    }
    .danger {
        background: #FD8181 !important;
    }
    .danger:hover, .danger:focus {
        background: #ff4444 !important;
    }
</style>

<header>
    <div class="ui basic mini modal" id="clearchive-modal">
        <div class="ui icon header">
            <i class="trash icon"></i>
            Clear recording archives
        </div>
        <div class="content">
            <p>You are about to delete archived recordings. This cannot be undone. Proceed?</p>
        </div>
        <div class="actions" style="display: flex; justify-content: space-between;">
            <span class="ui red basic cancel inverted button" on:click={clearchives}>
                <i class="checkmark icon"></i>Yes
            </span>
            <span class="ui green ok inverted button">
                <i class="remove icon"></i>No
            </span>
        </div>
    </div>
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
            <span class="ui buttons" style="font-size: 1rem; margin-right: 0;">
                <span class="ui labeled button" data-position="left center" data-inverted="" data-tooltip="Recording storage fill percentage. Recording is only possible with free storage. You can clear the storage after exporting the data.">
                    <span class="ui basic right pointing label" style="height: 3.071428rem; border-radius: 0.285714rem;">
                        <span id="rec-space-chart" style="height: 100%; width: 2.5rem; margin-bottom: 0.6rem"></span>
                    </span>
                    <button id="export-rec-btn" class="ui icon button serverbutton" on:click={export_rec}>
                        <i id="export-rec-icon" class="large download icon">
                    </button>
                </span>
                <button class="ui floating dropdown icon button serverbutton" style="padding-left: 0; padding-right: 0;">
                    <i class="large caret down icon"></i>
                    <div class="menu"> 
                        <div class="item" on:click={browse_rec_dir}>Browse recordings</div>
                        <div class="danger item" on:click={confirmClear}>Clear archives</div>
                    </div>
                </button>
            </span>
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
