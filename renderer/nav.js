// nav.js handles all call controls

import { setupDraggableElement } from "./drag.js";

const toggleCamBtn = document.getElementById("toggleCam");
const toggleMicBtn = document.getElementById("toggleMic");
const joinForm = document.getElementById("enterCall");
const nav = document.getElementById("nav");

const minimizeBtn = document.getElementById("minimize");
minimizeBtn.addEventListener("click", api.minimize);

document.getElementById("exit").addEventListener("click", api.close);

setupDraggableElement(nav);

export function registerJoinFormListener(f) {
  joinForm.addEventListener("submit", (event) => {
    event.preventDefault();
    joinForm.style.display = "none";
    const urlEle = document.getElementById("roomURL");
    const nameEle = document.getElementById("userName");
    f(urlEle.value, nameEle.value);
  });
}

export function registerLeaveBtnListener(f) {
  const leaveBtn = document.getElementById("leave");
  leaveBtn.addEventListener("click", f);
  window.addEventListener("leave-call", f);
}

export function registerCamBtnListener(f) {
  toggleCamBtn.addEventListener("click", f);
}

export function registerMicBtnListener(f) {
  toggleMicBtn.addEventListener("click", f);
}

export function updateCallControls(joined) {
  const entry = document.getElementById("entry");
  const controls = document.getElementById("callControls");
  // If the user has joined a call, remove the call entry form
  // and display the call controls. Otherwise, do the opposite.
  if (joined) {
    entry.style.display = "none";
    controls.style.display = "inline-block";
  } else {
    entry.style.display = "inline-block";
    controls.style.display = "none";
    joinForm.style.display = "inline-block";
  }
  api.refreshTray(joined);
}

export function updateCamBtn(camOn) {
  const txt = (camOn ? "Disable" : "Enable") + " Camera";
  toggleCamBtn.innerText = txt;
}

export function updateMicBtn(micOn) {
  const txt = (micOn ? "Disable" : "Enable") + " Mic";
  toggleMicBtn.innerText = txt;
}
