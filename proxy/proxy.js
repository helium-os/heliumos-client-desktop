const http = require('http');
const net = require('net');
const url = require('url');
const crypto = require("crypto");
const os = require('os');
const storage = require("electron-json-storage");
storage.setDataPath(os.tmpdir());

const tools = require('./tools');
const config = require('./config');
const hostile = require('./hostile')

const logger = require('./logger').getLogger('Node-heliumos-proxy');

const curve = 'prime256v1';
const algorithm = 'aes-256-ctr';
const buf = Buffer.alloc(16);
const helloInfo = {"port": ":443"};

const dnsMap = new Map();



async function setHosts(ip, url) {
    let res;
    let promise = new Promise((resolve, reject) => {
        res = resolve;
    });


    hostile.set(ip, url, function (err) {
        if (err) {
            logger.debug(`Set /etc/hosts error: ${err}`);
        } else {
            logger.info(`Set /etc/hosts ${ip} ${url}`);
        }

        res(err);
    })

    return promise;
}


async function setEnv(env) {
    let dnsUrl = config.prod_dns;
    if (env == "testinner") {
        dnsUrl = config.testinner_dns + "/api/v1/zones"
    } else if (env == "demo") {
        dnsUrl = config.demo_dns + "/api/v1/zones"
    } else if (env == "prod") {
        dnsUrl = config.prod_dns + "/api/v1/zones"
    }

    const dnsData = await tools.getUrl(dnsUrl, null);
    let org = ""
    let ip = ""
    JSON.parse(dnsData).data.forEach(element => {
        org = element.name;
        ip = element.ip
    });

    await setHosts(ip, "dns." + org)
    await sleep(5000);

    const realDnsData = await tools.getUrl("https://dns."+org+"/api/v1/zones", null);

    dnsMap.clear()
    JSON.parse(realDnsData).data.forEach(element => {
        logger.info(`Update dns map org: ${element.name} ip: ${element.ip}`);
        dnsMap.set(element.name, element.ip);
    });

    logger.info(`Set env finished: ${env}`);
}


async function runProxy() {
    await setEnv("demo");

    const requestHandler = (req, res) => {
        res.writeHead(405, {'Content-Type': 'text/plain'})
        res.end('Method not allowed')
    }

    const server = http.createServer(requestHandler);

    let res;
    let promise  = new Promise((resolve, reject) => {
        res = resolve;
    });
    server.listen(0, () => {
        const port = server.address().port
        logger.info(`Server is listening on port ${port}`);
        storage.set("proxy_port", port);
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
            port = 18888
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

async function getPort() {
    let res;
    let promise = new Promise((resolve, reject) => {
        res = resolve;
    });

    storage.get("proxy_port", function (error, data) {
        res(data);
    });

    return promise;
}

async function updateAliasDb(dbName) {
    let port = await getPort();
    let org = "";
    for (const [key, value] of dnsMap) {
        org = key;
        break;
    }
    const aliasData = await tools.getUrl(config.alias_server+org+"/v1/pubcc/organizations", "http://127.0.0.1:"+port);
    const aliasArray = [];
    JSON.parse(aliasData).data.forEach(element => {
        aliasArray.push([element.name,element.alias]);
    });
    const data = await tools.updateDb(dbName, aliasArray)
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = {
    runProxy,
    setEnv,
    updateAliasDb,
    getPort
};
