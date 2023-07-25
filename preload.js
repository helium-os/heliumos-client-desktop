const { contextBridge, ipcRenderer, BrowserWindow } = require("electron");

contextBridge.exposeInMainWorld("versions", {
  node: () => process.versions.node,
  chrome: () => "12121",
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
  clearInfo:()=> ipcRenderer.send("clearInfo"),
  getValue: (res) => ipcRenderer.invoke("getValue", res),
});
