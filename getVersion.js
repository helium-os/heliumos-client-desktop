var pjson = require('./package.json');
var {setDataSourse}=require('./util/util')

console.log(pjson.version);
setDataSourse(pjson.version,'./version',false)