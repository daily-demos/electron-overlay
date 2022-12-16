// daily.js contains all DailyJS listeners and call joining/leaving logic.

import {
  registerJoinListener,
  registerLeaveBtnListener,
  registerCamBtnListener,
  registerMicBtnListener,
  updateCamBtn,
  updateCallControls,
  updateMicBtn,
  registerBlurBtnListener,
  updateBlurBtn,
} from './nav';
import {
  addOrUpdateTile,
  removeAllTiles,
  removeTile,
  updateActiveSpeaker,
} from './tile';

const playableState = 'playable';

let callObject = null;
const localState = {
  audio: null,
  video: null,
  blur: false,
};

registerJoinListener(initAndJoin);
registerLeaveBtnListener(leave);
registerCamBtnListener(toggleCamera);
registerMicBtnListener(toggleMicrophone);
registerBlurBtnListener(toggleBlur);

async function initAndJoin(roomURL, name) {
  callObject = DailyIframe.createCallObject({
    dailyConfig: {
      experimentalChromeVideoMuteLightOff: true,
      avoidEval: true,
    },
  })
    .on('camera-error', handleCameraError)
    .on('joined-meeting', handleJoinedMeeting)
    .on('left-meeting', handleLeftMeeting)
    .on('error', handleError)
    .on('participant-updated', handleParticipantUpdated)
    .on('participant-joined', handleParticipantJoined)
    .on('participant-left', handleParticipantLeft)
    .on('active-speaker-change', handleActiveSpeakerChange)
    .on('input-settings-updated', handleInputSettingsChange);

  return callObject
    .join({ url: roomURL, userName: name })
    .then(() => true)
    .catch((err) => {
      alert(err);
      return false;
    });
}

async function leave() {
  callObject.leave();
  callObject.destroy();
  callObject = null;
}

function toggleCamera() {
  callObject.setLocalVideo(!localState.video);
}

function toggleMicrophone() {
  callObject.setLocalAudio(!localState.audio);
}

function toggleBlur() {
  let type;
  let config;
  if (!localState.blur) {
    type = 'background-blur';
    config = { strength: 0.95 };
  } else {
    type = 'none';
  }

  callObject.updateInputSettings({
    video: {
      processor: {
        type,
        config,
      },
    },
  });
}

function handleCameraError(event) {
  console.error(event);
}

function handleError(event) {
  console.log('got error');
  console.error(event);
}

function handleJoinedMeeting(event) {
  updateCallControls(true);
  const p = event.participants.local;
  updateLocal(p);
}

function handleLeftMeeting() {
  updateCallControls(false);
  removeAllTiles();
}

function handleParticipantUpdated(event) {
  const up = event.participant;
  if (up.session_id === callObject.participants().local.session_id) {
    updateLocal(up);
    return;
  }
  const tracks = getParticipantTracks(up);
  addOrUpdateTile(up.session_id, up.user_name, tracks.video, tracks.audio);
}

function handleParticipantJoined(event) {
  const up = event.participant;
  const tracks = getParticipantTracks(up);
  addOrUpdateTile(up.session_id, up.user_name, tracks.video, tracks.audio);
}

function getParticipantTracks(participant) {
  const vt = participant?.tracks.video;
  const at = participant?.tracks.audio;

  const videoTrack = vt.state === playableState ? vt.persistentTrack : null;
  const audioTrack = at.state === playableState ? at.persistentTrack : null;
  return {
    video: videoTrack,
    audio: audioTrack,
  };
}

function handleParticipantLeft(event) {
  const up = event.participant;
  removeTile(up.session_id);
}

function handleActiveSpeakerChange(event) {
  console.log('active speaker change', event.activeSpeaker.peerId);
  updateActiveSpeaker(event.activeSpeaker.peerId);
}

function handleInputSettingsChange(event) {
  localState.blur =
    event.inputSettings?.video?.processor?.type === 'background-blur';
  updateBlurBtn(localState.blur);
}

function updateLocal(p) {
  if (localState.audio !== p.audio) {
    localState.audio = p.audio;
    updateMicBtn(localState.audio);
  }
  if (localState.video !== p.video) {
    localState.video = p.video;
    updateCamBtn(localState.video);
  }
  const tracks = getParticipantTracks(p);
  addOrUpdateTile(p.session_id, 'You', tracks.video, tracks.audio, true);
}
