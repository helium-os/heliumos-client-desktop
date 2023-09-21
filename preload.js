const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("versions", {
  lock: "false",
  name: () => ipcRenderer.invoke("getUserValue", "name"),
  password: () => ipcRenderer.invoke("getUserValue", "password"),
  setuserInfo: (value) => ipcRenderer.send("setuserInfo", value),
  getDNS: () => ipcRenderer.invoke("getUserValue", "DNS"),
  clearInfo: () => ipcRenderer.send("clearInfo"),
  getValue: (res) => ipcRenderer.invoke("getUserValue", res),
  getDbValue: () => ipcRenderer.invoke("getDbValue"),
  getMessage:(name,fun)=> ipcRenderer.on(name, fun),
  sendMethod:(name)=>ipcRenderer.send(name),
  //带返回的回调方法
  invokMethod:(name,value)=>ipcRenderer.invoke(name, value),
  //传递信息
  sendMethod:(name,value)=>ipcRenderer.send(name, value)
});
