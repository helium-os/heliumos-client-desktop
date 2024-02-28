const { ipcMain, app, BrowserWindow, dialog, globalShortcut, Menu, shell, session } = require('electron');
const path = require('path');
const storage = require('electron-json-storage');
var crypto = require('crypto');
var fs = require('fs');
const proxy = require('./proxy/proxy');
const install = require('./proxy/install');
const util = require('./util/util');
const changeClose = require('./app-init/changeClose');
let { autoUpdater } = require('electron-updater');
var keyList = ['heliumos.crt', '../heliumos.crt'];
var publicKey;
app.setName('Helium OS');
//F10双击,F8双击
let f10Press = false,
    f8Press = false;
let lastPressTime = 0;
const doublePressInterval = 300;
let org = '';
let env = 'demo';

const modeTypeMap = {
    normal: 'normal',
    install: 'install',
};

keyList.forEach((item) => {
    if (fs.existsSync(path.join(__dirname, item))) {
        publicKey = fs.readFileSync(path.join(__dirname, item), 'utf8');
    }
});
let datas = {};
let loading = false;

//双击F10,切换环境
const F10 = (win) => {
    const options = {
        type: 'question',
        title: '选择环境',
        message: '请选择您的环境：',
        buttons: ['开发环境', '测试环境', '生产环境', '取消'],
    };
    if (loading) {
        return;
    }
    dialog.showMessageBox(options).then(async (response) => {
        const selectedOption = response.response;
        let dbNameList = ['testinner', 'demo', 'prod'];
        let dbName = dbNameList[selectedOption];
        if (dbName) {
            loading = true;
            win.webContents.send('Loading', loading);
            await proxy.setEnv(dbName);
            loading = false;
            win.webContents.send('change-env', dbName);
            win.webContents.send('Loading', loading);
            env = dbName;
            if (env != 'prod') {
                globalShortcut.register('F9', () => {
                    win.webContents.openDevTools();
                });
            } else {
                globalShortcut.unregister('F9');
            }
            await util.setStorageData('data', { _last: { env: dbName, org: null, name: null } });
        }
    });
};
//双击F8,清除缓存
const F8 = (win) => {
    const options = {
        type: 'question',
        title: '清除缓存',
        message: '是否清除缓存',
        buttons: ['确认', '取消'],
    };
    if (loading) {
        return;
    }
    dialog.showMessageBox(options).then(async (response) => {
        if (response.response == 0) {
            await session.defaultSession.clearStorageData();
            await storage.clear(() => util.loadUserListPage(win));
        }
    });
};

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
            preload: path.join(__dirname, 'preload.js'),
        },
    });
    // 创建加载动画窗口
    const loadingWindow = new BrowserWindow({
        show: false,
        width: 300,
        height: 300,
        frame: false,
        enableLargerThanScreen: true,
        movable: false,
        webPreferences: {
            nodeIntegration: true,
        },
    });

    loadingWindow.loadFile(path.join(__dirname, 'loading.html'));

    win.webContents.on('will-navigate', (event, url) => {
        if (process.platform !== 'linux') {
            win.setMovable(false);
            loadingWindow.setBounds(win.getContentBounds());
            loadingWindow.show();
        }
    });
    win.webContents.on('did-finish-load', () => {
        if (process.platform !== 'linux') {
            setTimeout(() => {
                win.setMovable(true);
                loadingWindow.hide();
            }, 100);
        }
    });
    loadingWindow.on('closed', () => {
        loadingWindow = null;
    });
    //修改关闭逻辑
    changeClose(win);

    //默认浏览器打开链接
    win.webContents.setWindowOpenHandler(({ url }) => {
        shell.openExternal(url);
        return { action: 'deny' };
    });
    //自动更新,可以设置循环时间，默认是六小时,执行回调函数可以清除计时器
    let deleteUpdaterInterval = util.AutoUpdaterInterval(autoUpdater);

    ipcMain.on('ping', function (event) {
        event.returnValue = 'pong';
    });

    ipcMain.on('iframeUP', function () {
        win.setAlwaysOnTop(true);
    });

    ipcMain.on('iframeDown', function () {
        win.setAlwaysOnTop(false);
    });

    ipcMain.on('setuserInfo', async function (event, arg) {
        let data = await util.getStorageData();

        if (arg?.org != null && arg?.name != null) {
            org = arg?.org;
            await util.setStorageData('data', {
                _last: { env, ...arg },
                [env]: { [arg?.org]: { [arg?.name?.toLocaleLowerCase()]: { ...arg, orgId: data?._last?.orgId } } },
            });

            if (arg?.name && (arg.autoLogin === true || arg.autoLogin === false)) {
                let envList = await util.getStorageData(env);
                await util.setStorageData(
                    env,
                    [
                        ...(envList?.logList || []).filter((item) => item?.name != arg.name),
                        { name: arg?.name, org: arg?.org },
                    ],
                    ['logList'],
                );
            }

            if (arg.autoStart === true || arg.autoStart === false) {
                app.setLoginItemSettings({
                    // 设置为true注册开机自起
                    openAtLogin: arg?.autoStart,
                    openAsHidden: false,
                    path: process.execPath,
                });
            }
            return;
        }
        if (arg?.org != null && arg?.name === null) {
            org = arg?.org;
            await util.setStorageData('data', { _last: { env, ...arg } });
            let envList = await util.getStorageData(env);
            await util.setStorageData(
                env,
                [...(envList?.orgList || []).filter((item) => item?.value != arg.org), { value: arg?.org }],
                ['orgList'],
            );
            return;
        }
        await util.setStorageData('data', arg, [env, data?._last?.org, data?._last?.name]);
    });

    ipcMain.on('clearInfo', async (event, arg) => {
        if (process.platform !== 'linux') {
            win.setMovable(false);
            loadingWindow.setBounds(win.getContentBounds());
            loadingWindow.show();
        }

        if (arg) {
            if (arg == 'second') {
                await util.setStorageData('data', { _last: { org: null, name: null } });
            }
            switch (arg) {
                case 'first':
                    util.loadLoginPage(win);
                    break;
                case 'second':
                    util.loadUserListPage(win);
                    break;
            }
        } else {
            await util.setStorageData('data', { _last: { org: null, name: null } });
            util.loadUserListPage(win);
        }
    });

    ipcMain.on('loadUrl', (event, url) => {
        win.loadURL(url);
    });

    ipcMain.on('switchModeType', async (event, modeType, orgId) => {
        switch (modeType) {
            case modeTypeMap.normal:
                const finalOrgId = orgId || LastUser.orgId;
                if (!finalOrgId) {
                    util.loadLoginPage(win);
                    return;
                }
                util.loadKeycloakLoginPage(win, finalOrgId);
                break;
            case modeTypeMap.install:
                util.loadInstallModePage(win);
                break;
        }
    });

    ipcMain.on('openExternalUrl', (event, url) => {
        shell.openExternal(url);
    });

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
    //       util.loadUserListPage(win);
    //     }
    //   })
    // });

    //监听页面跳转
    win.webContents.on('did-navigate', (event, url) => {
        if (env != 'prod' || org === 'heliumos' || org === 'easypay-internal') {
            globalShortcut.register('F9', () => {
                win.webContents.openDevTools();
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
                        F10(win);
                    }
                    f10Press = false; // 重置状态
                }
            });
        } else {
            globalShortcut.unregister('F10');
        }
    });
    win.webContents.on('before-input-event', (event, input) => {
        if (input.type === 'keyDown' && input.key === 'Enter' && input.shift) {
            event.preventDefault(); // 阻止默认行为，即不打开新页面
        }
    });
    win.on('focus', () => {
        if (env != 'prod' || org === 'heliumos' || org === 'easypay-internal') {
            globalShortcut.register('F9', () => {
                win.webContents.openDevTools();
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
                        F10(win);
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
                    F8(win);
                }
                f8Press = false; // 重置状态
            }
        });
    });
    // mac下快捷键失效的问题以及阻止shift+enter打开新页面问题
    util.macShortcutKeyFailure(win);

    let LastUser = datas?.[env]?.[datas?._last?.org]?.[datas?._last?.name];
    if (LastUser?.autoLogin == true && LastUser?.orgId) {
        util.loadKeycloakLoginPage(win, LastUser.orgId);
    } else {
        util.loadUserListPage(win);
        session.defaultSession.clearStorageData({
            storages: ['cookies'],
        });
    }

    win.on('blur', () => {
        globalShortcut.unregister('F9');
        globalShortcut.unregister('F10');
    });
    win.maximize();
};

app.on('certificate-error', (event, webContents, url, error, cert, callback) => {
    let a = new crypto.X509Certificate(publicKey);
    let b = new crypto.X509Certificate(cert.data);
    if (
        b &&
        b.issuer &&
        b.issuer.split('OU=') &&
        b.issuer.split('OU=')[1] &&
        b.issuer.split('OU=')[1].split('\n') &&
        a.issuer.split('OU=')[1].split('\n')[0] == b.issuer.split('OU=')[1].split('\n')[0]
    ) {
        event.preventDefault();
        callback(true);
    } else {
        callback(false);
    }
});

app.whenReady().then(async () => {
    datas = await util.getStorageData();
    // env = datas?._last?.env || 'prod'
    env = 'testinner';
    org = datas?._last?.org;
    //安装接口测试
    const kubeConfig = "apiVersion: v1\n" +
        "clusters:\n" +
        "- cluster:\n" +
        "    certificate-authority-data: LS0tLS1CRUdJTiBDRVJUSUZJQ0FURS0tLS0tCk1JSUREekNDQWZlZ0F3SUJBZ0lVSFRtMDdRM1JhTGoxa2Q5NE9EeG5NdG1oZVJzd0RRWUpLb1pJaHZjTkFRRUwKQlFBd0Z6RVZNQk1HQTFVRUF3d01NVEF1TVRVeUxqRTRNeTR4TUI0WERUSTBNREl5TnpBNU1ETXlOMW9YRFRNMApNREl5TkRBNU1ETXlOMW93RnpFVk1CTUdBMVVFQXd3TU1UQXVNVFV5TGpFNE15NHhNSUlCSWpBTkJna3Foa2lHCjl3MEJBUUVGQUFPQ0FROEFNSUlCQ2dLQ0FRRUEyQ1ZmY2xhRHRHK3I3aThIT3RLYUtRMTNHODZKck1SdndsdWEKanFtTzlNbmdEOG1tQ3ZQWGFGaXJGcXZPdG9yTjliUm01THF2N2RUV01yZHNueUp3N2hGbUU0WmlwYU1oSDZyZwp3WmMzNHNzL1ljOERCR2tCTmJnV0tmQ1dVeDI3S3drakFlQ2d6SEs0U3JjR3pXZkZWM2lReElzdmR5dk5vNlRlCjFDNERVS1dKcTB4Q3o2emRBVlp4NzNuTHZBMkIrN3I5SVc2djZVRDcvanoyY2FMeS9IaTdxL0doTk5QL0ZiRk4KUVA0Zm5SRmZhcVlieDkzWjZYeWsvdHAzd3dLbEhDVUZ2VFBGWnFVaGRMVHQ4eUd3d0lERngzMThvNFNSSUtBRgpuU2VnZmhCeVIwaExCd3p4QzVOM0g1WnVpVDM4SWJvVFA5enI0bTBrUHR0VURZTnEzd0lEQVFBQm8xTXdVVEFkCkJnTlZIUTRFRmdRVWI4MjBLMHdad3lwNVhVMjdUSDBxQ1lFSS9DQXdId1lEVlIwakJCZ3dGb0FVYjgyMEswd1oKd3lwNVhVMjdUSDBxQ1lFSS9DQXdEd1lEVlIwVEFRSC9CQVV3QXdFQi96QU5CZ2txaGtpRzl3MEJBUXNGQUFPQwpBUUVBUmhTbkROTEpQbmsxNW1NTDV5M1AvZEQ4Q0tXdmpoTkNBMU84T0lNOUYrZGhWRGFxRmVmZ3lCZW00UzNNCkwza1ZkVzQ2cjFGaFhYOWR0MG05OWlRNW4rTjlJeGt5aHJNVkVFaU96L2NzWEk5NEdVNkZaRW9IUHJqanRvMHMKeTJyK0RxM3d1ZnRjZnNncUJRdkR5M1VseWJGeUlONG5KUExtQzBKanNnRWpsRzJlNUFpUmwrcGZXd3NZdnA1NApOeVhpd3YxT1pndEJxck9KSTB0M3VKRy9PRllLazdaYi93UzdlVlI3UEQ0SGxiS0RHU0p5TGY1UitNL1l2V053CmVLK2I5VTZmVEJDWkt6TEVXZFc2aytGTVhMQ1ZleE9rZkNVby9XRkp2eGg0T2lsVi9HUllVQ0xoeks0Um54NEIKZmlkN3RNanBPNXo4NjdlMUZ1Sko4WGJIT3c9PQotLS0tLUVORCBDRVJUSUZJQ0FURS0tLS0tCg==\n" +
        "    server: https://192.168.1.171:16443\n" +
        "  name: microk8s-cluster\n" +
        "contexts:\n" +
        "- context:\n" +
        "    cluster: microk8s-cluster\n" +
        "    user: admin\n" +
        "  name: microk8s\n" +
        "current-context: microk8s\n" +
        "kind: Config\n" +
        "preferences: {}\n" +
        "users:\n" +
        "- name: admin\n" +
        "  user:\n" +
        "    client-certificate-data: LS0tLS1CRUdJTiBDRVJUSUZJQ0FURS0tLS0tCk1JSUN6RENDQWJTZ0F3SUJBZ0lVZE9Ic0FlSExESTFYeWdNOElWb3Fiam1oZnVJd0RRWUpLb1pJaHZjTkFRRUwKQlFBd0Z6RVZNQk1HQTFVRUF3d01NVEF1TVRVeUxqRTRNeTR4TUI0WERUSTBNREl5TnpBNU1ETXlPRm9YRFRNMApNREl5TkRBNU1ETXlPRm93S1RFT01Bd0dBMVVFQXd3RllXUnRhVzR4RnpBVkJnTlZCQW9NRG5ONWMzUmxiVHB0CllYTjBaWEp6TUlJQklqQU5CZ2txaGtpRzl3MEJBUUVGQUFPQ0FROEFNSUlCQ2dLQ0FRRUF3RnMrZTBYeXAra3gKc0JmSGhodHZ2bElKZFFvRlJlYzQ1bm00eENISHZWT3pHWFh4Z1hVcGhKb25PZWg4TXhHMmViZmRkdFloYzQySQpHV0E0eTJVendqOEpMZk1lTlNXTXVLY1BuUFlDWUFNWGRuS213V1JxMzRLNFFpdGpOSWh3ZnJFMElxRHZOb2VMCkFUQ095b2QvYlRKdWZCeGFFMTZVTzd1RGJVbHJhazZqWXoyUUNJUTZQZlg2S3VPRnkrTFcxR2IzVjFjVjgzVFgKMVZwdXkrY1J5NGVZWlFmMkU4MnlNQW5xbEdpdEkveTFWcUZiU0EvRThkUG0zRDZBb0NvbStHclZtbTNVZ0g0Rwpoemhyc3k5OU1qSlJLYS8vRWVJYVhjTlNvZEhnOU1uV2Vtb0U4TkV3Vi9JSktUVHlRMktYUU1SWE5LYmZwdll5Cm5XMG94R2RIandJREFRQUJNQTBHQ1NxR1NJYjNEUUVCQ3dVQUE0SUJBUUM4VTVEa2Z4MVkyZFRUU0V4alNmdjUKOVJ6VlY4Q3lIZWVqdkIxSEwwMkpBQWh4RXk4YkQxYXpzeUtYV2JCcDliOTRzdEdvMG44T0xZOS9wV2NNMUN4WApEcWlKTStoT216ZlF5eDZtV3pzeUZUKzZWTjFhQ1RlWnpMeGI4NktYU3B0eW4yUkYzRnJ1MDUvRGljdFkzYzlmClJGS24xY2Z2M0JrUFRjTVR0ZDJaNE1CR0t3KzdsaEJ2NWFwQWlIb00xQjFXdTB0ZzlHMGVaY1UxZHk5RWNWaS8KSDdJV3dGSmlQa2JCQWlYWExIMzVoRXptUzRpRm9QZ0krMlppbWJPQTQxWUdSd3F3cm5aQzBNZ3RGMWwwd25MYgpsMVNLaS9FbHJiS0IxRFFoRlhYdU9GMVBlYUw1MTdYL1VmMGFsNW5aRUlkdGxqQ2kxVzZ1ZnVZMlpkOFRNK3V5Ci0tLS0tRU5EIENFUlRJRklDQVRFLS0tLS0K\n" +
        "    client-key-data: LS0tLS1CRUdJTiBSU0EgUFJJVkFURSBLRVktLS0tLQpNSUlFcFFJQkFBS0NBUUVBd0ZzK2UwWHlwK2t4c0JmSGhodHZ2bElKZFFvRlJlYzQ1bm00eENISHZWT3pHWFh4CmdYVXBoSm9uT2VoOE14RzJlYmZkZHRZaGM0MklHV0E0eTJVendqOEpMZk1lTlNXTXVLY1BuUFlDWUFNWGRuS20Kd1dScTM0SzRRaXRqTklod2ZyRTBJcUR2Tm9lTEFUQ095b2QvYlRKdWZCeGFFMTZVTzd1RGJVbHJhazZqWXoyUQpDSVE2UGZYNkt1T0Z5K0xXMUdiM1YxY1Y4M1RYMVZwdXkrY1J5NGVZWlFmMkU4MnlNQW5xbEdpdEkveTFWcUZiClNBL0U4ZFBtM0Q2QW9Db20rR3JWbW0zVWdINEdoemhyc3k5OU1qSlJLYS8vRWVJYVhjTlNvZEhnOU1uV2Vtb0UKOE5Fd1YvSUpLVFR5UTJLWFFNUlhOS2JmcHZZeW5XMG94R2RIandJREFRQUJBb0lCQVFDNTMzR2c3Ulp0Nm9oNQpBSUZzdFZabE1pQ3hWOTJBanM0TTU5SUN0Q0d1Y1JLL3A1aVc0QUFlZ2xjbFBlSEY5M2U4Wms4NlpmQXRHTFpLCnp4QVNldGhvKzBDRGhrbktVVjZKaitVbVp4SWtkTmhYUExLbWJjSlgrSmpVVjlpbENyS3B1ZElISkR3REZUYmQKRDI3cmhjTThZVjhoenNPN3M4akpiNGl3TWlINXRoYUQ2U0xrQmtUc3JOUENMcmFxUkx6alNqTDhvS1FEVFNILwpCWUVrS1dRbnptdGNoNkt1a0R2WEJLeGxiVEZzaGtRQWNRaU92bkNEeXZ5VDZ4TG9xVTRsK0RSc3l4NURXRmsvCnlLRXFFd0dsa2FGaWhJYXJOcmV6VUtUN1VXeXpncGsvR2Fpd2NvN3RWUlRjN3JHYzFpT2xoWDA4SFo3dm1KWXgKdER3cXFPWUJBb0dCQU9FUWFMZ3pFMnRyYVIycFBwais3YmxRMDgvbk1TNUprMUNoNXljaEZwMXpGVVYxZ2NRRwpQdUtnRlZKaTBlMHAreVVPb3BOSWRLOU9sUTgyZXcrUkNqYjhtbUtobUpma2llWS9YMDl2NW1LRzBWRlU2NVVtCkxuYXNNTHVrRGROdDIwTGxSWUY5QmdhNWwyQ1l0dEFnRmZUYThhL0xTdnVOTmxZRFFwUGxDNVdaQW9HQkFOckwKNllOUFFsVUZEcnc4VEZmd0NEczc0YmE5UzZ6S0pyYWdWdk1vUDh4ZWM0cEJ1Q0dJNDZDMGo4K0VxYXhXNno5RwpuZHNEMktsOE1vMUZYRkRFNDI5Vy9IUWRzN0F5YjJzVTM1TVJSWkJxWFBZTVBQQkNwQnJLdzRTMEVnWUJIUmdKCjRIQ0djTDVoaWgvQ2lqdjJncE1tcUxzUlNXbXNtdmlob0lBTTN5OW5Bb0dCQU1RN0gyTURQWHBhVTNOR0hrc2QKY3I0eUNBdnNZc2dkNUhEWVNRZW41T1R3ODJuMVUyaExuY2JRbHVhWFBMdlE3NlZXeGs4dVRIYVJTSXZVRDZYNQo2dk1ZZWE5bmYvbG5qUWlRMXBRWFY4TXVFeEVidnEvemMyMkxJbzVvTXBuVzNlYk1xamFGZ0p5YWNxOEpWOVBOCk5mZWdjanU1UDY1bWFDckVldWNpUEdCNUFvR0FYNXlpUTdaOEZ5a3Bva3A3VmlaWGdvTU5oTXk5NkJsQ3g2WFQKdVZpS1lLV1p1ZjQwRjd0NU5YNFNKaTRqODJMY1ZIOW9kZy85T3p0QjRBaENhaTFQOGhUQ0ozL2ZTUTBSTVdzaQp0R0xrMGxJWW81RC9oRUtxOGVaUGdJc3NJU0dWZEM3RXZJZVRkeTZxckd4WCtoSWtSMmVxYm0wRWRzQnR6RjdkCkEzZ2NnOXNDZ1lFQWdRZS9WbFYzbURQZS93ekFsaWtQTUNBM3RvWkNhS0VieUZIWTZ4NnR5YVZsMFQrSldnanoKNll5LzM0SktlWHl3RkswTHF3Z01TSG1ZbXBWbm5KWEJjbkpXVlRSUk9UUXNPOThBUjFyMzhoQ3VtQXBKWGFETAphS0dwZzVFZm5TSC9lWkJYbS8wcFlDOTBPb0lOMnNRYXhOR1B0c3pIZjlSYjdNVzhqUXRVeE5vPQotLS0tLUVORCBSU0EgUFJJVkFURSBLRVktLS0tLQo="

    const config = await install.getClusterConfig(kubeConfig)
    console.log(JSON.stringify(config, null, 2))

    let installConfig = {}
    installConfig.expose = "loadBalancer";
    installConfig.storageClass = config.storageClasses[0];
    installConfig.adminPw = "1qaz@WSX";
    installConfig.orgId = config.orgId;
    installConfig.serverIp = config.serverIp.value;
    installConfig.baseConfig = config.baseConfig;
    installConfig.oamConfig = config.oamConfig;

    const orgId = await install.installHeliumos(installConfig)
    console.log("install result:" + orgId)

    // 安装成功会返回orgId，如果安装失败orgId为空字符串
    if (orgId != "") {
      const status = await install.getInstallStatus(orgId);
      console.log(status)
    }
    // 这个例子中的orgId为2cc473d7ee，可以直接读取安装状态，反复多次安装都会安装失败，orgId为空字符串
    // const status = await install.getInstallStatus("2cc473d7ee");
    // console.log(status)




    //配置proxy
    let { port } = await proxy.runProxy(env);
    app.commandLine.appendSwitch('proxy-server', 'http://127.0.0.1:' + port);
    //更新不走端口
    app.commandLine.appendSwitch('proxy-bypass-list', '*github.com');
    //开机自启动
    app.setLoginItemSettings({
        // 设置为true注册开机自起
        openAtLogin: datas?.[env]?.[datas?._last?.org]?.[datas?._last?.name]?.autoStart || false,
        openAsHidden: false,
        path: process.execPath,
    });

    //dns配置
    ipcMain.handle('getUserValue', async function (event, arg) {
        let data = await util.getStorageData();
        if (data?._last) {
            if (data?._last?.name) {
                return data?.[env]?.[data?._last?.org]?.[data?._last?.name]?.[arg] || '';
            } else {
                return data?._last?.[arg] || '';
            }
        } else {
            return '';
        }
    });
    //获取麦克风权限和摄像头权限
    ipcMain.handle('askForMediaAccess', async function (event, arg) {
        let data = await util.askForMediaAccess(arg);
        return data;
    });

    //dns配置
    ipcMain.handle('getLogList', async function () {
        let envList = await util.getStorageData(env),
            res = [];
        if (envList && envList?.logList && envList?.logList.length > 0) {
            let data = await util.getStorageData();
            envList?.logList.forEach((item) => {
                if (item.name && item.org) {
                    let userInfo = { ...(data?.[env]?.[item.org]?.[item.name] || {}) };
                    delete userInfo.password;
                    res.push({ ...userInfo });
                }
            });
            return res;
        } else {
            return res;
        }
    });

    ipcMain.handle('getOrgList', async function () {
        let envList = await util.getStorageData(env);
        return envList.orgList || [];
    });

    ipcMain.handle('getDbValue', async function () {
        let res = await proxy.getAlias(env);
        return res;
    });
    const template =
        process.platform === 'darwin'
            ? [
                  {
                      label: 'Helium OS',
                      submenu: [
                          { role: 'about' },
                          { type: 'separator' },
                          { role: 'services', submenu: [] },
                          { type: 'separator' },
                          { role: 'hide' },
                          { role: 'hideothers' },
                          { role: 'unhide' },
                          { type: 'separator' },
                          { role: 'quit', accelerator: 'CmdOrCtrl+Q' },
                      ],
                  },
                  {
                      label: '窗口',
                      submenu: [
                          { role: 'minimize', accelerator: 'CmdOrCtrl+M' },
                          { role: 'close', accelerator: 'CmdOrCtrl+W' },
                          { role: 'zoom' },
                          { type: 'separator' },
                          { role: 'togglefullscreen', accelerator: 'CmdOrCtrl+F' },
                      ],
                  },
              ]
            : [];
    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);

    //多开配置
    util.multipleOpen(app, BrowserWindow, createWindow, false);
});

app.on('window-all-closed', async () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});
