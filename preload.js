const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("versions", {
  lock: "false",
  orgId: "matrix-testinner",
  electron: () => process.versions.electron,
  ping: (data) => ipcRenderer.send("ping", data),
  iframeUP: () => ipcRenderer.send("iframeUP"),
  iframeDown: () => ipcRenderer.send("iframeDown"),
  name: () => ipcRenderer.invoke("getUserValue", "name"),
  password: () => ipcRenderer.invoke("getUserValue", "password"),
  setuserInfo: (value) => ipcRenderer.send("setuserInfo", value),
  getDNS: () => ipcRenderer.invoke("getUserValue", "DNS"),
  clearInfo: () => ipcRenderer.send("clearInfo"),
  getValue: (res) => ipcRenderer.invoke("getUserValue", res),
  getDbValue: () => ipcRenderer.invoke("getDbValue"),
  getMessage:(name,fun)=> ipcRenderer.on(name, fun),
  sendMethod:(name)=>ipcRenderer.send(name),
  invokMethod:(name,value)=>ipcRenderer.invoke(name, value)
});
