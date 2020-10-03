
<script>
  import { onDestroy, onMount } from "svelte";
  import { nextAlert, stop, interval, timeString, alertBox, currentTime } from "../store";
  import { playAlert } from "../utils.js";

  $: isLessThanMin = $timeString && $timeString.total < 1000*60;

  onMount(()=>{
    clearInterval($interval);
    initTimer($nextAlert);
  });

  onDestroy(()=>{
    // $stop = true;
    clearInterval($interval);
  });
  
  function initTimer() {
    clearInterval($interval);
    $interval = setInterval(async ()=>{
      console.log("test leak")
      if( $timeString.total <= 0 ) {
        await playAlert()
        $alertBox = true;
        clearInterval($interval);
        return;
      }
      $currentTime = new Date();
    }, 500)
  }

  interval.subscribe(val => {
    if(val && $stop )
      clearInterval($interval);
  });
  
  stop.subscribe(val=>{
    if(val){
      clearInterval($interval);
    } else {
      clearInterval($interval);
      initTimer($nextAlert);
    }
  })

</script>

{#if !$stop }
  <h1 class="timer" class:isRed={isLessThanMin} >{$timeString.string}</h1>
{/if}

<style>
  h1 {
    font-size: 6em;
    color: white !important;
  }
  
  .timer {
    color: white;
  }

  .isRed {
    color: red !important;
  }


</style>