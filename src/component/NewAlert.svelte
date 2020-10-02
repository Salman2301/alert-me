<script>
  import HourTime from "./HourTime.svelte";
  import MinTim from "./MinTime.svelte";
  import { message, nextAlert, createdAt, stop, interval } from "../store.js";

  let hour = 0;
  let min = 5;
  let newMessage = "";
  let isAddOrUpdateAlert = false;

  const onSubmit = e => {
    clearInterval($interval);
    $stop = true;
    const today = new Date();
    today.setHours( today.getHours() + hour, today.getMinutes() + min, 0, 0);
    $nextAlert = today;
    $message = newMessage;
    $createdAt = new Date();
    const timeleft = $createdAt - $nextAlert;
    // console.log({ nextAlert: $nextAlert , today: new Date(), interval: $interval })
    $stop = false;
  }

  function toggleNewAlert() {
    isAddOrUpdateAlert = !isAddOrUpdateAlert
  }

</script>

<div class="newAlert">
  <button class="newAlertBtn" on:click={toggleNewAlert}>Toggle New Alert</button>
{#if isAddOrUpdateAlert}
  <div class="editAlert">

    <h1>Add or Update Alert</h1>
    <input type="message" placeholder="Alert me for..." id="message" bind:value={newMessage} >
    <p class="interval">Select an interval:</p>
    <div class="time">
      <HourTime bind:value={hour}/>
      <MinTim bind:value={min}/>
    </div>
    <button class="submitBtn" type="button" on:click={onSubmit} >Alert</button>

  </div>
{/if}
</div>

<style>
#message {
  width: 300px;
}
.interval {
  color: #676767;
  margin-bottom: 2px;
  font-weight: 600;
}
.time {
  width: 300px;
  display: flex;
}
</style>
