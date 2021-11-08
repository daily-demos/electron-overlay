const localTrackTag = document.getElementById("localTrack");
const localTile = document.getElementById("localTile");
const tiles = document.getElementById("tiles");
const wrapper = document.getElementById("wrapper");
const localParticipant = document.getElementById("localParticipant");
const nav = document.getElementById("nav");

wrapper.addEventListener("drop", drop);
wrapper.addEventListener("dragover", allowDrop);
localParticipant.addEventListener("dragstart", drag);
nav.addEventListener("dragstart", drag);

export function initLocalTile() {
  localParticipant.style.display = "inline-block";
  const gradient = generateLinearGradient();
  const img = `linear-gradient(45deg, #${gradient.c1}, #${gradient.c2})`;
  localTile.style.backgroundImage = img;
}

export function updateLocalTile(videoTrack) {
  if (videoTrack) {
    let stream = new MediaStream([videoTrack]);
    localTrackTag.srcObject = stream;
    return;
  }
  localTrackTag.srcObject = null;
}

function streamToTile(trackTag, videoTrack, audioTrack) {
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

export function addOrUpdateTile(id, userName, videoTrack, audioTrack) {
  const videoTagID = getVideoID(id);
  const participantID = getParticipantID(id);
  let video = null;
  let participant = document.getElementById(participantID);
  if (participant) {
    // Make sure name is up to date.
    const name = participant.getElementsByClassName("name")[0];
    if (name.innerText != userName) {
      name.innerText = userName;
    }
    video = document.getElementById(videoTagID);
  } else {
    video = addTile(id, userName);
  }

  streamToTile(video, videoTrack, audioTrack);
}

function addTile(id, userName) {
  const videoTagID = getVideoID(id);

  const participant = document.createElement("div");
  participant.draggable = true;

  participant.id = getParticipantID(id);
  participant.classList.add("clickable", "participant", "remote-participant");
  const tile = document.createElement("div");
  tile.id = `tile-${id}`;
  tile.classList.add("clickable", "tile");
  const gradient = generateLinearGradient();
  const img = `linear-gradient(45deg, #${gradient.c1}, #${gradient.c2})`;
  tile.style.backgroundImage = img;

  const name = document.createElement("div");
  let n = userName;
  if (!n) {
    n = id;
  }
  name.innerText = n;
  name.classList.add("name");

  participant.appendChild(name);
  participant.appendChild(tile);

  const video = document.createElement("video");
  video.id = videoTagID;
  video.classList.add("clickable", "fit");
  video.playsinline = true;
  video.autoplay = true;
  tile.appendChild(video);
  tiles.appendChild(participant);
  participant.addEventListener("dragstart", drag);
  return video;
}

export function removeTile(id) {
  document.getElementById(getVideoID(id)).remove();
}

export function removeAllTiles() {
  localParticipant.style.display = "none";
  const eles = document.getElementsByClassName("remote-participant");
  while (eles.length > 0) {
    const ele = eles[0];
    ele.remove();
  }
}

function generateLinearGradient() {
  return {
    c1: Math.floor(Math.random() * 16777215).toString(16),
    c2: Math.floor(Math.random() * 16777215).toString(16),
  };
}

function drop(ev) {
  ev.preventDefault();
  const data = ev.dataTransfer.getData("text");
  const relativeMouseX = ev.dataTransfer.getData("relativeMouseX");
  const relativeMouseY = ev.dataTransfer.getData("relativeMouseY");

  const ele = document.getElementById(data);

  // Offset the new position based on the relative position of the mouse
  // which we saved on drag start.
  let newTop = ev.clientY - relativeMouseY;
  let newLeft = ev.clientX - relativeMouseX;
  ele.style.top = `${newTop}px`;
  ele.style.left = `${newLeft}px`;
  ele.style.position = "absolute";
}

function allowDrop(ev) {
  ev.preventDefault();
}

function drag(ev) {
  const target = ev.target;
  ev.dataTransfer.setData("text", target.id);

  // Save the relative position of the mouse in relation to the element, to make sure
  // we drop it with the right offset at the end.
  const rect = target.getBoundingClientRect();
  ev.dataTransfer.setData("relativeMouseX", ev.clientX - rect.left);
  ev.dataTransfer.setData("relativeMouseY", ev.clientY - rect.top);
}

function getVideoID(id) {
  return `video-${id}`;
}

function getParticipantID(id) {
  return `participant-${id}`;
}
