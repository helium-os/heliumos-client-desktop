const fs = require('fs')
const storage = require("electron-json-storage");
const dirCache = {};
const _ = require('lodash');



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
}

macShortcutKeyFailure = (win, globalShortcut) => {
  if (process.platform === 'darwin') {
    let contents = win.webContents
    globalShortcut.register('CommandOrControl+C', () => {
      console.log('注册复制快捷键成功')
      contents&&contents?.copy()
    })

    globalShortcut.register('CommandOrControl+V', () => {
      console.log('注册粘贴快捷键成功')
      contents&&contents?.paste()
    })

    globalShortcut.register('CommandOrControl+X', () => {
      console.log('注册剪切快捷键成功')
      contents&&contents?.cut()
    })

    globalShortcut.register('CommandOrControl+A', () => {
      console.log('注册全选快捷键成功')
      contents&&contents?.selectAll()
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
//存放stroage数据
setStorageData = async (datas = 'data', arg, routeList = []) => {
  let data = await getStorageData(datas)
  if (typeof data === 'object') {
    if (routeList.length == 0) {
      data = _.merge({}, data, arg);
    } else {
      let setData=data
      for (let i = 0; i < routeList.length-1; i++) {
        if(!setData[routeList[i]]){
          setData[routeList[i]]={}
        }
        setData=setData[routeList[i]]
      }
      setData[routeList[routeList.length-1]]={...(setData[routeList[routeList.length-1]]||{}),...arg}
    }
  } else {
    data = arg
  }
  storage.set(datas, data);
}
//链接在默认浏览器中打开
webCreated=(app)=>{
   app.on('web-contents-created', (e, webContents) => {
    webContents.setWindowOpenHandler(({ url, frameName }) => {
        shell.openExternal(url);
        return { action: 'deny' };
    });
});
}

module.exports = {
  setDataSourse,
  AutoUpdater,
  macShortcutKeyFailure,
  multipleOpen,
  getStorageData,
  setStorageData,
  webCreated
};