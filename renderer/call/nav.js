// nav.js handles all call controls

import { setupDraggableElement } from "./drag.js";

const toggleCamBtn = document.getElementById("toggleCam");
const toggleMicBtn = document.getElementById("toggleMic");
const callControls = document.getElementById("callControls");

setupDraggableElement(callControls);

export function registerJoinListener(f) {
  window.addEventListener("join-call", (e) => {
    const url = e.detail.url;
    const name = e.detail.name;
    f(url, name)
      .then((joined) => {
        api.callJoinUpdate(joined);
        if (joined) {
          updateClipboardBtnClick(url);
        }
      })
      .catch(() => api.callJoinUpdate(false));
  });
}

export function registerLeaveBtnListener(f) {
  const leaveBtn = document.getElementById("leave");
  const leave = () => {
    f();
    api.leftCall();
    updateClipboardBtnClick(null);
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
    controls.classList.remove("controls-off");
    controls.classList.add("controls-on");
    return;
  }
  controls.classList.remove("controls-on");
  controls.classList.add("controls-off");
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
}

function updateClipboardBtnClick(callURL) {
  const clipboardBtn = document.getElementById("clipboard");
  if (!callURL) {
    clipboardBtn.onclick = null;
    return;
  }
  clipboardBtn.onclick = () => {
    navigator.clipboard.writeText(callURL).catch((err) => {
      const msg = "failed to copy room URL to clipboard";
      console.error(msg, err);
      alert(msg);
    });
  };
}
