import { app, BrowserWindow, shell } from "electron";
import { join } from "path";
import { is } from "@electron-toolkit/utils";

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

app.whenReady().then(() => {
  const iconPng = join(app.getAppPath(), "resources/icon.png");
  if (process.platform === "darwin") {
    app.dock.setIcon(iconPng);
  }
  createWindow(iconPng);
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow(iconPng);
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
