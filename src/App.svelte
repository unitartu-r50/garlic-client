<script>
	export let name;
	import SiteHeader from './SiteHeader.svelte';
	import Introduction from './Introduction.svelte';
	import Sessions from './Sessions.svelte';
	import Motions from './Motions.svelte';
</script>

<style>
	main {
		display: grid;
		grid-template-columns: 2fr 1fr;
	}
</style>

<SiteHeader/>
<Introduction/>
<main class="p2 mt4">
	<Sessions/>
	<Motions/>
</main>
