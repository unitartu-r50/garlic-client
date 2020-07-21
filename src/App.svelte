<script context="module">
	export function notify(label, message) {
		// adding a notification item
		const notification = document.createElement("div");
		notification.classList.add("notification-item");
		notification.classList.add(label);
		notification.innerText = message;

		// global notifications container on each page
		const notifications = document.getElementById("notifications");
		notifications.appendChild(notification);

		// removing the notification after some time
		const timeoutID = window.setTimeout(() => {
			window.clearTimeout(timeoutID);
			notifications.removeChild(notification);
		}, 3000);
	}

	export function sendInstruction(id) {
		notify("positive", "command has been sent");
	}
</script>

<script>
	import SiteHeader from './SiteHeader.svelte';
	import Introduction from './Introduction.svelte';
	import Sessions from './Sessions.svelte';
	import Motions from './Motions.svelte';
</script>

<style>
	main {
		display: grid;
		grid-template-columns: 2fr 1fr;
		grid-gap: 1em;
	}
</style>

<SiteHeader/>
<Introduction/>
<main class="p2 mt4">
	<Sessions/>
	<Motions/>
</main>
<div id="notifications" class="notifications"></div>