// Modules to control application life and create native browser window
const {
  app,
  BrowserWindow,
  ipcMain,
  Tray,
  Menu,
  MenuItem,
} = require("electron");
const path = require("path");

let callWindow = null;
let trayWindow = null;
let tray = null;

function createTrayWindow() {
  // Create the window that opens on app start
  // and tray click
  trayWindow = new BrowserWindow({
    webPreferences: {
      preload: path.join(__dirname, "preloadTray.js"),
    },
    width: 290,
    height: 300,
    show: true,
    frame: false,
    autoHideMenuBar: true,
    transparent: true,
    skipTaskbar: true,
  });
  trayWindow.loadFile("tray.html");
  trayWindow.on("blur", () => {
    trayWindow.hide();
  });
  trayWindow.on("show", () => {
    trayWindow.focus();
  });
}

function createCallWindow() {
  // Create the browser window.dsfdsfs
  callWindow = new BrowserWindow({
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
    frame: false,
    autoHideMenuBar: true,
    transparent: true,
    skipTaskbar: true,
  });

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
    callWindow.hide();
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
  tray.setToolTip("Daily");
  setupTrayMenu(false);

  tray.setIgnoreDoubleClickEvents(true);
  tray.on("click", function (e) {
    console.log("clicked tray");
    if (trayWindow.isVisible()) {
      trayWindow.hide();
    } else {
      trayWindow.show();
    }
  });
  tray.on("right-click", () => {
    console.log("right click");
    tray.popUpContextMenu(tray.contextMenu);
  });
}

function setupTrayMenu(inCall) {
  const menuItems = [];

  // If the user is not in a call and the window is minimized,
  // show "Join Call" button to display the join form.
  if (inCall) {
    // If the user is in a call, allow them to leave the call
    // via the context menu
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
    label: "Exit",
    type: "normal",
    click() {
      app.quit();
    },
  });
  menuItems.push(exitItem);

  const contextMenu = Menu.buildFromTemplate(menuItems);
  tray.contextMenu = contextMenu;
  // tray.setContextMenu(contextMenu);
}

// Our custom API handlers are defined below.
ipcMain.handle("join-call", (e, url, name) => {
  callWindow.webContents.send("join-call", { url: url, name: name });
});

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

ipcMain.handle("left-call", (e) => {
  setupTrayMenu(false);
  trayWindow.webContents.send("left-call");
  callWindow.hide();
});

ipcMain.handle("minimize", (e) => {
  const win = BrowserWindow.fromWebContents(e.sender);
  win.hide();
  setupTrayMenu();
});

ipcMain.handle("close-app", () => {
  app.quit();
});

ipcMain.handle("set-ignore-mouse-events", (e, ...args) => {
  const win = BrowserWindow.fromWebContents(e.sender);
  win.setIgnoreMouseEvents(...args);
});
