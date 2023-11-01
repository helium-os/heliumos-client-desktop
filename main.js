const { ipcMain, app, BrowserWindow, dialog, globalShortcut, Menu, shell, session } = require("electron");
const path = require("path");
const storage = require('electron-json-storage');
var crypto = require('crypto')
var fs = require('fs')
const proxy = require('./proxy/proxy');
const util = require('./util/util');
const changeClose = require('./app-init/changeClose');
let { autoUpdater } = require("electron-updater");
var keyList = ["heliumos.crt", '../heliumos.crt']
var publicKey

//F10双击,F8双击
let f10Press = false, f8Press = false;
let lastPressTime = 0;
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
//双击F10,切换环境
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
//双击F8,清除缓存
const F8 = (win) => {
  const options = {
    type: 'question',
    title: '清除缓存',
    message: '是否清除缓存',
    buttons: ['确认', '取消'],
  };
  if (loading) { return }
  dialog.showMessageBox(options).then(async (response) => {
    if (response.response == 0) {
      await session.defaultSession.clearStorageData()
      await storage.clear(() => win.loadFile("./index.html"))
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

  //修改关闭逻辑
  changeClose(win)

  //默认浏览器打开链接
  win.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });
  //自动更新,可以设置循环时间，默认是六小时,执行回调函数可以清除计时器
  let deleteUpdaterInterval = util.AutoUpdaterInterval(autoUpdater)

  ipcMain.on("ping", function (event) {
    event.returnValue = "pong";
  });

  ipcMain.on("iframeUP", function () {
    win.setAlwaysOnTop(true);
  });

  ipcMain.on("iframeDown", function () {
    win.setAlwaysOnTop(false);
  });

  ipcMain.on("setuserInfo", async function (event, arg) {
    let data = await util.getStorageData()

    if (arg?.org != null && arg?.name != null) {
      org = arg?.org
      await util.setStorageData('data', { _last: { env, ...arg, }, [env]: { [arg?.org]: { [arg?.name]: { ...arg, orgId: data?._last?.orgId } } } })

      if (arg?.name && (arg.autoLogin === true || arg.autoLogin === false)) {
        let envList = await util.getStorageData(env)
        await util.setStorageData(env, [...(envList?.logList || []).filter(item => item?.name != arg.name), { name: arg?.name, org: arg?.org }], ['logList'])
      }

      if (arg.autoStart === true || arg.autoStart === false) {
        app.setLoginItemSettings({
          // 设置为true注册开机自起
          openAtLogin: arg?.autoStart,
          openAsHidden: false,
          path: process.execPath,
        });
      }
      return
    }
    if (arg?.org != null && arg?.name === null) {
      org = arg?.org
      await util.setStorageData('data', { _last: { env, ...arg, } })
      let envList = await util.getStorageData(env)
      await util.setStorageData(env, [...(envList?.orgList || []).filter(item => item?.value != arg.org), { value: arg?.org }], ['orgList'])
      return
    }
    await util.setStorageData('data', arg, [env, data?._last?.org, data?._last?.name])

  });

  ipcMain.on('clearInfo', async (event, arg) => {
    if (arg) {
      if (arg == 'second') {
        await util.setStorageData('data', { _last: { org: null, name: null } })
      }
      await win.loadFile("./index.html")
      setTimeout(() => { win.webContents.send('setPage', arg); }, 10)

    } else {
      await util.setStorageData('data', { _last: { org: null, name: null } })
      win.loadFile("./index.html")
    }


  })

  // win.on('close', (event) => {
  //   // 阻止默认的关闭行为
  //   event.preventDefault();

  //   // 最小化窗口
  //   win.minimize();
  // });
  //监听页面跳转失败

  // 监听页面加载失败事件
  // win.webContents.on('did-fail-load', (event) => {
  //   const options = {
  //     type: 'question',
  //     title: '加载失败',
  //     message: '网络连接失败，请重试',
  //     buttons: ['确认', '取消'],
  //   };
  //   dialog.showMessageBox(options).then(async (response) => {
  //     if (response.response == 0) {
  //       await util.setStorageData('data', { _last: { org: null, name: null } })
  //       win.loadFile("./index.html");
  //     }
  //   })
  // });

  //监听页面跳转
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
        if (!f10Press) {
          f10Press = true;
          lastPressTime = now;
        } else {
          // 第二次按下 F10 键，检查时间间隔
          if (now - lastPressTime < doublePressInterval) {
            F10(win)
          }
          f10Press = false; // 重置状态
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
        if (!f10Press) {
          f10Press = true;
          lastPressTime = now;
        } else {
          // 第二次按下 F10 键，检查时间间隔
          if (now - lastPressTime < doublePressInterval) {
            F10(win)
          }
          f10Press = false; // 重置状态
        }
      });

    }
    // 注册全局快捷键 F8
    globalShortcut.register('F8', () => {
      const now = Date.now();
      // 第一次按下 F8 键
      if (!f8Press) {
        f8Press = true;
        lastPressTime = now;
      } else {
        // 第二次按下 F10 键，检查时间间隔
        if (now - lastPressTime < doublePressInterval) {
          F8(win)
        }
        f8Press = false; // 重置状态
      }
    });

  })
  // mac下快捷键失效的问题以及阻止shift+enter打开新页面问题
  util.macShortcutKeyFailure(win)

  let LastUser = datas?.[env]?.[datas?._last?.org]?.[datas?._last?.name]
  if (LastUser?.autoLogin == true && LastUser?.orgId) {
    win.loadURL('https://desktop.system.app.' + LastUser.orgId);
  } else {
    win.loadFile("./index.html");
    session.defaultSession.clearStorageData({
      storages: ['cookies']
    });
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
    if (b && b.issuer && b.issuer.split('OU=')
      && b.issuer.split('OU=')[1]
      && b.issuer.split('OU=')[1].split('\n')
      && a.issuer.split('OU=')[1].split('\n')[0] == b.issuer.split('OU=')[1].split('\n')[0]) {
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
  let { port } = await proxy.runProxy(env)
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
      if (data?._last?.name) {
        return data?.[env]?.[data?._last?.org]?.[data?._last?.name]?.[arg] || "";
      } else {
        return data?._last?.[arg] || "";
      }
    } else {
      return "";
    }

  });
  //获取麦克风权限和摄像头权限
  ipcMain.handle("askForMediaAccess", async function (event, arg) {
    let data = await util.askForMediaAccess(arg)
    return data
  });


  //dns配置
  ipcMain.handle("getLogList", async function () {
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

  ipcMain.handle("getOrgList", async function () {
    let envList = await util.getStorageData(env)
    return  envList.orgList || []
  });

  ipcMain.handle('getDbValue', async function () {
    let res = await proxy.getAlias(env)
    return res
  })

  const emptyMenu = Menu.buildFromTemplate([]);

  Menu.setApplicationMenu(emptyMenu);
  //多开配置
  util.multipleOpen(app, BrowserWindow, createWindow, true)
});



app.on("window-all-closed", async () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

