<script>
    import SiteHeaderMobile from "./SiteHeaderMobile.svelte";
    import { isPepperConnected } from "./stores"
    import { notify } from "./Helpers.svelte";

    let isMobileMenuShown = false;
    let update_ready = false;
    let checking = false;

    function openSidebar() {
        jQuery('.ui.sidebar').sidebar('toggle');
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

    function shutdown() {
        fetch(`http://` + window.location.hostname + `:8080/api/shutdown`)
            .catch(err => {
                console.error("error:", err);
            });
    }
</script>

<style>
    span:hover, span:focus {
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
        margin-bottom: 10px;
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
        background: #71DBEE;
    }
</style>

<header>
    <div style="display: flex; justify-content: space-between; height: 100%;">
        <span class="ui compact button span" on:click|preventDefault={openSidebar}>
            {#if $isPepperConnected}
            <img src="/images/pepper.png" class="logo" alt="Pepper Control">
            {:else}
            <img src="/images/pepper_silhouette.png" class="logo" alt="Pepper Control">
            {/if}
            <span id="logo-title" class="ui float right">Pepper</span>
        </span>
        <span class="span">
            {#if update_ready}
                <button id="update" data-tooltip="Update" data-position="bottom right" data-inverted="" class="ui icon button serverbutton" on:click={update}>
                    <i class="large arrow circle down icon"></i>
                </button>
            {:else if checking}
                <button id="checking" data-tooltip="Checking for updates..." data-position="bottom right" data-inverted="" class="ui icon button serverbutton">
                    <i class="large question circle icon"></i>
                </button>
            {:else}
                <button id="check" data-tooltip="Check for updates" data-position="bottom right" data-inverted="" class="ui icon button serverbutton" on:click={check_update}>
                    <i class="large sync alternate icon"></i>
                </button>
            {/if}
            <button data-tooltip="Shut Raspberry down" data-position="bottom right" data-inverted="" class="ui icon button serverbutton" on:click={shutdown}>
                <i class="large power off icon"></i>
            </button>
            <i class="big grey server icon"></i>
        </span>
    </div>
</header>
