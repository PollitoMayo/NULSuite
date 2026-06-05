import * as Sentry from "@sentry/electron/main";
import { app, BrowserWindow, ipcMain, shell } from "electron";
import { join } from "path";
import { is } from "@electron-toolkit/utils";
import { autoUpdater } from "electron-updater";
import * as sentry from "@sentry/electron/main";
import log from "electron-log/main";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
});

let mainWindow: BrowserWindow | null = null;

function checkForUpdates() {
  if (is.dev) {
    log.info("=== [UPDATER] Modo dev — checkForUpdates omitido ===");
    return;
  }

  log.info(`=== [UPDATER] App iniciada v${app.getVersion()}, verificando actualizaciones... ===`);

  autoUpdater.checkForUpdates().catch((err) => {
    log.error("=== [UPDATER] checkForUpdates falló ===", err);
  });
}

function createWindow(icon: string): void {
  mainWindow = new BrowserWindow({
    title: "NUL Admin",
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

  checkForUpdates();
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
  log.initialize();
log.transports.console.level = "debug";
log.transports.file.level = "debug";

log.info("=== [LOG] Ruta del archivo:", log.transports.file.getFile().path, "===");

ipcMain.handle("open-logs", () => {
  const file = log.transports.file.getFile();
  shell.showItemInFolder(file.path);
  return file.path;
});

  autoUpdater.autoDownload = false;
  autoUpdater.logger = log;

  autoUpdater.on("checking-for-update", () => {
    log.info("=== [AUTOUPDATER] Buscando actualizaciones... ===");
  });
  

  autoUpdater.on("update-available", (info) => {
    log.info(`=== [AUTOUPDATER] Nueva versión encontrada: ${info.version} (actual: ${app.getVersion()}) ===`);
    mainWindow?.webContents.send("update-available", info.version);
  });

  autoUpdater.on("update-not-available", (info) => {
    log.info(`=== [AUTOUPDATER] Sin actualizaciones. Última versión: ${info.version} ===`);
  });

  autoUpdater.on("download-progress", (progress) => {
    log.info(`=== [AUTOUPDATER] Descargando: ${Math.round(progress.percent)}% (${Math.round(progress.bytesPerSecond / 1024)} KB/s) ===`);
  });

  autoUpdater.on("update-downloaded", (info) => {
    log.info(`=== [AUTOUPDATER] Descarga completada: ${info.version} — lista para instalar ===`);
    mainWindow?.webContents.send("update-downloaded");
  });

  autoUpdater.on("error", (err) => {
    log.error(`=== [AUTOUPDATER] ERROR: ${err.message} ===`);
    log.error(err);
    sentry.captureException(err);
    sentry.flush();
  });

  ipcMain.handle("get-version",     () => app.getVersion());
  ipcMain.handle("download-update", () => {
    log.info("=== [IPCMAIN] Iniciando descarga manual ===");
    return autoUpdater.downloadUpdate();
  });
  ipcMain.handle("install-update",  () => {
    log.info("=== [IPCMAIN] Instalando y reiniciando ===");
    return autoUpdater.quitAndInstall();
  });

  app.once("browser-window-show", () => {
    if (is.dev) {
      log.info("=== [APP.ONCE] Modo dev — checkForUpdates omitido ===");
      return;
    }
    log.info(`=== [APP.ONCE] App iniciada v${app.getVersion()}, verificando actualizaciones... ===`);
    autoUpdater.checkForUpdates().catch((err) => log.error("[UPDATER] checkForUpdates falló:", err));
  });
}

app.setName("NUL Admin");

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
