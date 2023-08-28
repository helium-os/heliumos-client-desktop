const log4js = require('log4js');

log4js.configure({
    appenders: {
        file: { type: 'file', filename: '/tmp/proxy-logs.log' },
        console: {type: 'console'}
    },
    categories: {
        default: { appenders: [ 'file' ], level: 'info' }
    }
});

module.exports = log4js;
