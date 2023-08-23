const schedule = require('node-schedule');
const http = require('http');
const net = require('net');
const url = require('url');
const crypto = require("crypto");

const tools = require('./tools');
const config = require('./config');

const logger = require('./logger').getLogger('Node-heliumos-proxy');

const curve = 'prime256v1';
const algorithm = 'aes-256-ctr';
const buf = Buffer.alloc(16);
const helloInfo = {"port": ":443"};

let dnsMap = new Map();
let env = "";
let port = 0;

async function setEnv(electron_env) {
    logger.info(`Start set env: ${electron_env}`);
    env = electron_env;
    await setDNS();
    const alias = await updateAliasDb();
    return alias;
}

async function runProxy(electron_env) {
    logger.info(`Start run proxy: ${electron_env}`);
    env = electron_env;
    port = await runServer()
    const alias = await updateAliasDb()
    return {port, alias};
}

async function getAlias(electron_env) {
    const aliasArray = await tools.getDbValue(electron_env);
    return aliasArray;
}

async function setDNS() {
    dnsMap.clear()

    let dnsUrl = config.prod_dns;
    if (env == "testinner") {
        dnsUrl = config.testinner_dns + "/api/v1/zones"
    } else if (env == "demo") {
        dnsUrl = config.demo_dns + "/api/v1/zones"
    } else if (env == "prod") {
        dnsUrl = config.prod_dns + "/api/v1/zones"
    }

    const dnsData = await tools.getUrl(dnsUrl, null, null, null);
    if (dnsData == null || JSON.parse(dnsData).data == null) {
        logger.error(`Get dns failed: ${dnsUrl}`);
        return false;
    }
    let org = ""
    let ip = ""
    JSON.parse(dnsData).data.forEach(element => {
        org = element.name;
        ip = element.ip
    });

    const url = "https://dns.system.service."+org+"/api/v1/zones";
    const realDnsData = await tools.getUrl(url, null, "dns.system.service." + org, ip);
    if (realDnsData == null || JSON.parse(realDnsData).data == null) {
        logger.error(`Get dns failed: ${url} ${ip}`);
        return false;
    }
    logger.info(`Dns data: ${realDnsData}`);

    JSON.parse(realDnsData).data.forEach(element => {
        dnsMap.set(element.name, element.ip);
    });

    logger.info(`Set dns finished: ${env}`);
    return true;
}

async function runServer() {
    await setDNS();

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

    server.on('connect', (req, clientSocket, head) => {
        logger.debug(clientSocket.remoteAddress, clientSocket.remotePort, req.method, req.url)
        let {port, hostname} = url.parse(`//${req.url}`, false, true)

        if (!hostname || !port) {
            clientSocket.end('HTTP/1.1 400 Bad Request\r\n')
            clientSocket.destroy()
            return
        }

        const paths = hostname.split(".");
        const org = paths[paths.length - 1];

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
                    serverSocket.write(JSON.stringify(helloInfo));
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

async function updateAliasDb() {
    const aliasArray = [];
    let org = "";
    for (const [key, value] of dnsMap) {
        org = key;
        break;
    }

    const url = config.alias_server+org+"/v1/pubcc/organizations"
    const aliasData = await tools.getUrl(url, "http://127.0.0.1:"+port, null, null);
    if (aliasData == null || JSON.parse(aliasData).data == null) {
        logger.error(`Get alias failed: ${url}`);
        return [];
    }

    JSON.parse(aliasData).data.forEach(element => {
        aliasArray.push([element.name,element.alias]);
    });
    await tools.updateDb(env, aliasArray)
    logger.info(`Update aliasDb finished: ${env}`);

    const aliasFromDb = await tools.getDbValue(env)
    return aliasFromDb;
}


module.exports = {
    runProxy,
    setEnv,
    getAlias
};

schedule.scheduleJob('00 30 * * * *', async () => {
    await updateAliasDb()
});
