const { app } = require("electron");
const setTray = require('./setTray')
//修改关闭
changeClose = (win) => {

  if (process.platform === 'darwin') {

    let willQuitApp = false

    // 监听窗口关闭事件
    win.on('close', (event) => {
      if (!willQuitApp) {
        // 取消默认关闭行为
        event.preventDefault();
        // 隐藏窗口，而不是退出
        win.hide();
      } else {
        app.exit()
      }
    });
    app.on('before-quit', (event) => {
      willQuitApp = true
    })
    app.on('activate', () => win.show())
  } else {
    // 监听窗口关闭事件
    win.on('close', (event) => {
      // 取消默认关闭行为
      event.preventDefault();
      // 隐藏窗口，而不是退出
      win.hide();
    });
  }
  setTray(win)
}

module.exports = changeClose