<script>
    import SiteHeader from '../components/SiteHeader.svelte';
    import Introduction from '../components/Introduction.svelte';
    import SessionsList from '../components/SessionsList.svelte';
    import Motions from '../components/Motions.svelte';
</script>

<SiteHeader/>
<Introduction title="Sessions Control" description="This dashboard allows the control of the Pepper robot through the local network simply by clicking corresponding
        buttons, either questions, or positive answers, or negative answers. On the right side, there is available the
        general motion library, so a user can initiate any movement at any time."/>
<main class="p2 mt4">
    <SessionsList/>
    <Motions/>
</main>