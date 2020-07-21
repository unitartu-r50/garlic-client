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
	import Home from './pages/Home.svelte';
	import About from './pages/About.svelte';
	import Sessions from './pages/Sessions.svelte';

	import router from "page";

	let currentPage = Home;

	router('/', () => (currentPage = Home));
	router('/about', () => (currentPage = About));
	router('/sessions', () => (currentPage = Sessions));
	router.start();
</script>

<style>
	main {
		display: grid;
		grid-template-columns: 2fr 1fr;
		grid-gap: 1em;
	}
</style>

<div>
	<svelte:component this={currentPage}/>
	<div id="notifications" class="notifications"></div>
</div>
