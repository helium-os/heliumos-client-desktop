const request = require('request');
const SqliteDB = require('./sqlite.js').SqliteDB;
const logger = require('./logger').getLogger('Node-heliumos-proxy-utils');


process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

module.exports = {
    getUrl: getUrl,
    updateDb: updateDb
};

async function getUrl(url, proxy, host, ip) {
    return new Promise((resolve, reject) => {
        let options = {
            'method': 'GET',
            'url': url,
            'proxy': proxy
        };
        if (host != null) {
            options = {
                'method': 'GET',
                'url': url,
                'proxy': proxy,
                'hostname': ip,
                'headers': {
                    'Host': host
                }
            };
        };
        request(options, function (error, response) {
            if (error) {
                logger.error(`http get error: ${error}, url: ${url}`);
            } else {
                resolve(response.body);
            }
        })
    });
}


function updateDb(dbname, aliasArray) {
    const sqliteDB = new SqliteDB(dbname);
    const createTableSql = "CREATE TABLE IF NOT EXISTS alias (id TEXT PRIMARY KEY, alias TEXT);";
    sqliteDB.createTable(createTableSql);

    const dropTableSql = "delete from alias;";
    sqliteDB.executeSql(dropTableSql);

    const insertSql = "insert into alias(id, alias) values(?, ?)";
    sqliteDB.insertData(insertSql, aliasArray);


    // sqliteDB.queryData("select * from alias", function (objects) {
    //     for(let i = 0; i < objects.length; ++i){
    //         console.log(objects[i]);
    //     }
    // });

    sqliteDB.close()
}
