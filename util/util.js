const fs = require('fs')
const storage = require("electron-json-storage");
const dirCache = {};
const _ = require('lodash');
const { app, dialog } = require("electron");
const log = require('electron-log');
const electronLocalshortcut = require('electron-localshortcut');

//存入数据
setDataSourse = (data, filePath = './data.json', en = true) => {

  if (!fs.existsSync(filePath)) {
    writeFileByUser(filePath)
  }
  fs.writeFileSync(
    filePath,
    data,
    {
      encoding: "utf-8"
    }
  );
}
//
function writeFileByUser(filePath) {
  mkdir(filePath);
  fs.appendFile(filePath, '', 'utf8', function (err) {
    if (err) {
      console.log(err);
    } else {
      console.log('appendFile')
    }
  })
}

function mkdir(filePath) {
  const arr = filePath.split('/');
  let dir = arr[0];
  for (let i = 1; i < arr.length; i++) {
    if (!dirCache[dir] && !fs.existsSync(dir)) {
      dirCache[dir] = true;
      fs.mkdirSync(dir);
    }
    dir = dir + '/' + arr[i];
  }
  fs.writeFileSync(filePath, '')
}

//自动更新
AutoUpdater = (autoUpdater) => {
   autoUpdater.logger = log
  //要想使用自动更新，不能配置DNS解析
  // autoUpdater.setFeedURL("http://127.0.0.1:9005/");
  autoUpdater.autoDownload = false
  autoUpdater.checkForUpdates();
  // 处理检查更新事件
  autoUpdater.on('checking-for-update', () => {
    log.info('Checking for update...');
  });

  // 处理发现更新事件
  autoUpdater.on('update-available', (info) => {
      dialog.showMessageBox({
            type: 'info',
            title: '软件更新',
            message: '发现新版本, 确定更新?',
            buttons: ['确定', '取消']
        }).then(resp => {
            if (resp.response == 0) {
                autoUpdater.downloadUpdate()
            }
        })
  });

  // 处理没有更新的事件
  autoUpdater.on('update-not-available', () => {
    log.info('No update available.');
  });

  // 处理更新下载进度事件
  autoUpdater.on('download-progress', (progressObj) => {
    log.info('Download progress:', progressObj);
  });

  // 处理更新下载完成事件
  autoUpdater.on('update-downloaded', (info) => {
   dialog.showMessageBox({
            title: '下载完成',
            message: '最新版本已下载完成, 退出程序进行安装'
        }).then(() => {
            autoUpdater.quitAndInstall()
        })

  });

  // 处理更新错误事件
  autoUpdater.on('error', (err) => {
    console.error('Error while checking for updates:', err);
  });
}

macShortcutKeyFailure = (win) => {
  if (process.platform === 'darwin') {
    let contents = win.webContents
    electronLocalshortcut.register(win,'CommandOrControl+C', () => {
      if (win && !win.isDestroyed()) {
        console.log('注册复制快捷键成功')
        contents && contents?.copy()
      }
    })

    electronLocalshortcut.register(win,'CommandOrControl+V', () => {
      if (win && !win.isDestroyed()) {
        console.log('注册粘贴快捷键成功')
        contents && contents?.paste()
      }
    })

    electronLocalshortcut.register(win,'CommandOrControl+X', () => {
      if (win && !win.isDestroyed()) {
        console.log('注册剪切快捷键成功')
        contents && contents?.cut()
      }
    })

    electronLocalshortcut.register(win,'CommandOrControl+A', () => {
      if (win && !win.isDestroyed()) {
        console.log('注册全选快捷键成功')
        contents && contents?.selectAll()
      }
    })
  }
}
//多开
multipleOpen = (app, BrowserWindow, createWindow, mul = false) => {
  if (mul) {
    createWindow();
  } else {
    if (!app.requestSingleInstanceLock()) {
      app.quit();
      return;
    }
    createWindow();
    app.on("active", () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
      }
    });
  }
}
//获取stroage数据
getStorageData = (data = 'data') => {
  let res
  let promise = new Promise((resolve, reject) => {
    res = resolve;
  });
  storage.get(data, function (error, datas) {
    res(datas)
  });
  return promise
}

function getNewValue(value, oldValue) {
  if (value === null) {
    return value;
  } else if (Array.isArray(value)) {
    return value;
  } else if (typeof value === 'object') {
    return { ...oldValue || {}, ...value };
  } else {
    return value;
  }
}
//存放stroage数据
setStorageData = async (datas = 'data', arg, routeList = []) => {
  let data = await getStorageData(datas)
  data = data || {}
  if (routeList.length == 0) {
    data = _.merge({}, data, arg);
  } else {
    let setData = data
    for (let i = 0; i < routeList.length - 1; i++) {
      if (!setData[routeList[i]]) {
        setData[routeList[i]] = {}
      }
      setData = setData[routeList[i]]
    }
    setData[routeList[routeList.length - 1]] = getNewValue(arg, setData[routeList[routeList.length - 1]] || {})
  }

  storage.set(datas, data);
}

module.exports = {
  setDataSourse,
  AutoUpdater,
  macShortcutKeyFailure,
  multipleOpen,
  getStorageData,
  setStorageData,
};