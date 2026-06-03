import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("api", {
  getServerUrl: () => ipcRenderer.invoke("get-server-url"),
});

declare global {
  interface Window {
    api: {
      getServerUrl: () => Promise<string>;
    };
  }
}
