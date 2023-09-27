const { app, Tray, Menu } = require("electron");
const util = require('../util/util');
const path = require("path");
//创建系统托盘 
let setTray = (win) => {
  let iconPath = util.findPath(["./../icon.png", '../build/icon.png', '../../icon.png'], __dirname)
  //  创建系统托盘图标
  let tray = new Tray(path.join(__dirname, iconPath));

  // 创建托盘菜单
  const contextMenu = Menu.buildFromTemplate([
    { label: '显示应用', click: () => win.show() },
    { label: '退出', click: () => app.exit() }
  ]);

  // 设置托盘图标的上下文菜单
  tray.setContextMenu(contextMenu);

  // 双击托盘图标时显示应用
  tray.on('double-click', () => win.show());
}

module.exports = setTray