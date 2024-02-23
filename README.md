# heliumos-client-desktop

该项目主要以 [Electron](https://www.electronjs.org/zh/) 为底层框架。

Electron框架允许您使用JavaScript、HTML和CSS编写跨平台桌面应用程序。它基于Node.js和Chromium，并被Visual Studio Code和许多其他应用程序使用。

## 开发环境配置 & 运行 & 调试

```javascript

// 安装项目
$ git clone git@github.com:helium-os/heliumos-client-desktop.git

$ cd heliumos-client-desktop

// 安装依赖
$ npm install --save

// 运行
$ npm run dev 


```

## 代码结构
    
    |-- app-init                              # 系统托盘
    |-- asset                                 # 页面代码入口
    |-- css                                   # 全局样式                                
    |-- img                                   # 图片路径
    |-- utils                                 # 全局方法路径  
    |-- index.html                            # 入口html
    |-- loading.html                          # 加载页面
    |-- main.js                               # 项目入口（ electron整体控制 ）
    |-- preload.js                            # 预加载文件（ 用于项目和远程页面通讯 ）
    |-- .gitignore                            # git忽略文件
    |-- package.json                          
    |-- README.md                              



## 新功能文件夹路径
  代码路径
    
    app整体功能功能
    |-- main.js                               # 项目入口（ electron整体控制 ）
    app登录首页以及选择用户页面
    |-- asset                                  
         |-- main.jsx                         
    
  

## 发布
需要先看[wiki](https://easypayx.coding.net/p/easypay/wiki/6781)
```javascript

// 开发时先将分支切换到master
git  pull  //拉取master最新代码
git checkout -b  users/songlm( 开发人员姓名简拼 )/6735( 项目任务号 )/changeUI( 项目英文简称 ) //切换到相应任务分支
//开发完成后
git add .
git commit -m  'heliumos#6735( 项目任务号 )  changeUI( 项目英文简称 )'
git push -u origin users/songlm( 开发人员姓名简拼 )/6735( 项目任务号 )/changeUI( 项目英文简称 ) //上传到相应分支
```


