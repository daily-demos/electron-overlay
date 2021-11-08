const { contextBridge, ipcRenderer } = require("electron");

// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.
window.addEventListener("DOMContentLoaded", () => {
  const replaceText = (selector, text) => {
    const element = document.getElementById(selector);
    if (element) element.innerText = text;
  };

  for (const type of ["chrome", "node", "electron"]) {
    replaceText(`${type}-version`, process.versions[type]);
  }
  refreshDraggableElements();
});

window.addEventListener("DOMNodeInserted", () => {
  refreshDraggableElements();
});

function refreshDraggableElements() {
  const draggableElements = document.getElementsByClassName("clickable");
  for (const ele of draggableElements) {
    if (ele.getAttribute("listeningForMouse") === "true") {
      continue;
    }
    ele.addEventListener("mouseenter", () => {
      ipcRenderer.send("set-ignore-mouse-events", false);
    });
    ele.addEventListener("mouseleave", () => {
      ipcRenderer.send("set-ignore-mouse-events", true, { forward: true });
    });
    ele.setAttribute("listeningForMouse", "true");
  }
}

contextBridge.exposeInMainWorld("api", {
  close: () => {
    console.log("closing");
    ipcRenderer.invoke("close-app");
  },
});
