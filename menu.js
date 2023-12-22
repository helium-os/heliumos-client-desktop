const { Menu } = require('electron')

const template = process.platform === 'darwin' ? [{
    label: 'Helium OS',
    submenu: [{ role: 'about' },
    { type: 'separator' },
    { role: 'services', submenu: [] },
    { type: 'separator' },
    { role: 'hide' },
    { role: 'hideothers' },
    { role: 'unhide' },
    { type: 'separator' },
    { role: 'quit', accelerator: 'CmdOrCtrl+Q' },],
},
{
    label: '窗口',
    submenu: [{ role: 'minimize', accelerator: 'CmdOrCtrl+M' },
    { role: 'close', accelerator: 'CmdOrCtrl+W' },
    { role: 'zoom' },
    { type: 'separator' },
    { role: 'togglefullscreen', accelerator: 'CmdOrCtrl+F' },],
},] : [];
const menu = Menu.buildFromTemplate(template);
Menu.setApplicationMenu(menu);
