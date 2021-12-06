// tile.js handles all participant tiles.

import { setupDraggableElement } from "./drag.js";

// addOrUpdateTile adds a tile for a participant, or updates a tile
// if it already exists.
export function addOrUpdateTile(id, userName, videoTrack, audioTrack) {
  const videoTagID = getVideoID(id);
  let videoTag = null;

  const audioTagID = getAudioID(id);
  let audioTag = null;

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
    audioTag = document.getElementById(audioTagID);
  } else {
    // If the participant does not already exist, create their tile.
    const tags = addTile(id, userName);
    videoTag = tags.video;
    audioTag = tags.audio;
  }

  // Stream the given tracks to the participant's video
  // and audio tags
  streamVideo(videoTag, videoTrack);
  streamAudio(audioTag, audioTrack);
}

export function updateActiveSpeaker(activeSpeakerID) {
  // Get current active speaker tiles. There should always
  // be a max of one, but go through all and remove their
  // speaker class just in case
  const speakerClassName = "speaker";
  const speakers = document.getElementsByClassName(speakerClassName);
  for (let s of speakers) {
    s.classList.remove(speakerClassName);
  }

  const tileID = getTileID(activeSpeakerID);
  const tile = document.getElementById(tileID);
  console.log("gotTile", tileID, tile);
  tile?.classList.add(speakerClassName);
}

// addTile adds a participant tile for the given ID and username.
function addTile(id, userName) {
  // Create participant element
  const participant = document.createElement("div");
  participant.draggable = true;

  participant.id = getParticipantID(id);
  participant.classList.add("clickable", "participant");

  // Create tile which will contain the video
  const tile = document.createElement("div");
  tile.id = getTileID(id);
  tile.classList.add("clickable", "tile");

  tile.style.backgroundImage = "linear-gradient(45deg, #121A24, #2B3F56)";

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
  video.playsInline = true;
  video.autoplay = true;
  tile.appendChild(video);

  const audio = document.createElement("audio");
  audio.id = getAudioID(id);
  audio.autoplay = true;
  tile.appendChild(audio);

  const tiles = document.getElementById("tiles");
  tiles.appendChild(participant);
  setupDraggableElement(participant);
  return { video: video, audio: audio };
}

function streamVideo(tag, track) {
  if (track === null) {
    tag.srcObject = null;
    return;
  }
  if (track.id === getVideoTrackID(tag)) {
    return;
  }
  let stream = new MediaStream([track]);
  tag.srcObject = stream;
}

function streamAudio(tag, track) {
  if (track === null) {
    tag.srcObject = null;
    return;
  }
  if (track.id === getAudioTrackID(tag)) {
    return;
  }
  let stream = new MediaStream([track]);
  tag.srcObject = stream;
}

function getVideoTrackID(tag) {
  const tracks = tag?.srcObject?.getVideoTracks();
  if (!tracks || tracks.length === 0) return -1;
  return tracks[0].id;
}

function getAudioTrackID(tag) {
  const tracks = tag?.srcObject?.getAudioTracks();
  if (!tracks || tracks.length === 0) return -1;
  return tracks[0].id;
}

export function removeTile(id) {
  document.getElementById(getParticipantID(id))?.remove();
}

export function removeAllTiles() {
  const eles = document.getElementsByClassName("participant");
  while (eles.length > 0) {
    const ele = eles[0];
    ele.remove();
  }
}

function getVideoID(id) {
  return `video-${id}`;
}

function getAudioID(id) {
  return `audio-${id}`;
}

function getParticipantID(id) {
  return `participant-${id}`;
}

function getTileID(id) {
  return `tile-${id}`;
}
