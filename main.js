const { systemPreferences, ipcMain, app, BrowserWindow, dialog, globalShortcut, Menu, shell, Tray } = require("electron");
const path = require("path");
let { autoUpdater } = require("electron-updater");
var crypto = require('crypto')
var fs = require('fs')
const { readFile } = require("node:fs/promises");
const https = require('https');
const proxy = require('./proxy/proxy');
const tools = require('./proxy/tools');
const util = require('./util/util');
const log = require('electron-log');
const os = require('os');
var keyList = ["heliumos.crt", '../heliumos.crt']
var publicKey
//F9双击
let f10Presse = false;
let lastF9PressTime = 0;
const doublePressInterval = 300;
let org = ''
let env = 'demo'

keyList.forEach(item => {
  if (fs.existsSync(path.join(__dirname, item))) {
    publicKey = fs.readFileSync(path.join(__dirname, item), 'utf8')
  }
})
let datas = {}
let loading = false
//双击F10操作
const F10 = (win) => {

  const options = {
    type: 'question',
    title: '选择环境',
    message: '请选择您的环境：',
    buttons: ['开发环境', '测试环境', '生产环境', '取消'],
  };
  if (loading) { return }
  dialog.showMessageBox(options).then(async (response) => {
    const selectedOption = response.response;
    let dbNameList = ['testinner', 'demo', 'prod']
    let dbName = dbNameList[selectedOption]
    if (dbName) {
      loading = true
      win.webContents.send('Loading', loading);
      await proxy.setEnv(dbName)
      loading = false
      win.webContents.send('change-env', dbName);
      win.webContents.send('Loading', loading);
      env = dbName
      if (env != 'prod') {
        globalShortcut.register('F9', () => {
          win.webContents.openDevTools()
        });
      } else {
        globalShortcut.unregister('F9');
      }
      await util.setStorageData('data', { _last: { env: dbName, org: null, name: null } })
    }
  });
}

createWindow = async () => {

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
  })
  // 监听窗口关闭事件
  win.on('close', (event) => {
    // 取消默认关闭行为
    event.preventDefault();
    // 隐藏窗口，而不是退出
    win.hide();
  });
  // 创建系统托盘图标
  tray = new Tray(path.join(__dirname, '/build/icon.png'));

  // 创建托盘菜单
  const contextMenu = Menu.buildFromTemplate([
    { label: '显示应用', click: () => win.show() },
    { label: '退出', click: () => app.exit() }
  ]);

  // 设置托盘图标的上下文菜单
  tray.setContextMenu(contextMenu);

  // 双击托盘图标时显示应用
  tray.on('double-click', () => win.show());
  if (os.platform() === 'darwin') {
    //唤起权限配置
    systemPreferences.askForMediaAccess('microphone');
    systemPreferences.askForMediaAccess('camera');
  }
  //默认浏览器打开链接
  win.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
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
    if (arg?.name && (arg.autoLogin === true || arg.autoLogin === false)) {
      let envList = await util.getStorageData(env)
      await util.setStorageData(env, [...(envList?.logList || []).filter(item => item?.name != arg.name), { name: arg?.name, org: data?._last?.org }].slice(-3), ['logList'])
    }
    if (arg?.org != null && arg?.name != null) {
      org = arg?.org
      await util.setStorageData('data', { _last: { ...arg, env } })
      app.setLoginItemSettings({
        openAtLogin: data?.[env]?.[arg?.org]?.[arg?.name]?.autoStart || false,
        openAsHidden: false,
        path: process.execPath,
      });
      await util.setStorageData('data', arg, [env, arg?.org, arg?.name])
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
    await util.setStorageData('data', arg, [env, data?._last?.org, data?._last?.name])

  });

  ipcMain.on('clearInfo', async () => {
    await util.setStorageData('data', { _last: { org: null, name: null } })
    win.loadFile("./index.html")
  })

  // win.on('close', (event) => {
  //   // 阻止默认的关闭行为
  //   event.preventDefault();

  //   // 最小化窗口
  //   win.minimize();
  // });

  win.webContents.on('did-navigate', (event, url) => {
    if (env != 'prod' || (org === 'heliumos' || org === 'easypay-internal')) {
      globalShortcut.register('F9', () => {
        win.webContents.openDevTools()
      });
    } else {
      globalShortcut.unregister('F9');
    }
    if (url.includes('/index.html')) {
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
            F10(win)
          }
          f10Presse = false; // 重置状态
        }
      });
    } else {
      globalShortcut.unregister('F10');
    }
  })
  win.webContents.on('before-input-event', (event, input) => {
    if (input.type === 'keyDown' && input.key === 'Enter' && input.shift) {
      event.preventDefault(); // 阻止默认行为，即不打开新页面
    }
  });
  win.on('focus', () => {
    if (env != 'prod' || (org === 'heliumos' || org === 'easypay-internal')) {
      globalShortcut.register('F9', () => {
        win.webContents.openDevTools()
      });
    } else {
      globalShortcut.unregister('F9');
    }
    if (win.webContents.getURL().includes('/index.html')) {
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
            F10(win)
          }
          f10Presse = false; // 重置状态
        }
      });
    }
  })
  // mac下快捷键失效的问题以及阻止shift+enter打开新页面问题
  util.macShortcutKeyFailure(win)

  let LastUser = datas?.[env]?.[datas?._last?.org]?.[datas?._last?.name]
  if (LastUser?.autoLogin == true && LastUser?.orgId) {
    win.loadURL('https://desktop.system.app.' + LastUser.orgId);
  } else {
    win.loadFile("./index.html");
  }

  win.on('blur', () => {
    globalShortcut.unregister('F9');
    globalShortcut.unregister('F10');
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
  env = datas?._last?.env || 'prod'
  org = datas?._last?.org
  //配置proxy
  let { port, alias } = await proxy.runProxy(env)
  app.commandLine.appendSwitch('proxy-server', 'http://127.0.0.1:' + port);
  //更新不走端口
  app.commandLine.appendSwitch('proxy-bypass-list', '*github.com')
  //开机自启动
  app.setLoginItemSettings({
    // 设置为true注册开机自起
    openAtLogin: datas?.[env]?.[datas?._last?.org]?.[datas?._last?.name]?.autoStart || false,
    openAsHidden: false,
    path: process.execPath,
  });

  //dns配置
  ipcMain.handle("getUserValue", async function (event, arg) {
    let data = await util.getStorageData()
    if (data?._last) {
      return data?.[env]?.[data?._last?.org]?.[data?._last?.name]?.[arg] || "";
    } else {
      return "";
    }

  });
  //dns配置
  ipcMain.handle("getLogList", async function (event) {
    let envList = await util.getStorageData(env), res = []
    if (envList && envList?.logList && envList?.logList.length > 0) {
      let data = await util.getStorageData()
      envList?.logList.forEach(item => {
        if (item.name && item.org) {
          let userInfo = { ...data?.[env]?.[item.org]?.[item.name] || {} }
          delete userInfo.password
          res.push({ ...userInfo })
        }
      })
      return res
    } else {
      return res
    }
  });

  ipcMain.handle('getDbValue', async function () {
    let res = await proxy.getAlias(env)
    return res
  })

  const emptyMenu = Menu.buildFromTemplate([]);

  Menu.setApplicationMenu(emptyMenu);
  //多开配置
  util.multipleOpen(app, BrowserWindow, createWindow, false)
});

app.on("window-all-closed", async () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});


