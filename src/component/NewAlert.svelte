<script>
  import HourTime from "./HourTime.svelte";
  import MinTim from "./MinTime.svelte";
  import { message, nextAlert, createdAt, stop } from "../store.js";

  let hour = 0;
  let min = 5;
  let newMessage = "";
  const onSubmit = e => {
    const today = new Date();
    today.setHours( today.getHours() + hour, today.getMinutes() + min, 0, 0);
    $nextAlert = today;
    $message = newMessage;
    $createdAt = new Date();
    $stop = false;
  }

</script>

<h1>Add or Update Alert</h1>
<input type="message" placeholder="Alert me for..." id="message" bind:value={newMessage} >
<p class="interval">Select an interval:</p>
<div class="time">
  <HourTime bind:value={hour}/>
  <MinTim bind:value={min}/>
</div>
<button type="button" on:click={onSubmit} >Alert</button>

<style>
#message {
  width: 310px;
}
.interval {
  color: #676767;
  margin-bottom: 2px;
  font-weight: 600;
}
.time {
  width: 310px;
  display: flex;
}
</style>
