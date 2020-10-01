<script>
  import { createdAt, nextAlert, message } from "../store";

  const audio = new Audio('sound/beep.mp3');

  let timeString = "loading";
  let interval;
  
  // initTimer();
  
  function initTimer() {
    clearInterval(interval);
    interval = setInterval(()=>{
      timeString = "";

      const total = Date.parse($nextAlert) - Date.parse(new Date());
      const seconds = Math.floor( (total/1000) % 60 );
      const minutes = Math.floor( (total/1000/60) % 60 );
      const hours = Math.floor( (total/(1000*60*60)) % 24 );
      const days = Math.floor( total/(1000*60*60*24) );

      const isMorethanHour = (hours) >= 1;
      const isMorethanMin = (minutes) >= 1;

      if( isMorethanHour ) timeString = `${hours}h`;
      if( isMorethanMin ) timeString += ` ${minutes}m`;
      
      timeString += ` ${ seconds }s`;
      
      if( total <= 0) {
        audio.play();
        clearInterval(interval);
        alert(`Are you still doing this task?: ${ $message }`);
      }
      console.log(1)
    }, 500)
  }

  message.subscribe(val=>{
    initTimer();
  })
  

</script>


<h1>{timeString}</h1>

<style>
  h1 {
    font-size: 3em;
  }
</style>