"use strict";
const electron = require("electron");
electron.contextBridge.exposeInMainWorld("api", {
  getServerUrl: () => electron.ipcRenderer.invoke("get-server-url")
});
