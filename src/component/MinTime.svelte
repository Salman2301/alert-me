<script>
  export let value;
  
  const mins = [ ]
  // run for every 5 mins
  const inc = 5;
  for (let i = 0; i <= 60; i+=inc) mins.push(i);

</script>

<div class="dropdown">
  <label for="hours">Min</label>
  <select name="Minutes" id="mins" bind:value={value}>
    {#each mins as min}
      <option value={min}>{min}</option>
    {/each}
  </select>
</div>

<style>
  .dropdown {
    width: 150px;
  }
  #mins {
    width: 150px;
  }
</style>
