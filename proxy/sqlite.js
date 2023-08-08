const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();
const logger = require('./logger').getLogger('Node-heliumos-proxy-sqlite');

let DB = {};

DB.SqliteDB = function (file) {
    DB.db = new sqlite3.Database(file);
    DB.exist = fs.existsSync(file);
    if (!DB.exist) {
        fs.openSync(file, 'w');
    };
};

DB.printErrorInfo = function (err) {
    logger.error(`Sqlite error Message: ${err.message}, ErrorNumber: ${err}`);
};

DB.SqliteDB.prototype.createTable = function (sql) {
    DB.db.serialize(function () {
        DB.db.run(sql, function (err) {
            if (null != err) {
                DB.printErrorInfo(err);
                return;
            }
        });
    });
};

DB.SqliteDB.prototype.insertData = function (sql, objects) {
    DB.db.serialize(function () {
        var stmt = DB.db.prepare(sql);
        for (var i = 0; i < objects.length; ++i) {
            stmt.run(objects[i]);
        }
        stmt.finalize();
    });
};

DB.SqliteDB.prototype.queryData = function (sql, callback) {
    DB.db.all(sql, function (err, rows) {
        if (null != err) {
            DB.printErrorInfo(err);
            return;
        }

        if (callback) {
            callback(rows);
        }
    });
};

DB.SqliteDB.prototype.executeSql = function (sql) {
    DB.db.run(sql, function (err) {
        if (null != err) {
            DB.printErrorInfo(err);
        }
    });
};

DB.SqliteDB.prototype.close = function () {
    DB.db.close();
};

exports.SqliteDB = DB.SqliteDB;
