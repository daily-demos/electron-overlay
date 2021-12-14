// Modules to control application life and create native browser window
const {
  app,
  BrowserWindow,
  ipcMain,
  Tray,
  Menu,
  MenuItem,
  shell,
  globalShortcut,
} = require("electron");

const path = require("path");
const positioner = require("electron-traywindow-positioner");

let callWindow = null;
let trayWindow = null;
let tray = null;

function createTrayWindow() {
  // Create the window that opens on app start
  // and tray click
  trayWindow = new BrowserWindow({
    title: "Daily",
    webPreferences: {
      preload: path.join(__dirname, "preloadTray.js"),
    },
    width: 290,
    height: 300,
    show: false,
    frame: false,
    autoHideMenuBar: true,
    setVisibleOnAllWorkspaces: true,
    transparent: true,
    skipTaskbar: true,
    hasShadow: false,
  });

  trayWindow.loadFile("tray.html");
  trayWindow.on("blur", () => {
    trayWindow.hide();
  });
  trayWindow.on("show", () => {
    positioner.position(trayWindow, tray.getBounds());
    trayWindow.focus();
  });
  trayWindow.webContents.once("dom-ready", () => {
    trayWindow.show();
  });
  trayWindow.webContents.on("new-window", function (e, url) {
    e.preventDefault();
    shell.openExternal(url);
  });
}

function createCallWindow() {
  // Create the browser window.
  callWindow = new BrowserWindow({
    title: "Daily",
    webPreferences: {
      preload: path.join(__dirname, "preloadCall.js"),
    },
    frame: false,
    autoHideMenuBar: true,
    transparent: true,
    skipTaskbar: true,
    hasShadow: false,
    // Don't show the window until the user is in a call.
    show: false,
  });

  preventRefresh(callWindow);

  const dev = app.commandLine.hasSwitch("dev");
  if (!dev) {
    callWindow.setIgnoreMouseEvents(true, { forward: true });
    callWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });

    let level = "normal";
    // Mac OS requires a different level for our drag/drop and overlay
    // functionality to work as expected.
    if (process.platform === "darwin") {
      level = "floating";
    }

    callWindow.setAlwaysOnTop(true, level);
  }

  // and load the index.html of the app.
  callWindow.loadFile("index.html");
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createCallWindow();
  createTrayWindow();
  setupTray();
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", function () {
  if (process.platform !== "darwin") app.quit();
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

// setupTray creates the system tray where our application will live.
function setupTray() {
  if (app.dock) {
    app.dock.hide();
  }

  tray = new Tray(path.join(__dirname, "../assets/tray.png"));
  setupTrayMenu(false);

  tray.setToolTip("Daily");
  tray.setIgnoreDoubleClickEvents(true);
  tray.on("click", function () {
    if (trayWindow.isVisible()) {
      trayWindow.hide();
      return;
    }
    trayWindow.show();
  });
  tray.on("right-click", () => {
    tray.popUpContextMenu(tray.contextMenu);
  });
}

function setupTrayMenu(inCall) {
  const menuItems = [];

  // If the user is in a call, allow them to leave the call
  // via the context menu
  if (inCall) {
    const item = new MenuItem({
      label: "Leave Call",
      type: "normal",
      click() {
        callWindow.webContents.send("leave-call");
      },
    });
    menuItems.push(item);
  }
  const exitItem = new MenuItem({
    label: "Quit",
    type: "normal",
    click() {
      app.quit();
    },
  });
  menuItems.push(exitItem);

  const contextMenu = Menu.buildFromTemplate(menuItems);
  tray.contextMenu = contextMenu;
}

// Redirect any refresh shortcuts, since we don't want the user to
// accidentally drop out of the call.
function preventRefresh(window) {
  window.on("focus", () => {
    globalShortcut.register("CommandOrControl+R", () => {});
    globalShortcut.register("CommandOrControl+Shift+R", () => {});
    globalShortcut.register("F5", () => {});
  });
  window.on("blur", () => {
    globalShortcut.unregisterAll(window);
  });
}

// Our custom API handlers are defined below.

// When a user fills in the call form from the tray window,
// this handler will send the room URL and the user's chosen
// name to the call window.
ipcMain.handle("join-call", (e, url, name) => {
  callWindow.webContents.send("join-call", { url: url, name: name });
});

// When we get a success or failure status from the call
// window when joining a call, this handler will send
// the failure (if any) to the tray window, OR alternatively
// maximize and focus the call window.
ipcMain.handle("call-join-update", (e, joined) => {
  if (!joined) {
    trayWindow.webContents.send("join-failure");
    trayWindow.show();
    return;
  }
  callWindow.maximize();
  setupTrayMenu(true);
  callWindow.show();
  callWindow.focus();
});

// When a user leaves a call, this handler will update
// the tray menu and send the event to the tray window
// (so that the tray window can be updated to show the
// join form once more)
ipcMain.handle("left-call", () => {
  setupTrayMenu(false);
  trayWindow.webContents.send("left-call");
  callWindow.hide();
});

// This handler updates our mouse event settings depending
// on whether the user is hovering over a clickable element
// in the call window.
ipcMain.handle("set-ignore-mouse-events", (e, ...args) => {
  const win = BrowserWindow.fromWebContents(e.sender);
  win.setIgnoreMouseEvents(...args);
});

ipcMain.handle("close-app", () => {
  app.quit();
});
