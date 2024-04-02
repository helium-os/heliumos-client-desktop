const { app, Tray, Menu, nativeImage, nativeTheme } = require('electron');
const util = require('../util/util');
const path = require('path');
//创建系统托盘
let setTray = (win) => {
    const iconPath = path.join(__dirname, '../build/icon.png');
    //  创建系统托盘图标
    const image = nativeImage.createFromPath(path.join(__dirname, iconPath));
    let tray = new Tray(image.resize({ width: 16, height: 16 }));
    // 创建托盘菜单
    const contextMenu = Menu.buildFromTemplate([
        { label: '显示应用', click: () => win.show() },
        { label: '退出', click: () => app.exit() },
    ]);

    // 设置托盘图标的上下文菜单
    tray.setContextMenu(contextMenu);

    // 双击托盘图标时显示应用
    tray.on('double-click', () => win.show());
    if (process.platform === 'darwin') {
        const lightModeTrayIcon = path.join(__dirname, '../build/lightModeTrayIcon.png');
        const darkModeTrayIcon = path.join(__dirname, '../build/darkModeTrayIcon.png');
        function updateTrayIcon() {
            // 检测操作系统的外观设置
            // 根据外观设置选择相应的托盘图标
            const trayIconPath = nativeTheme.shouldUseDarkColors
                ? path.join(__dirname, darkModeTrayIcon)
                : path.join(__dirname, lightModeTrayIcon);
            let changeImage = nativeImage.createFromPath(trayIconPath);
            // 设置托盘图标
            tray.setImage(changeImage.resize({ width: 16, height: 16 }));
        }
        // 检测外观设置变化
        nativeTheme.on('updated', () => {
            updateTrayIcon();
        });

        // 初始化时更新托盘图标
        updateTrayIcon();
    }
};

module.exports = setTray;
