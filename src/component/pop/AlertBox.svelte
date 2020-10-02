<script>
  import { onMount } from "svelte";
  import { alertBox, message } from "../../store.js";

  // onMount(()=>{
  //   console.log("show : " , show);
  // })
</script>

{#if $alertBox}
  <div class="overlay">
    <div class="alert-box">
      <div class="title">
        <p class="title-content">Alert</p>
        <div class="btn">
          <button class="close" on:click={()=>$alertBox=false}>X</button>
        </div>
      </div>
      
      <div class="message">
        <p>Are you still doing?
          <span>{$message}</span>
        </p>
      </div>
      
    </div>
  </div>
{/if}


<style>
.overlay{
  min-width: 100vw;
  min-height: 100vh;
  margin: 0;
  padding: 0;
  position: absolute;
  top: 0;
  left: 0;
  z-index: 100;
  overflow: hidden;
  background: rgba(0,0,0,0.22);

  justify-content: center;
  align-items: center;
}
p {
  margin: 0px 10px;
}
.alert-box {
  margin: auto;
  margin-top: 10%;
  width: 500px;
  height: 100px;
  border: 1px solid red;
  background-color: black;
}
.title {
  margin-left: 10px;
  margin-top: 10px;
  width: 90%;
  display: flex;
  justify-content: space-between;
}
.title-content {
  margin: -5px 5px;
  font-size: 1.5em;
  font-weight: 500;
  color: #bbb;
}
.message {
  margin: 5px;
}
.close {
  position: relative;
  top: -10px;
  right: 0px;
  left: 40px;
  margin-left: 25px;
  border: 0;
  border-radius: 0;
  width: 25px;
  height: 33px;
  background-color: red;
  font-size: 0.7em;
  font-weight: 600;
  cursor: pointer;
}

</style>