const joinForm = document.getElementById("enterCall");

joinForm.addEventListener("submit", (event) => {
  event.preventDefault();
  //joinForm.style.display = "none";
  const urlEle = document.getElementById("roomURL");
  const nameEle = document.getElementById("userName");
  api.joinCall(urlEle.value, nameEle.value);
});

window.addEventListener("joined-call", (e) => {
  const entry = document.getElementById("entry");
  const inCall = document.getElementById("inCall");
  entry.style.display = "none";
  inCall.style.display = "block";
});

window.addEventListener("left-call", (e) => {
  const entry = document.getElementById("entry");
  const inCall = document.getElementById("inCall");
  entry.style.display = "block";
  inCall.style.display = "none";
});
