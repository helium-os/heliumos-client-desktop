const { ipcMain, app, BrowserWindow, dialog, globalShortcut } = require("electron");
const path = require("path");
var os = require("os");
const url = require("url");
const fetch = require("electron-fetch").default;
let a = true;
const storage = require("electron-json-storage");
let { autoUpdater } = require("electron-updater");
var crypto = require('crypto')
var fs = require('fs')
const forge = require('node-forge');
const { node_http } = require('./http.js')
const sqlite3 = require('sqlite3').verbose();
var keyList = ["heliumos.crt", '../heliumos.crt']
var publicKey
app.commandLine.appendSwitch('no-proxy-server')
//F9双击
let f10Presse = false;
let lastF9PressTime = 0;
const doublePressInterval = 300;
let db

const proxy = require('./proxy/proxy');
const tools = require('./proxy/tools');
const config = require('./proxy/config');

keyList.forEach(item => {
  if (fs.existsSync(path.join(__dirname, item))) {
    publicKey = fs.readFileSync(path.join(__dirname, item), 'utf8')
  }
})
let datas = {}

//修改数据库链接

const changeDb=async(name)=>{
  const dbPath = path.join(app.getPath('userData'), name);
  // 创建数据库连接
  db = await new sqlite3.Database(dbPath, (err) => {
    if (err) {
      console.error('Error connecting to the database:', err.message);
    } else {
      console.log('Connected to the database.');
      // 在这里可以执行数据库操作
    }
  });
}


//双击F10操作

const F10=()=>{
  const options = {
    type: 'question',
    title: '选择环境',
    message: '请选择您的环境：',
    buttons: ['开发环境', '测试环境', '生产环境', '取消'],
  };

  dialog.showMessageBox(options).then(async(response) => {
    const selectedOption = response.response;
    let dbNameList=['testinner','demo','prod']
    let dbName=dbNameList[selectedOption]
    if(dbName){
      console.log(dbName)
      await changeDb(dbName)


      //proxy
      await proxy.setEnv(dbName)
      await proxy.updateAliasDb(dbName)
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
    },
  });


  //要想使用自动更新，不能配置DNS解析
  autoUpdater.setFeedURL({
    provider: 'github',
    owner: 'helium-os',
    repo: 'heliumos-client-desktop',
    "releaseType": "release"
  });
  autoUpdater.checkForUpdates();
  // 处理检查更新事件
  autoUpdater.on('checking-for-update', () => {
    console.log('Checking for update...');
  });

  // 处理发现更新事件
  autoUpdater.on('update-available', (info) => {
    console.log('Update available:', info);
  });

  // 处理没有更新的事件
  autoUpdater.on('update-not-available', () => {
    console.log('No update available.');
  });

  // 处理更新下载进度事件
  autoUpdater.on('download-progress', (progressObj) => {
    console.log('Download progress:', progressObj);
  });

  // 处理更新下载完成事件
  autoUpdater.on('update-downloaded', (info) => {
    dialog.showMessageBox({
      type: 'info',
      title: '应用更新',
      message: '发现新版本，是否更新？',
      buttons: ['是', '否']
    }).then((buttonIndex) => {
      if (buttonIndex.response == 0) {  //选择是，则退出程序，安装新版本
        autoUpdater.quitAndInstall()
        app.quit()
      }
    })

  });

  // 处理更新错误事件
  autoUpdater.on('error', (err) => {
    console.error('Error while checking for updates:', err);
  });



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
    let secureDnsServers = [];

    // if (arg.dnsValue) {
    //   secureDnsServers[0] = 'https://' + arg?.dnsValue + '.heliumos-dns.info/dns-query';
    //   app.configureHostResolver({
    //    enableBuiltInResolver:false,
    //    secureDnsMode: 'secure',
    //    secureDnsServers
    //   })
    // }

    if (arg.autoStart === true || arg.autoStart === false) {
      app.setLoginItemSettings({
        // 设置为true注册开机自起
        openAtLogin: arg?.autoStart,
        openAsHidden: false,
        path: process.execPath,
      });
    }
    storage.get("data", function (error, data) {
      datas = { ...data, ...arg }
      storage.set("data", { ...data, ...arg });
    });
  });

  ipcMain.on("setDNS", function (event, arg) {
    storage.set("DNS", arg);
  });
  ipcMain.on('clearInfo', () => win.loadFile("./index.html"))

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



  win.webContents.on('did-navigate', (event, url) => {
    if (url.includes('/index.html')) {
      globalShortcut.register('F11', () => {
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
            console.log('Double press F10');
           F10()
          }
          f10Presse = false; // 重置状态
        }
      });


    } else {
      globalShortcut.unregister('F11');
      globalShortcut.unregister('F10');
    }
  })
  // Handle the case when the app is quitting


  win.on('focus', () => {


    if (win.webContents.getURL().includes('/index.html')) {
      globalShortcut.register('F11', () => {
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
            console.log('Double press F10');
           F10()
          }
          f10Presse = false; // 重置状态
        }
      });
    }
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
  // win.loadFile("./loading.html");
  win.loadFile("./index.html");
  win.on('blur', () => {
    globalShortcut.unregisterAll() // 注销键盘事件
  })
  // win.loadURL('https://desktop.org1.helium');
  // storage.get("data", function (error, data) {
  //   if (data?.DNS && data?.password) {
  //     win.loadURL('http://desktop.' + data?.DNS);
  //   } else {
  //     win.loadFile("./index.html");
  //   }
  // });

  win.maximize();
  // setInterval(() => { win.webContents.openDevTools() }, [1000]
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

  let port = await proxy.runProxy()
  console.log("port=" + port)
  const dbPath = path.join(app.getPath('userData'), 'database');
  // 创建数据库连接
  db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
      console.error('Error connecting to the database:', err.message);
    } else {
      console.log('Connected to the database.');
      // 在这里可以执行数据库操作
    }
  });
  // await node_http(db)

  let secureDnsServers = [
    "https://easypay.heliumos-dns.info/dns-query",
  ];
  await storage.get("data", function (error, data) {
    datas = data;
    // if (datas?.dnsValue ) {
    //   secureDnsServers[0]='https://' + datas?.dnsValue + '.heliumos-dns.info/dns-query'
    // }

  });
  //配置proxy
  // app.commandLine.appendSwitch('proxy-server', 'http://your-proxy-server:port');

  //开机自启动
  app.setLoginItemSettings({
    // 设置为true注册开机自起
    openAtLogin: datas?.autoStart,
    openAsHidden: false,
    path: process.execPath,
  });

  app.configureHostResolver({
    enableBuiltInResolver: false,
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

