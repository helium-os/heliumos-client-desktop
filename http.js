const url = require('url');
const querystring = require('querystring');
const storage = require("electron-json-storage");
const http = require('http')
//启动服务，并且存储数据 传参db:数据库，环境env，默认是生产
async function node_http(db,env) {
  // 创建表
  await db.run('CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, name TEXT, age INTEGER)');

  // 插入数据
 await db.run('INSERT INTO users (name, age) VALUES (?, ?)', ['John Doe1', 30], (err) => {
    if (err) console.error('Error inserting data:', err.message);
    else console.log('Data inserted successfully.');
  });
  // 删除数据
  await db.run('DELETE FROM users WHERE id = ?', [1], (err) => {
    if (err) console.error('Error deleting data:', err.message);
    else console.log('Data deleted successfully.');
  });

  // 查询数据
  await db.all('SELECT * FROM users', (err, rows) => {
    if (err) console.error('Error querying data:', err.message);
    else console.log('Query result:', rows);
  });

  const server = http.createServer(handleRequest);
  server.listen(3000, () => {
    console.log('Server is running on port 3000');
  });
}
function handleRequest(request, response) {
  const parsedUrl = url.parse(request.url);
  const pathname = parsedUrl.pathname;

  // 处理 GET 请求
  if (request.method === 'GET') {
    if (pathname === '/api/getData') {

      storage.get("demo", function (error, data) {
        // 这里处理获取数据的逻辑
        const responseData = { message: data };
        sendResponse(response, responseData);

      })




    } else {
      sendResponse(response, { error: 'Not found' }, 404);
    }
  }

  // 处理 POST 请求
  if (request.method === 'POST') {
    if (pathname === '/api/postData') {
      // 处理 POST 请求体
      let body = '';
      request.on('data', (chunk) => {
        body += chunk;
      });

      request.on('end', () => {
        const postData = querystring.parse(body);
        //存储到demo中
        storage.get("demo", function (error, data) {
          storage.set('demo', { ...data, ...JSON.parse(body) })
          // 这里处理提交的数据，并返回响应
          const responseData = { message: `This is a response from POST request with data: ${JSON.stringify(postData)}` };
          sendResponse(response, responseData);

        })


      });
    } else {
      sendResponse(response, { error: 'Not found' }, 404);
    }
  }
}

function sendResponse(response, data, status = 200) {
  response.writeHead(status, { 'Content-Type': 'application/json' });
  response.end(JSON.stringify(data));
}

module.exports = {
  handleRequest,
  node_http
};