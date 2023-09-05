const request = require('request');
const logger = require('./logger').getLogger('Node-heliumos-proxy-utils');
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const fs = require('fs');



sqlite3.verbose()
//process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

module.exports = {
    proxyRequest: proxyRequest,
    updateDb: updateDb,
    getDbValue: getDbValue
};

async function proxyRequest(url, method, headers, body, proxy, cert) {
    return new Promise((resolve, reject) => {
        let options = {
            method: method,
            url: url,
            proxy: proxy,
            headers: headers,
            body: body
        };
        if (cert != null) {
            options.ca = fs.readFileSync(cert);
        }
        request(options, function (error, response) {
            if (error) {
                logger.error(`request error: ${error}, url: ${url}, proxy: ${proxy}`);
                resolve(null);
            } else {
                resolve(response.body);
            }
        })
    });
}

async function updateDb(dbname, aliasArray) {
    try {
        const aliasDb = await createDbConnection(dbname);
        await aliasDb.exec('CREATE TABLE IF NOT EXISTS alias (id TEXT PRIMARY KEY, alias TEXT);')
        await aliasDb.exec('DELETE FROM alias;')

        const stmt = await aliasDb.prepare('insert into alias(id, alias) values(?, ?)')
        for (let i = 0; i < aliasArray.length; ++i) {
            await stmt.run(aliasArray[i]);
        }
        await stmt.finalize();

        const row = await aliasDb.all('SELECT * from alias;');
        await aliasDb.close();
        return row;
    } catch (error) {
        logger.error(`Sqlite error Message: ${error.message}`);
        return [];
    }
}

async function getDbValue(dbname){
    try {
        const aliasDb = await createDbConnection(dbname);
        const row = await aliasDb.all('SELECT * from alias;');
        await aliasDb.close();
        return row;
    } catch (error) {
        logger.error(`Sqlite error Message: ${error.message}`);
        return [];
    }
}

function createDbConnection(filename) {
    return open({
        filename,
        driver: sqlite3.Database
    });
}
