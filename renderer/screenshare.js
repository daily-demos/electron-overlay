let shareWindows = {};
const playableState = "playable";

export function checkScreenShare(sessionID, track) {
  // If the session ID is in currently sharing sessions
  // but the track is NOT playable, close the window
  if (shareWindows[sessionID] && track.state !== playableState) {
    stopScreenShare(sessionID);
    return;
  }
  if (track.state === playableState && !shareWindows[sessionID]) {
    startScreenShare(sessionID, track.persistentTrack);
  }
}

function startScreenShare(sessionID, track) {
  const win = window.open("./screenshare/index.html", "Screen Sharing");
  win.track = track;
  shareWindows[sessionID] = win;
}

function stopScreenShare(sessionID) {
  console.log("Stopping screen share: ", sessionID);
  shareWindows[sessionID]?.close();
  delete shareWindows[sessionID];
}
