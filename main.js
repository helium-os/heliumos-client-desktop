const { ipcMain, app, BrowserWindow, dialog, globalShortcut } = require("electron");
const path = require("path");
var os = require("os");
const url = require("url");
const fetch = require("electron-fetch").default;
let a = true;
const storage = require("electron-json-storage");
let { autoUpdater } = require("electron-updater");
var crypto  = require('crypto')
var fs      = require('fs')
const forge = require('node-forge');
var keyList=["heliumos.crt",'../heliumos.crt']
var publicKey

// app.commandLine.appendSwitch('disk-cache-size',20000000)
app.commandLine.appendSwitch('no-proxy-server')
// app.commandLine.appendSwitch('disable-http2')

keyList.forEach(item=>{
  if( fs.existsSync(path.join(__dirname, item))){
    publicKey=fs.readFileSync(path.join(__dirname, item), 'utf8')
  }
})
 let datas = {}
createWindow = async () => {
  //  清除store
  //   storage.clear(function(error) {
  //   if (error) throw error;
  // })

  const win = new BrowserWindow({
    width: 800,
    height: 800,
    minWidth: 800,
    minHeight: 800,
    webPreferences: {
      nodeIntegration: true,
      webSecurity: false, //禁用同源策略

      plugins: true, //是否支持插件

      nativeWindowOpen: true, //是否使用原生的window.open()

      webviewTag: true, //是否启用 <webview> tag标签

      sandbox: true, //沙盒选项,这个很重要
      preload: path.join(__dirname, "preload.js"),
      partition: String(+new Date()),
    },
  });

  autoUpdater.autoDownload = true;
 
  autoUpdater.checkForUpdatesAndNotify();


  ipcMain.on("ping", function (event, arg) {
    event.returnValue = "pong";
  });

  ipcMain.on("iframeUP", function (event) {
    win.setAlwaysOnTop(true);
  });

  ipcMain.on("iframeDown", function (event) {
    win.setAlwaysOnTop(false);
  });

  ipcMain.on("setuserInfo", function (event, arg) {
  //   let  secureDnsServers = [
  //  "https://dns-testinner.easypayx.com/dns-query",
  //   "https://heliumos-public.heliumos-dns.info/dns-query"
  // ];

  //   if (arg.DNS) {
  //     secureDnsServers[0] = 'https://' + arg?.DNS + '.heliumos-dns.info/dns-query';
  //       app.configureHostResolver({
  //      enableBuiltInResolver:false,
  //      secureDnsMode: 'secure',
  //      secureDnsServers
  //     })
  //   }
    
    storage.get("data", function (error, data) {
      datas={ ...data, ...arg }
      storage.set("data", { ...data, ...arg });
    });
  });

  ipcMain.on("setDNS", function (event, arg) {
    storage.set("DNS", arg);
  });
  ipcMain.on('clearInfo',()=> win.loadFile("./index.html"))
  //获取本地唯一MAC地址
  var mac = "";
  var networkInterfaces = os.networkInterfaces();
  for (var i in networkInterfaces) {
    for (var j in networkInterfaces[i]) {
      if (
        networkInterfaces[i][j]["family"] === "IPv4" &&
        networkInterfaces[i][j]["mac"] !== "00:00:00:00:00:00" &&
        networkInterfaces[i][j]["address"] !== "127.0.0.1"
      ) {
        mac = networkInterfaces[i][j]["mac"];
      }
    }
  }
    win.on('focus', () => {
    // mac下快捷键失效的问题
    if (process.platform === 'darwin') {
      let contents = win.webContents
      globalShortcut.register('CommandOrControl+C', () => {
        console.log('注册复制快捷键成功')
        contents?.copy()
      })

      globalShortcut.register('CommandOrControl+V', () => {
        console.log('注册粘贴快捷键成功')
        contents?.paste()
      })

      globalShortcut.register('CommandOrControl+X', () => {
        console.log('注册剪切快捷键成功')
        contents?.cut()
      })

      globalShortcut.register('CommandOrControl+A', () => {
        console.log('注册全选快捷键成功')
        contents?.selectAll()
      })
    }
  })
  win.on('blur', () => {
    globalShortcut.unregisterAll() // 注销键盘事件
  })
  // win.loadURL('https://desktop.org1.helium');
  // win.loadURL('http://localhost:5173');
  win.loadFile("./index.html");
  win.maximize(); 
  setInterval(()=> {win.webContents.openDevTools()},[1000]) 
  // win.webContents.openDevTools();
  //监听单页页面跳转（antd-pro这种）
  //   win.webContents.on('did-navigate-in-page', (event,url) => {
  //   console.log(url)
  // });
  //监听页面跳转
  // win.webContents.on('will-navigate', (event,url) => {
  //   console.log(event)
  //   console.log(url)
  // });
};

app.on(
  "certificate-error",
  (event, webContents, url, error, cert, callback) => {
  let a=new  crypto.X509Certificate(publicKey);
   let b=new  crypto.X509Certificate(cert.data);
    callback(true)
  //  if (a.issuer==b.issuer) {
  //   event.preventDefault()
  //   callback(true)
  // } else {
  //   callback(false)
  // }
}
);

app.whenReady().then(async () => {
  let  secureDnsServers = [
  //  "https://dns-testinner.easypayx.com/dns-query",
    "https://heliumos-public.heliumos-dns.info/dns-query",
    "https://org2.heliumos-dns.info/dns-query"
  ];
  // await storage.get("data", function (error, data) {
  //   datas = data;
  //   if (datas?.DNS ) {
  //     secureDnsServers.push('https://' + datas?.DNS + '.heliumos-dns.info/dns-query')
  //   }
    
  // });
  app.configureHostResolver({
       enableBuiltInResolver:false,
       secureDnsMode: 'secure',
       secureDnsServers,
      })
   
  if (!app.requestSingleInstanceLock()) {
    app.quit();
    return;
  }

  //dns配置

  ipcMain.handle("getValue", async function (event, arg) {
    return datas[arg] || "";
  });

  createWindow();
  require("./menu.js");
  app.on("active", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
