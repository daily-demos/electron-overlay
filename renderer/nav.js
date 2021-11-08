
const leaveBtn = document.getElementById("leave");
const toggleCamBtn = document.getElementById("toggleCam")
const toggleMicBtn = document.getElementById("toggleMic")
const joinForm = document.getElementById("enterCall");


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
    leaveBtn.addEventListener("click", f);
}

export function registerCamBtnListener(f) {
    toggleCamBtn.addEventListener("click", f);
}

export function registerMicBtnListener(f) {
    toggleMicBtn.addEventListener("click", f);
}

export function updateCallControls(joined) {
    const entry = document.getElementById("entry")
    const controls = document.getElementById("callControls")
    if (joined) {
        entry.style.display = "none";
        controls.style.display = "inline-block";
    } else {
        entry.style.display = "inline-block";
        controls.style.display = "none";
        joinForm.style.display = "inline-block";
    }
}

export function updateCamBtn(camOn, disabled) {
    let txt = "";
    if (camOn) {
       txt = "Disable";
    } else {
        txt = "Enable";
    }
    txt += " Camera";
    toggleCamBtn.innerText = txt;
    toggleCamBtn.disabled = disabled;
}

export function updateMicBtn(micOn, disabled) {
    let txt = "";
    if (micOn) {
       txt = "Disable";
    } else {
        txt = "Enable";
    }
    txt += " Mic";
    toggleMicBtn.innerText = txt;
    toggleMicBtn.disabled = disabled;
}
