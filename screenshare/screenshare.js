console.log("loading screenshare");

const videoTag = document.getElementById("screenshareTrack");

let stream = new MediaStream([window.track]);
videoTag.srcObject = stream;
