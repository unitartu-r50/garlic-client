<script>
    import { isPepperConnected, motionsFetchNeeded } from "./components/stores";
    import SiteHeader from './components/SiteHeader.svelte';
    import ConnectionSidebar from './components/ConnectionSidebar.svelte';
    import SessionsPage from './components/sessions/SessionsPage.svelte';
    import AudioLibrary from './components/audio/AudioLibrary.svelte';
    import MotionLibrary from './components/motions/MotionLibrary.svelte';
    import ActionLibrary from './components/actions/ActionLibrary.svelte';

    let isSessionsFetchNeeded = true;

    $: if ($isPepperConnected) {
        $motionsFetchNeeded = true;
    }
</script>

<ConnectionSidebar/>
<div class="pusher">
    <SiteHeader/>
    <div class="ui grid" style="width: 100%;">
        <div class="eleven wide column">
            <SessionsPage bind:isFetchNeeded={isSessionsFetchNeeded}/>
        </div>
        <div class="five wide column">
            <div style="position: sticky; top: 0;">
                <div class="ui fitted horizontal divider">Shortcuts</div>
                <ActionLibrary/>
                <AudioLibrary/>
                <MotionLibrary/>
            </div>
        </div>
    </div>
</div>

<div id="notifications" class="notifications"></div>
