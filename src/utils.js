

const audio = new Audio('sound/beep.mp3');

export function playAlert() {
  // return audio.play();
  return new Promise(res=>{
    audio.play();
    setTimeout(()=>{audio.play()}, 500);
    setTimeout(()=>{audio.play(); }, 1000);
    setTimeout(()=>{audio.play();   res() }, 1200 );
  });
}

export function formatTimeStr([$nextAlert, $currentTime]) {

  let string = "";

  const total = Math.max( ( Date.parse($nextAlert) - Date.parse(new Date()) ), 0 );
  const seconds = Math.floor( (total/1000) % 60 );
  const minutes = Math.floor( (total/1000/60) % 60 );
  const hours = Math.floor( (total/(1000*60*60)) % 24 );
  const days = Math.floor( total/(1000*60*60*24) );

  const isMorethanHour = (hours) >= 1;
  const isMorethanMin = (minutes) >= 1;

  if( isMorethanHour ) string = `${hours}h`;
  if( isMorethanMin ) string += ` ${minutes}m`;
  
  string += ` ${ seconds }s`;
  return { string, total };
}
