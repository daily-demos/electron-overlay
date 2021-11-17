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
let mainWindow = null;
let tray = null;

function createWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    fullscreen: true,
    simpleFullscreen: true,
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
    mainWindow.setIgnoreMouseEvents(true, { forward: true });
    mainWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
    let level = "screen";

    // Mac OS requires a different level for our drag/drop and overlay
    // functionality to work as expected.
    if (process.platform === "darwin") {
      level = "floating";
    }
    mainWindow.setAlwaysOnTop(true, level);
    ipcMain.on("set-ignore-mouse-events", (event, ...args) => {
      const win = BrowserWindow.fromWebContents(event.sender);
      win.setIgnoreMouseEvents(...args);
    });
  }

  // and load the index.html of the app.
  mainWindow.loadFile("index.html");

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow();
  setupTray();

  app.on("activate", function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
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

  tray = new Tray(path.join(__dirname, "/icon.png"));
  tray.setToolTip("Daily");
  setupTrayMenu(false);
}

function setupTrayMenu(inCall) {
  const menuItems = [];

  // If the user is not in a call and the window is minimized,
  // show "Join Call" button to display the join form.
  if (!inCall && !mainWindow.isVisible()) {
    const item = new MenuItem({
      label: "Join Call",
      type: "normal",
      click() {
        mainWindow.show();
      },
    });
    menuItems.push(item);
  } else if (inCall) {
    // If the user is in a call, allow them to leave the call
    // via the context menu
    const item = new MenuItem({
      label: "Leave Call",
      type: "normal",
      click() {
        mainWindow.webContents.send("leave-call");
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
  tray.setContextMenu(contextMenu);
}

// Our custom API handlers are defined below.
ipcMain.handle("refresh-tray", (e, inCall) => {
  setupTrayMenu(inCall);
});

ipcMain.handle("minimize", () => {
  mainWindow.hide();
  setupTrayMenu();
});

ipcMain.handle("close-app", () => {
  app.quit();
});
