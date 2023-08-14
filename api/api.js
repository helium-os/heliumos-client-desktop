const net = require('net');
const express = require('express');
const storage = require("electron-json-storage");
const cors = require('cors');
let server;
let apiServer;
const appServer = express();

async function startApiServer(port) {
  await storage.get("data", function (error, data) {
    storage.set("data", { ...data, port });
  });

  appServer.use(cors({
    origin: '*', // 替换为允许的来源
    methods: ['GET', 'POST', 'OPTIONS'], // 允许的 HTTP 方法
    allowedHeaders: ['Content-Type', 'Authorization'], // 允许的请求头
  }));
  apiServer = appServer.listen(port, '127.0.0.1', () => {
    console.log(`API server listening on port ${port}`);
  });

  appServer.get('/api/data', (req, res) => {
    storage.get("data", function (error, data) {
      res.json(data);
    });
  });
}

function creatServer() {

  // 创建一个服务器，自动寻找空余端口
  server = net.createServer(socket => {
    socket.write('Hello from the server!\r\n');
    socket.end();
  });

  server.listen(0, '127.0.0.1', () => {
    const port = server.address().port;
    console.log(`Server listening on port ${port}`);
    startApiServer(port + 1); // 在下一个端口创建 API 服务器
  });


}

function closeServer() {
  server.close();
  apiServer.close();
  server = null;
  apiServer = null;
}

module.exports = {
  closeServer,
  creatServer
}