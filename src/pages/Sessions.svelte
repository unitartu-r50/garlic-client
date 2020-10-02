<script>
    import SiteHeader from '../components/SiteHeader.svelte';
    import Introduction from '../components/Introduction.svelte';
    import SessionsList from '../components/SessionsList.svelte';
    import MotionLibrary from '../components/MotionLibrary.svelte';
</script>

<style>
    main {
        display: grid;
        grid-template-columns: 2fr 1fr;
        grid-gap: 1em;
    }
</style>

<SiteHeader/>
<Introduction title="Sessions Control" description="This dashboard allows the control of the Pepper robot through the local network simply by clicking corresponding
        buttons, either questions, or positive answers, or negative answers. On the right side, there is available the
        general motion library, so a user can initiate any movement at any time.">
    <p>something new</p>
    <h2 class="h2">hoh</h2>
</Introduction>
<main class="p2 mt4">
    <SessionsList/>
    <MotionLibrary/>
</main>