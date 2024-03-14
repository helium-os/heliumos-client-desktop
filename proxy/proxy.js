const schedule = require('node-schedule');
const http = require('http');
const net = require('net');
const url = require('url');
const crypto = require("crypto");

const tools = require('./tools');
const config = require('./config');

const logger = require('electron-log');

const curve = 'prime256v1';
const algorithm = 'aes-256-ctr';
const buf = Buffer.alloc(16);

let dnsMap = new Map();
let env = "";
let port = 0;
const sockets = {};
let nextSocketId = 0;

async function setEnv(electron_env) {
    console.log(`destroy all server connections`);
    for (const socketId in sockets) {
        sockets[socketId].destroy();
    }

    logger.info(`Start set env: ${electron_env}`);
    env = electron_env;
    await setFirstDNS();
    await setSecondDNS()
    const alias = await updateAliasDb();
    return alias;
}

async function runProxy(electron_env) {
    logger.info(`Start run proxy: ${electron_env}`);
    env = electron_env;

    await setFirstDNS();
    port = await runServer()
    await setSecondDNS();

    const alias = await updateAliasDb();
    return {port, alias};
}

async function getAlias(electron_env) {
    const aliasArray = await tools.getDbValue(electron_env);
    return aliasArray;
}

async function setFirstDNS() {
    dnsMap.clear()

    let dnsUrl = config.prod_dns;
    if (env == "testinner") {
        dnsUrl = config.testinner_dns + "/api/v1/zones"
    } else if (env == "demo") {
        dnsUrl = config.demo_dns + "/api/v1/zones"
    } else if (env == "prod") {
        dnsUrl = config.prod_dns + "/api/v1/zones"
    } else if (env.indexOf("custom") === 0) {
        dnsMap.set("custom", env.substring(7));
        return true;
    }

    const fistDnsData = await tools.proxyRequest(dnsUrl, "get", null, null, null, null);

    try {
        if (fistDnsData == null || JSON.parse(fistDnsData).data == null) {
            logger.error(`Get first dns failed: ${dnsUrl}`);
            return false;
        }
    } catch (e) {
        logger.error(`Parse first dns failed: ${dnsUrl}`);
        return false;
    }

    JSON.parse(fistDnsData).data.forEach(element => {
        dnsMap.set(element.name, element.ip);
    });

    logger.info(`Set first dns finished: ${env}`);
    return true;
}

async function setSecondDNS() {
    let org = "";
    for (const [key, value] of dnsMap) {
        org = key;
        break;
    }

    const url = "https://"+config.dns_server+org+"/api/v1/zones";
    const secondDnsData = await tools.proxyRequest(url, "get", null, null, "http://127.0.0.1:"+port, __dirname + "/../" +config.cert_file);

    try {
        if (secondDnsData == null || JSON.parse(secondDnsData).data == null) {
            logger.error(`Get second dns failed: ${url}`);
            return false;
        }
    } catch (e) {
        logger.error(`Parse second dns failed: ${url}`);
        return false;
    }

    dnsMap.clear()
    JSON.parse(secondDnsData).data.forEach(element => {
        dnsMap.set(element.name, element.ip);
    });

    logger.info(`Set second dns finished: ${env}`);
    return true;
}

async function runServer() {
    const server = http.createServer((req, res) => {
        const { hostname, port, path } = url.parse(req.url);
        const proxyReq = http.request({
            hostname,
            port,
            path,
            method: req.method,
            headers: req.headers,
        }, (proxyRes) => {
            res.writeHead(proxyRes.statusCode, proxyRes.headers);
            proxyRes.pipe(res);
        }).on('error', function (e) {
            res.writeHead(502, { 'Content-Type': 'application/json' });
            res.end();
        });
        req.pipe(proxyReq);
    });


    let res;
    let promise  = new Promise((resolve, reject) => {
        res = resolve;
    });
    server.listen(0, () => {
        port = server.address().port
        logger.info(`Server is listening on port ${port}`);
        res(port);
    })

    server.on('connection', function (socket) {
        // Add a newly connected socket
        const socketId = nextSocketId++;
        sockets[socketId] = socket;

        // Remove the socket when it closes
        socket.on('close', function () {
            delete sockets[socketId];
        });
    });

    server.on('connect', (req, clientSocket, head) => {
        logger.info(clientSocket.remoteAddress, clientSocket.remotePort, req.method, req.url)
        let {port, hostname} = url.parse(`//${req.url}`, false, true)

        if (!hostname || !port) {
            clientSocket.end('HTTP/1.1 400 Bad Request\r\n')
            clientSocket.destroy()
            return
        }
        let orginalHost = hostname

        const hosts = hostname.split(".");
        const org = hosts[hosts.length - 1];

        if (dnsMap.has(org)) {
            hostname = dnsMap.get(org)
            port = config.server_port
        }
        const serverSocket = net.connect(port, hostname);
        const serverErrorHandler = (err) => {
            logger.debug(`Server error: ${err.message}`);
            if (clientSocket) {
                clientSocket.end(`HTTP/1.1 500 ${err.message}\r\n`)
            }
        }
        const serverEndHandler = () => {
            if (clientSocket) {
                clientSocket.end(`HTTP/1.1 500 External Server End\r\n`)
            }
        }

        const clientErrorHandler = (err) => {
            logger.debug(`Client error: ${err.message}`)
            if (serverSocket) {
                serverSocket.end()
            }
        }
        const clientEndHandler = () => {
            if (serverSocket) {
                serverSocket.end()
            }
        }

        clientSocket.on('error', clientErrorHandler);
        clientSocket.on('end', clientEndHandler);
        serverSocket.on('error', serverErrorHandler);
        serverSocket.on('end', serverEndHandler);

        if (dnsMap.has(org)) {
            let secretKey = "";
            const ecdh = crypto.createECDH(curve);
            ecdh.generateKeys();
            const publicKey = ecdh.getPublicKey('hex', 'uncompressed');
            const handshakeData = {"data": publicKey};

            serverSocket.on("data", function (data) {
                if (data.toString() == "OK") {
                    let encryptStream = crypto.createCipheriv(algorithm, secretKey, buf);
                    let decryptStream = crypto.createDecipheriv(algorithm, secretKey, buf);
                    serverSocket.pipe(decryptStream).pipe(clientSocket, {end: false});
                    clientSocket.pipe(encryptStream).pipe(serverSocket, {end: false});
                } else if (data.toString().indexOf("{\"data\":") >= 0) {
                    const publicKeyJson = JSON.parse(data.toString());
                    let sec = ecdh.computeSecret(publicKeyJson.data, "hex");
                    const hash = crypto.createHash('sha256');
                    hash.update(sec);
                    const secHash = hash.digest('hex');
                    secretKey = Buffer.from(secHash, "hex").subarray(0, 32);
                    logger.debug(`secret key string: ${Buffer.from(secHash, "hex").subarray(0, 32).toString("hex")}`);
                    let helloInfo = {"port": ":443", "host": orginalHost, "type": ""};
                    if (org === "custom")
                    {
                        helloInfo.type = "ping";
                    }
                    serverSocket.write(JSON.stringify(helloInfo));
                } else if (data.toString().indexOf("{\"org_id\":") >= 0) {
                    const orgJson = JSON.parse(data.toString());
                    dnsMap.clear();
                    dnsMap.set(orgJson.org_id, env.substring(7));
                }
            });
            serverSocket.on('connect', () => {
                clientSocket.write([
                    'HTTP/1.1 200 Connection Established',
                    'Proxy-agent: Node-heliumos-proxy',
                ].join('\r\n'))
                clientSocket.write('\r\n\r\n');
                serverSocket.write(JSON.stringify(handshakeData));
            })
        } else {
            serverSocket.on('connect', () => {
                clientSocket.write([
                    'HTTP/1.1 200 Connection Established',
                    'Proxy-agent: Node-heliumos-proxy',
                ].join('\r\n'));
                clientSocket.write('\r\n\r\n');
                serverSocket.pipe(clientSocket, {end: false});
                clientSocket.pipe(serverSocket, {end: false});
            })
        }
    })

    return promise;
}

let count = 0
async function updateAliasDbByCount() {
    if (count != 0)
        return
    count++
    try {
        await updateAliasDb()
    } catch (e) {
        logger.error(`updateAliasDbByCount error: ${e.message}`);
    } finally {
        count = 0
    }
}

async function updateAliasDb() {
    const aliasArray = [];
    let org = "";
    for (const [key, value] of dnsMap) {
        org = key;
        break;
    }

    if (env.indexOf("custom") === 0) {
        aliasArray.push([org, org]);
    } else {
        const url = config.alias_server + org + "/v1/pubcc/organizations"
        const aliasData = await tools.proxyRequest(url, "get", null, null, "http://127.0.0.1:"+port, __dirname + "/../" +config.cert_file);

        try {
            if (aliasData == null || JSON.parse(aliasData).data == null) {
                logger.error(`Get alias failed: ${url}`);
                return []
            }
        } catch (e) {
            logger.error(`Parse alias failed: ${url}`);
            return []
        }

        JSON.parse(aliasData).data.forEach(element => {
            aliasArray.push([element.id,element.alias]);
        });
    }

    const aliasFromDb = await tools.updateDb(env, aliasArray)
    logger.info(`Update aliasDb finished: ${env}`);
    return aliasFromDb;
}

async function fetch(reqUrl, method, headers, body) {
    const { hostname } = url.parse(reqUrl);
    const hosts = hostname.split(".");
    const org = hosts[hosts.length - 1];

    if (dnsMap.has(org)) {
        const data = await tools.proxyRequest(reqUrl, method, headers, body,"http://127.0.0.1:"+port, __dirname + "/../" +config.cert_file);
        return data;
    } else {
        const data = await tools.proxyRequest(reqUrl, method, headers, body,null, null);
        return data;
    }
}


module.exports = {
    runProxy,
    setEnv,
    getAlias,
    fetch
};

schedule.scheduleJob('0 30 0 * * *', async () => {
    await updateAliasDbByCount();
});
