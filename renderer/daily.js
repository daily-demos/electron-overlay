// daily.js contains all DailyJS listeners and call joining/leaving logic.

import {
  registerJoinFormListener,
  registerLeaveBtnListener,
  registerCamBtnListener,
  registerMicBtnListener,
  updateCamBtn,
  updateCallControls,
  updateMicBtn,
} from "./nav.js";
import {
  updateLocalTile,
  addOrUpdateTile,
  initLocalTile,
  removeAllTiles,
  removeTile,
} from "./tile.js";

let callObject = null;
let localState = {
  audio: false,
  video: false,
};

registerJoinFormListener(initAndJoin);
registerLeaveBtnListener(leave);
registerCamBtnListener(toggleCamera);
registerMicBtnListener(toggleMicrophone);

async function initAndJoin(roomURL, name) {
  initLocalTile();
  callObject = DailyIframe.createCallObject()
    .on("camera-error", handleCameraError)
    .on("joined-meeting", handleJoinedMeeting)
    .on("left-meeting", handleLeftMeeting)
    .on("error", handleError)
    .on("participant-updated", handleParticipantUpdated)
    .on("participant-joined", handleParticipantJoined)
    .on("participant-left", handleParticipantLeft);
  try {
    console.log("Joining " + roomURL);
    await callObject.join({ url: roomURL, userName: name });
  } catch (e) {
    console.error(e);
  }
}

async function leave() {
  callObject.leave();
  callObject = null;
  updateCallControls(false);
}

function toggleCamera() {
  callObject.setLocalVideo(!localState.video);
}

function toggleMicrophone() {
  callObject.setLocalAudio(!localState.audio);
}

function handleCameraError(event) {
  console.error(event);
}

function handleError(event) {
  console.error(event);
}

function handleJoinedMeeting(event) {
  updateCallControls(callObject !== null);
  const p = event.participants.local;
  updateLocal(p);
}

function handleLeftMeeting() {
  removeAllTiles();
}

function handleParticipantUpdated(event) {
  const up = event.participant;
  if (up.session_id === callObject.participants().local.session_id) {
    updateLocal(up);
    return;
  }
  addOrUpdateTile(up.session_id, up.user_name, up.videoTrack, up.audioTrack);
}

function handleParticipantJoined(event) {
  const up = event.participant;
  addOrUpdateTile(up.session_id, up.user_name, up.videoTrack, up.audioTrack);
}

function handleParticipantLeft(event) {
  const up = event.participant;
  removeTile(up.session_id);
}

function updateLocal(p) {
  if (localState.audio != p.audio) {
    localState.audio = p.audio;
    updateMicBtn(localState.audio);
    // Was thinking of early return here, but unsure if updates can be bundled?
  }
  if (localState.video != p.video) {
    localState.video = p.video;
    updateCamBtn(localState.video);
    updateLocalTile(p.videoTrack);
  }
}
