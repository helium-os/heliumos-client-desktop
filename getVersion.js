var pjson = require('./package.json');
var { setDataSourse } = require('./electron-src/util/util');

console.log(pjson.version);
setDataSourse(pjson.version, './version', false);
