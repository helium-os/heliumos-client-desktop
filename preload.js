const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("versions", {
  lock: "false",
  orgId: "matrix-testinner",
  electron: () => process.versions.electron,
  ping: (data) => ipcRenderer.send("ping", data),
  iframeUP: () => ipcRenderer.send("iframeUP"),
  iframeDown: () => ipcRenderer.send("iframeDown"),
  name: () => ipcRenderer.invoke("getValue", "name"),
  password: () => ipcRenderer.invoke("getValue", "password"),
  setuserInfo: (value) => ipcRenderer.send("setuserInfo", value),
  getDNS: () => ipcRenderer.invoke("getValue", "DNS"),
  clearInfo: () => ipcRenderer.send("clearInfo"),
  getValue: (res) => ipcRenderer.invoke("getValue", res),
  getDbValue: () => ipcRenderer.invoke("getDbValue"),
});
