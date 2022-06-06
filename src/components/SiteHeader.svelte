<script>
    import SiteHeaderMobile from "./SiteHeaderMobile.svelte";
    import { isPepperConnected } from "./stores"

    let isMobileMenuShown = false;

    function openSidebar() {
        jQuery('.ui.sidebar').sidebar('toggle');
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
            <button data-tooltip="Check for updates" data-position="bottom right" data-inverted="" class="ui icon button serverbutton">
                <i class="large sync alternate icon"></i>
            </button>
            <button data-tooltip="Shut Raspberry down" data-position="bottom right" data-inverted="" class="ui icon button serverbutton">
                <i class="large power off icon"></i>
            </button>
            <i class="big grey server icon"></i>
        </span>
    </div>
</header>
