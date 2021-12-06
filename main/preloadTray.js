const { contextBridge, ipcRenderer } = require("electron");

// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.
window.addEventListener("DOMContentLoaded", () => {});

// This listener will allow us to leave the call from the context menu
// The main process will send a "leave-call" event when the user clicks
// that button in the menu, and the preload will then dispatch a matching
// event to the DOM.
ipcRenderer.on("joined-call", (e, arg) => {
  const event = new CustomEvent("joined-call", {
    detail: {
      url: arg.url,
    },
  });
  window.dispatchEvent(event);
});

ipcRenderer.on("left-call", () => {
  window.dispatchEvent(new Event("left-call"));
});

// Expose the close function to the main world.
contextBridge.exposeInMainWorld("api", {
  joinCall: (url, name) => {
    ipcRenderer.invoke("join-call", url, name);
  },
});
