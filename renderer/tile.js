// tile.js handles all participant tiles.

import { setupDraggableElement } from "./drag.js";

const localParticipant = document.getElementById("localParticipant");

// Make localParticipant draggable.
setupDraggableElement(localParticipant);

// initLocalTile generates a gradient background for the local participant
// tile, to be displayed when their camera is off.
export function initLocalTile() {
  const localTile = document.getElementById("localTile");
  localParticipant.style.display = "inline-block";
  localTile.style.backgroundImage = generateLinearGradient();
}

// updateLocalTile sets the given videoTrack as the video source for the
// local participant.
export function updateLocalTile(videoTrack) {
  const localTrackTag = document.getElementById("localTrack");
  if (videoTrack) {
    let stream = new MediaStream([videoTrack]);
    localTrackTag.srcObject = stream;
    return;
  }
  localTrackTag.srcObject = null;
}

// addOrUpdateTile adds a tile for a participant, or updates a tile
// if it already exists.
export function addOrUpdateTile(id, userName, videoTrack, audioTrack) {
  const videoTagID = getVideoID(id);
  let videoTag = null;

  const participantID = getParticipantID(id);
  let participant = document.getElementById(participantID);

  // If the participant already exists, make sure the displayed name
  // is up to date and get their video tag.
  if (participant) {
    const name = participant.getElementsByClassName("name")[0];
    if (name.innerText != userName) {
      name.innerText = userName;
    }
    videoTag = document.getElementById(videoTagID);
  } else {
    // If the participant does not already exist, create their tile.
    videoTag = addTile(id, userName);
  }

  // Stream the given tracks to the participant's video tile
  streamToTile(videoTag, videoTrack, audioTrack);
}

// addTile adds a participant tile for the given ID and username.
function addTile(id, userName) {
  // Create participant element
  const participant = document.createElement("div");
  participant.draggable = true;

  participant.id = getParticipantID(id);
  participant.classList.add("clickable", "participant", "remote-participant");

  // Create tile which will contain the video
  const tile = document.createElement("div");
  tile.id = `tile-${id}`;
  tile.classList.add("clickable", "tile");

  tile.style.backgroundImage = generateLinearGradient();

  // Create name element
  const name = document.createElement("div");
  let n = userName ? userName : id;
  name.innerText = n;
  name.classList.add("name");

  participant.appendChild(name);
  participant.appendChild(tile);

  // Create video element
  const video = document.createElement("video");
  video.id = getVideoID(id);
  video.classList.add("clickable", "fit");
  video.playsinline = true;
  video.autoplay = true;
  tile.appendChild(video);

  const tiles = document.getElementById("tiles");
  tiles.appendChild(participant);
  setupDraggableElement(participant);
  return video;
}

function streamToTile(trackTag, videoTrack, audioTrack) {
  // Stop streaming anything if tracks are null
  if (videoTrack == null && audioTrack == null) {
    trackTag.srcObject = null;
    return;
  }
  let tracks = [];
  if (videoTrack) {
    tracks.push(videoTrack);
  }
  if (audioTrack) {
    tracks.push(audioTrack);
  }

  let stream = new MediaStream(tracks);
  trackTag.srcObject = stream;
}

export function removeTile(id) {
  document.getElementById(getParticipantID(id))?.remove();
}

export function removeAllTiles() {
  localParticipant.style.display = "none";
  const eles = document.getElementsByClassName("remote-participant");
  while (eles.length > 0) {
    const ele = eles[0];
    ele.remove();
  }
}

function getVideoID(id) {
  return `video-${id}`;
}

function getParticipantID(id) {
  return `participant-${id}`;
}

function generateLinearGradient() {
  const c1 = Math.floor(Math.random() * 16777215)
    .toString(16)
    .padStart(6, "0");
  const c2 = Math.floor(Math.random() * 16777215)
    .toString(16)
    .padStart(6, "0");
  return `linear-gradient(45deg, #${c1}, #${c2})`;
}
