

const audio = new Audio('sound/beep.mp3');
export function playAlert() {
  audio.play();
  setTimeout(audio.play, 500);
  setTimeout(audio.play, 1000);
  setTimeout(audio.play, 1500);

}