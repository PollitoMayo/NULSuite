import * as Sentry from "@sentry/electron/main";
import { app, BrowserWindow, ipcMain, shell } from "electron";
import { join } from "path";
import { is } from "@electron-toolkit/utils";
import { autoUpdater } from "electron-updater";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
});

let mainWindow: BrowserWindow | null = null;

function createWindow(icon: string): void {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    show: false,
    autoHideMenuBar: true,
    icon,
    webPreferences: {
      preload: join(__dirname, "../preload/index.js"),
      sandbox: false,
      contextIsolation: true,
    },
  });

  mainWindow.on("ready-to-show", () => {
    mainWindow?.show();
    if (is.dev) mainWindow?.webContents.openDevTools();
  });

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: "deny" };
  });

  if (is.dev && process.env["ELECTRON_RENDERER_URL"]) {
    mainWindow.loadURL(process.env["ELECTRON_RENDERER_URL"]);
  } else {
    mainWindow.loadFile(join(__dirname, "../renderer/index.html"));
  }
}

function setupAutoUpdater() {
  autoUpdater.autoDownload = false;

  autoUpdater.on("update-available", (info) => {
    mainWindow?.webContents.send("update-available", info.version);
  });

  autoUpdater.on("update-downloaded", () => {
    mainWindow?.webContents.send("update-downloaded");
  });

  ipcMain.handle("download-update", () => autoUpdater.downloadUpdate());
  ipcMain.handle("install-update",  () => autoUpdater.quitAndInstall());

  // Check after window is ready to avoid slowing down startup
  app.once("browser-window-show", () => {
    if (!is.dev) autoUpdater.checkForUpdates();
  });
}

app.whenReady().then(() => {
  const iconPng = join(app.getAppPath(), "resources/icon.png");
  if (process.platform === "darwin") {
    app.dock.setIcon(iconPng);
  }
  setupAutoUpdater();
  createWindow(iconPng);
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow(iconPng);
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
