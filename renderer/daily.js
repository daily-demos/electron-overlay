/* let callFrame = window.DailyIframe.createFrame();
callFrame.join({ url: 'https://liza.staging.daily.co/hello' }); */
import { registerJoinFormListener, registerLeaveBtnListener, registerCamBtnListener, registerMicBtnListener, updateCamBtn, updateCallControls, updateMicBtn } from './nav.js'
import { updateLocalTile, addOrUpdateTile, initLocalTile, removeAllTiles, removeTile } from './tile.js';

let co = null;

let localState = {
    audio: false,
    video: false,
}

registerJoinFormListener(initAndJoin);
registerLeaveBtnListener(leave);
registerCamBtnListener(toggleCamera);
registerMicBtnListener(toggleMicrophone);
enumerateDevices();

async function enumerateDevices() {
    await navigator.mediaDevices.getUserMedia({audio: true, video: true});   
    let devices = await navigator.mediaDevices.enumerateDevices();   
    console.log("Devices:");
    console.log(devices); 
}

async function initAndJoin(roomURL, name) {
    initLocalTile();
    co = DailyIframe.createCallObject()
    .on('app-message', handleAppMessage)
    .on("camera-error", handleCameraError)
    .on("joined-meeting", handleJoinedMeeting)
    .on("left-meeting", handleLeftMeeting)
    .on("error", handleError)
    .on("participant-updated", handleParticipantUpdated)
    .on("participant-joined", handleParticipantJoined)
    .on("participant-left", handleParticipantLeft)
    await join(roomURL, name);
}

async function leave() {
    updateCamBtn(false);
    updateMicBtn(false);
    co.leave();
    co = null;
    updateCallControls(co !== null);
}

function toggleCamera() {
    const newState = !localState.video;
    if (!newState) {
        updateLocalTile();
    }
    co.setLocalVideo(newState);
}

function toggleMicrophone() {
    co.setLocalAudio(!localState.audio);
}

async function join(roomURL, name) {
    console.log("Joining " + roomURL);
    try {
        await co.join({url: roomURL, userName: name});
    } catch (e) {
        console.error(e);
    }  
}

function handleAppMessage(event) {
    console.log(event);
}

function handleCameraError(event) {
    console.error(event);
}

function handleError(event) {
    console.error(event);
}

function handleJoinedMeeting(event) {
    updateCallControls(co !== null);
    updateCamBtn(localState.video);
    updateMicBtn(localState.audio);
}

function handleLeftMeeting(event) {
    removeAllTiles();
}

function handleParticipantUpdated(event) {
    const up = event.participant;
    if (up.session_id === co.participants().local.session_id) {
        updateLocal(up);
    } else {
        addOrUpdateTile(up.session_id, up.user_name, up.videoTrack, up.audioTrack);
    }
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
        if (localState.video) {
            let vt = p.videoTrack;
            if (!vt) {
                return;
            }
            updateLocalTile(vt);
        }
    }
}