<script>
    import SiteHeader from '../components/SiteHeader.svelte';
    import Introduction from '../components/Introduction.svelte';
    // import SessionsList from '../components/SessionsList.svelte';
    // import Motions from '../components/MotionLibrary.svelte';
</script>

<SiteHeader/>
<Introduction title="Login" description="To get access to the system, please, enter the password given to you."/>
<main class="p2 mt4">
    <form action="">
        <label for="password">
            <span class="mb1 block">Password</span>
            <input type="password" name="password" id="password">
        </label>
        <input type="submit" value="Login">
    </form>
</main>