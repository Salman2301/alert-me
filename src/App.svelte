<script>	
	import NewAlert from "./component/NewAlert.svelte";
	import ShowAlert from "./component/ShowAlert.svelte"
	// set one alert
	// set the message and interval
	// Start and stop that alert
	// Show the next alert
	// Save it to local host

</script>

<svelte:head>
	<link href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400&display=swap" rel="stylesheet">
</svelte:head>

<ShowAlert />

<div class="newAlert">
	<NewAlert />
</div>

<style>
	:global(h1) {
		font-family: "Roboto", Arial, Helvetica, sans-serif;
    font-weight: 400;
	}
	.newAlert {
		margin-top: 100px;
	}
</style>