import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("api", {
  getVersion: () => ipcRenderer.invoke("get-version"),
  onUpdateAvailable: (cb: (version: string) => void) =>
    ipcRenderer.on("update-available", (_e, version) => cb(version)),
  onUpdateDownloaded: (cb: () => void) =>
    ipcRenderer.on("update-downloaded", () => cb()),
  downloadUpdate: () => ipcRenderer.invoke("download-update"),
  installUpdate:  () => ipcRenderer.invoke("install-update"),
});

declare global {
  interface Window {
    api: {
      getVersion: () => Promise<string>;
      onUpdateAvailable: (cb: (version: string) => void) => void;
      onUpdateDownloaded: (cb: () => void) => void;
      downloadUpdate: () => Promise<void>;
      installUpdate:  () => Promise<void>;
    };
  }
}
