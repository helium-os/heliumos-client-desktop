const { ipcMain, app, BrowserWindow, dialog, globalShortcut, Menu } = require("electron");
const path = require("path");
let { autoUpdater } = require("electron-updater");
var crypto = require('crypto')
var fs = require('fs')
const proxy = require('./proxy/proxy');
const tools = require('./proxy/tools');
const util = require('./util/util');
var keyList = ["heliumos.crt", '../heliumos.crt']
var publicKey
//F9双击
let f10Presse = false;
let lastF9PressTime = 0;
const doublePressInterval = 300;
let env = 'demo'
keyList.forEach(item => {
  if (fs.existsSync(path.join(__dirname, item))) {
    publicKey = fs.readFileSync(path.join(__dirname, item), 'utf8')
  }
})
let datas = {}

//双击F10操作
const F10 = () => {
  const options = {
    type: 'question',
    title: '选择环境',
    message: '请选择您的环境：',
    buttons: ['开发环境', '测试环境', '生产环境', '取消'],
  };

  dialog.showMessageBox(options).then(async (response) => {
    const selectedOption = response.response;
    let dbNameList = ['testinner', 'demo', 'prod']
    let dbName = dbNameList[selectedOption]
    if (dbName) {
      await proxy.setEnv(dbName)
      env = dbName
      await util.setStorageData('data', { _last: { env: dbName } })
    }
  });
}

createWindow = async (data) => {
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
      // partition:String(new Date())
    },
  });
  //自动更新
  util.AutoUpdater(autoUpdater)

  ipcMain.on("ping", function (event, arg) {
    event.returnValue = "pong";
  });

  ipcMain.on("iframeUP", function (event) {
    win.setAlwaysOnTop(true);
  });

  ipcMain.on("iframeDown", function (event) {
    win.setAlwaysOnTop(false);
  });

  ipcMain.on("setuserInfo", async function (event, arg) {
    let data = await util.getStorageData()
    if (arg?.DNS != null && arg?.name != null) {
      await util.setStorageData('data', { _last: { ...arg, env } })
      app.setLoginItemSettings({
        openAtLogin: data?.[env]?.[arg?.DNS]?.[arg?.name]?.autoStart || false,
        openAsHidden: false,
        path: process.execPath,
      });
      await util.setStorageData('data', arg, [env, arg?.DNS, arg?.name])
      return
    }
    if (arg.autoStart === true || arg.autoStart === false) {
      app.setLoginItemSettings({
        // 设置为true注册开机自起
        openAtLogin: arg?.autoStart,
        openAsHidden: false,
        path: process.execPath,
      });
    }
    await util.setStorageData('data', arg, [env, data?._last?.DNS, data?._last?.name])

  });

  ipcMain.on('clearInfo', async () => {
    await util.setStorageData('data', { _last: { DNS: null, name: null } })
    win.loadFile("./index.html")
  })

  win.webContents.on('did-navigate', (event, url) => {
    if (url.includes('/index.html')) {
      globalShortcut.register('F9', () => {
        win.webContents.openDevTools()
      });
      // 注册全局快捷键 F10
      globalShortcut.register('F10', () => {
        const now = Date.now();
        // 第一次按下 F10 键
        if (!f10Presse) {
          f10Presse = true;
          lastF9PressTime = now;
        } else {
          // 第二次按下 F10 键，检查时间间隔
          if (now - lastF9PressTime < doublePressInterval) {
            F10()
          }
          f10Presse = false; // 重置状态
        }
      });
    } else {
      globalShortcut.unregister('F9');
      globalShortcut.unregister('F10');
    }
  })

  win.on('focus', () => {
    if (win.webContents.getURL().includes('/index.html')) {
      globalShortcut.register('F9', () => {
        win.webContents.openDevTools()
      });
      // 注册全局快捷键 F10
      globalShortcut.register('F10', () => {
        const now = Date.now();
        // 第一次按下 F10 键
        if (!f10Presse) {
          f10Presse = true;
          lastF9PressTime = now;
        } else {
          // 第二次按下 F10 键，检查时间间隔
          if (now - lastF9PressTime < doublePressInterval) {
            F10()
          }
          f10Presse = false; // 重置状态
        }
      });
    }
    // mac下快捷键失效的问题
    util.macShortcutKeyFailure(win, globalShortcut)
  })

  win.loadFile("./index.html");
  win.on('blur', () => {
    globalShortcut.unregisterAll() // 注销键盘事件
  })
  win.maximize();
};

app.on(
  "certificate-error",
  (event, webContents, url, error, cert, callback) => {
    let a = new crypto.X509Certificate(publicKey);
    let b = new crypto.X509Certificate(cert.data);
    if (a.issuer.split('OU=')[1].split('\n')[0] == b.issuer.split('OU=')[1].split('\n')[0]) {
      event.preventDefault()
      callback(true)
    } else {
      callback(false)
    }
  }
);

app.whenReady().then(async () => {
  datas = await util.getStorageData()
  env = datas?._last?.env || 'demo'
  //配置proxy
  let port = await proxy.runProxy(env)
  app.commandLine.appendSwitch('proxy-server', 'http://127.0.0.1:' + port);
  //开机自启动
  app.setLoginItemSettings({
    // 设置为true注册开机自起
    openAtLogin: datas?.[env]?.[datas?._last?.DNS]?.[datas?._last?.name]?.autoStart || false,
    openAsHidden: false,
    path: process.execPath,
  });

  //dns配置
  ipcMain.handle("getValue", async function (event, arg) {
    let data = await util.getStorageData()
    if (data?._last) {
      return data?.[env]?.[data?._last?.DNS]?.[data?._last?.name]?.[arg] || "";
    } else {
      return "";
    }

  });
  ipcMain.handle('getDbValue', async function () {
    let res = await tools.getDbValue(env)
    return res
  })
  const emptyMenu = Menu.buildFromTemplate([]);
  Menu.setApplicationMenu(emptyMenu);
  //多开配置
  util.multipleOpen(app, BrowserWindow, createWindow, false)
});
app.on("window-all-closed", async () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

