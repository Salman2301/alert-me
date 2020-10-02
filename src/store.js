
import { writable, derived } from 'svelte/store';

export const alertObj = writable({});

export const message = writable("I am writing code in Wix.");
export const createdAt = writable(new Date());
export const nextAlert = writable(new Date());
export const currentTime = writable(new Date());
export const stop = writable(true);
export const alertBox = writable(false);
export const timeString = derived([nextAlert, currentTime], formatTimeStr);
export const interval = writable(undefined);


function formatTimeStr([$nextAlert, $currentTime]) {

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
