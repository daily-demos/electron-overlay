// nav.js handles all call controls

import { setupDraggableElement } from "./drag.js";

const toggleCamBtn = document.getElementById("toggleCam");
const toggleMicBtn = document.getElementById("toggleMic");
const nav = document.getElementById("nav");

setupDraggableElement(nav);

export function registerJoinListener(f) {
  window.addEventListener("join-call", (e) => {
    const url = e.detail.url;
    const name = e.detail.name;
    f(url, name).then((joined) => {
      if (joined) {
        api.joinedCall(url);
      }
    });
  });
}

export function registerLeaveBtnListener(f) {
  const leaveBtn = document.getElementById("leave");
  const leave = () => {
    f();
    api.leftCall();
  };
  leaveBtn.addEventListener("click", leave);
  window.addEventListener("leave-call", leave);
}

export function registerCamBtnListener(f) {
  toggleCamBtn.addEventListener("click", f);
}

export function registerMicBtnListener(f) {
  toggleMicBtn.addEventListener("click", f);
}

export function updateCallControls(inCall) {
  const controls = document.getElementById("callControls");
  // If the user has joined a call, remove the call entry form
  // and display the call controls. Otherwise, do the opposite.
  if (inCall) {
    controls.style.display = "inline-block";
    return;
  }
  controls.style.display = "none";
}

export function updateCamBtn(camOn) {
  const txt = (camOn ? "Disable" : "Enable") + " Camera";
  toggleCamBtn.innerText = txt;
}

export function updateMicBtn(micOn) {
  const txt = (micOn ? "Disable" : "Enable") + " Mic";
  toggleMicBtn.innerText = txt;
}
