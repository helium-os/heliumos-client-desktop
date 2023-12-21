const { app, Tray, Menu, nativeImage, systemPreferences } = require("electron");
const util = require('../util/util');
const path = require("path");
//创建系统托盘 
let setTray = (win) => {
  let iconPath = util.findPath(["./../icon.png", '../build/icon.png', '../../icon.png'], __dirname)
  //  创建系统托盘图标
  const image = nativeImage.createFromPath(
    path.join(__dirname, iconPath)
  );
  let tray = new Tray(image.resize({ width: 16, height: 16 }));
  // 创建托盘菜单
  const contextMenu = Menu.buildFromTemplate([
    { label: '显示应用', click: () => win.show() },
    { label: '退出', click: () => app.exit() }
  ]);

  // 设置托盘图标的上下文菜单
  tray.setContextMenu(contextMenu);

  // 双击托盘图标时显示应用
  tray.on('double-click', () => win.show());
  if (process.platform === 'darwin') {
    let lightModeTrayIcon = util.findPath(["./../lightModeTrayIcon.png", '../build/lightModeTrayIcon.png', '../../lightModeTrayIcon.png'], __dirname)
    let darkModeTrayIcon = util.findPath(["./../darkModeTrayIcon.png", '../build/darkModeTrayIcon.png', '../../darkModeTrayIcon.png'], __dirname)
    function updateTrayIcon() {
      // 检测操作系统的外观设置
      const isDarkMode = systemPreferences.isDarkMode();
      // 根据外观设置选择相应的托盘图标
      const trayIconPath = isDarkMode
        ? path.join(__dirname, darkModeTrayIcon)
        : path.join(__dirname, lightModeTrayIcon);

      // 设置托盘图标
      tray.setImage(trayIconPath);
    }
    // 检测外观设置变化
    systemPreferences.subscribeNotification('AppleInterfaceThemeChangedNotification', () => {
      updateTrayIcon();
    });

    // 初始化时更新托盘图标
    updateTrayIcon();

  }
}

module.exports = setTray