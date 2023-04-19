const { Menu, BrowserWindow } = require('electron')
 
// 菜单模板
let template = [
    {
        label: '前端技能', 
        submenu: [
            {
                label: 'JavaScript',
                click() {

                }
            },
            { label: 'TypeScript' }
        ]
    },
    { 
        label: '后端技能',
        submenu: [
            { label: 'golang' },
            { label: 'Python' }
        ]
    }
]
 
// 设置菜单
let m = Menu.buildFromTemplate([])
Menu.setApplicationMenu(m)
