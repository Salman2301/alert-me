<script>	
	import { onMount } from "svelte";
	import NewAlert from "./component/NewAlert.svelte";
	import ShowAlert from "./component/ShowAlert.svelte";
	import AlertBox from "./component/pop/AlertBox.svelte";

	import { timeString, stop } from "./store.js";
	// set one alert
	// set the message and interval
	// Start and stop that alert
	// Show the next alert
	// Save it to local host

	// set dynamic title
	$: newTitle = "Timer";

	onMount(()=>{
		timeString.subscribe($timeString=>{
			if($timeString.total > 0 ) newTitle = $timeString.string;
		});

		stop.subscribe($stop =>{
			if ( $stop ) newTitle = "Timer";
		});
	});

</script>

<svelte:head>
	<title>{newTitle}</title>
	<link href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400&display=swap" rel="stylesheet">
</svelte:head>

<ShowAlert />
<AlertBox />
<NewAlert />

<style>
	:global(h1) {
		font-family: "Roboto", Arial, Helvetica, sans-serif;
    font-weight: 400;
	}
</style>