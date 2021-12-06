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
  if (camOn && !toggleCamBtn.classList.contains("cam-on")) {
    toggleCamBtn.classList.remove("cam-off");
    toggleCamBtn.classList.add("cam-on");
  }
  if (!camOn && !toggleCamBtn.classList.contains("cam-off")) {
    toggleCamBtn.classList.remove("cam-on");
    toggleCamBtn.classList.add("cam-off");
  }
}

export function updateMicBtn(micOn) {
  if (micOn && !toggleMicBtn.classList.contains("mic-on")) {
    toggleMicBtn.classList.remove("mic-off");
    toggleMicBtn.classList.add("mic-on");
  }
  if (!micOn && !toggleMicBtn.classList.contains("mic-off")) {
    toggleMicBtn.classList.remove("mic-on");
    toggleMicBtn.classList.add("mic-off");
  }
  //const txt = (micOn ? "Disable" : "Enable") + " Mic";
  //toggleMicBtn.innerText = txt;
}
