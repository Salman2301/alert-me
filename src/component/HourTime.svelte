<script>
  const hours = [ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
  export let value;
</script>

<div class="dropdown">
  <label for="hours">Hour</label>
  <select name="Hours" id="hours" bind:value={value} >
    {#each hours as hour}
      <option value={hour}>{hour}</option>
    {/each}
  </select>
</div>

<style>
  .dropdown {
    width: 140px;
    margin-right: 10px;
  }
  #hours {
    width: 140px;
  }
</style>
