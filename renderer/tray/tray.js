const joinForm = document.getElementById("enterCall");

joinForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const urlEle = document.getElementById("roomURL");
  const nameEle = document.getElementById("userName");
  api.joinCall(urlEle.value, nameEle.value);
  setupInCallView(urlEle.value);
});

function setupInCallView(callURL) {
  const entry = document.getElementById("entry");
  const inCall = document.getElementById("inCall");
  entry.style.display = "none";
  inCall.style.display = "block";
  const wrapper = document.getElementById("wrapper");
  wrapper.classList.remove("entry");
  wrapper.classList.add("inCall");

  const copyButton = document.getElementById("clipboard");
  copyButton.onclick = () => {
    navigator.clipboard.writeText(callURL).catch((err) => {
      const msg = "failed to copy room URL to clipboard";
      console.error(msg, err);
      alert(msg);
    });
  };
}

window.addEventListener("join-failure", () => {
  resetTray();
});

window.addEventListener("left-call", () => {
  resetTray();
});

function resetTray() {
  const entry = document.getElementById("entry");
  const inCall = document.getElementById("inCall");
  entry.style.display = "block";
  inCall.style.display = "none";
  const wrapper = document.getElementById("wrapper");
  wrapper.classList.remove("inCall");
  wrapper.classList.add("entry");
}
