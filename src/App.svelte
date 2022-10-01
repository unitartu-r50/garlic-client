<script>
    import { pepperConnectionID, motionsFetchNeeded } from "./components/stores";
    import SiteHeader from './components/SiteHeader.svelte';
    import ConnectionSidebar from './components/ConnectionSidebar.svelte';
    import SessionsPage from './components/sessions/SessionsPage.svelte';
    import MotionLibrary from './components/motions/MotionLibrary.svelte';
    import ActionLibrary from './components/actions/ActionLibrary.svelte';

    let isSessionsFetchNeeded = true;

    $: if ($pepperConnectionID != null) {
        $motionsFetchNeeded = true;
    }
</script>
<style>
    #shortcut-sidebar:after {
        content: "";
        position: absolute;
        z-index: 1;
        bottom: 0;
        left: 0;
        pointer-events: none;
        background-image: linear-gradient(to bottom, rgba(255,255,255,0), rgba(255,255,255, 1) 90%);
        width: 100%;
        height: 4em;
    }
</style>
<ConnectionSidebar/>
<div class="pusher">
    <SiteHeader/>
    <div class="ui grid" style="width: 100%; height: calc(100vh - 57px); padding-left: 14px;">
        <div class="ten wide column" style="height: 100%; overflow: scroll;">
            <SessionsPage bind:isFetchNeeded={isSessionsFetchNeeded}/>
        </div>
        <div id="shortcut-sidebar" class="six wide column" style="height: 100%; width: 100%; padding: 0 0 14px 14px;">
            <div style="overflow: auto; height: 100%; width: 100%; padding: 0;">
                <div style="width: calc(100% - 10px);">
                    <div class="ui fitted horizontal divider" style="padding-top: 14px;">Shortcuts</div>
                    <ActionLibrary/>
                    <MotionLibrary/>
                </div>
            </div>
        </div>
    </div>
</div>

<div id="notifications" class="notifications"></div>
