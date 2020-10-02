<script>
  import { message, stop } from "../store.js";
  import Timer from "./Timer.svelte";
</script>

{#if !$stop }
  <h1 class="title">Upcoming Alert In </h1>
  <div class="alert">
    <Timer />
    
    <div class="message">
      <p>{$message}</p>
    </div>
  </div>
{/if}

<style>
  .message > p {
    font-size: 22px;
  }
  
  .title, .alert {
    text-align: center;
  }
  .title {
    color: #b4b4b4
  }
</style>