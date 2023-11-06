const request = require('request');
const logger = require('electron-log');
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const fs = require('fs');
const { app } = require("electron");
const path = require("path");

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
            options.ca = '-----BEGIN CERTIFICATE-----\n' +
                'MIICQDCCAeWgAwIBAgIQZ10HUuF4FfLZMiPKd1NLojAKBggqhkjOPQQDAjBqMQsw\n' +
                'CQYDVQQGEwJDTjEQMA4GA1UECBMHQmVpamluZzEQMA4GA1UEBxMHQmVpamluZzER\n' +
                'MA8GA1UEChMIaGVsaXVtb3MxETAPBgNVBAsTCGhlbGl1bW9zMREwDwYDVQQDEwho\n' +
                'ZWxpdW1vczAeFw0yMzA4MjgxMDE1MDBaFw00MzA4MjMxMDE1MDBaMGoxCzAJBgNV\n' +
                'BAYTAkNOMRAwDgYDVQQIEwdCZWlqaW5nMRAwDgYDVQQHEwdCZWlqaW5nMREwDwYD\n' +
                'VQQKEwhoZWxpdW1vczERMA8GA1UECxMIaGVsaXVtb3MxETAPBgNVBAMTCGhlbGl1\n' +
                'bW9zMFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAE3fjGc4MqN6E02b9Wd7ZTV6je\n' +
                'vsRXOpUOK5WaI1ls/TVJMu3dszJC1ibQ7dkg/4+mOt9x+v99/Td7kShO2xYlG6Nt\n' +
                'MGswDgYDVR0PAQH/BAQDAgGmMB0GA1UdJQQWMBQGCCsGAQUFBwMCBggrBgEFBQcD\n' +
                'ATAPBgNVHRMBAf8EBTADAQH/MCkGA1UdDgQiBCBCIIS6gbzeQXmXVQHoOJvvXfst\n' +
                'MKCFy3m1gFNfF1PdXjAKBggqhkjOPQQDAgNJADBGAiEAsvREvvd1rYxcNF8YpR44\n' +
                'fTgOLTBHbN41BOTXlsFi0qkCIQCVJ9r4AtiMmwhMogkuGWcORG65EMcKLczIyveo\n' +
                'DUMPzQ==\n' +
                '-----END CERTIFICATE-----';
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

async function getDbValue(dbname) {
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
    const userDataPath = app.getPath('userData');
    const filePath = path.join(userDataPath, filename);
    return open({
        filename: filePath,
        driver: sqlite3.Database
    });
}
