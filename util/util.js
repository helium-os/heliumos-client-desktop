const fs = require('fs')
const dirCache={};
const CryptoJS = require("crypto-js");

let keystr = "JIANXINGZHEPSVMC";

// 字符串转hex
let string_to_hex = function(str) {
  let tempstr = "";
  for (let i = 0; i < str.length; i++) {
    if (tempstr === "") tempstr = str.charCodeAt(i).toString(16);
    else tempstr += str.charCodeAt(i).toString(16);
  }
  return tempstr;
};
//加密
const encryption = (value) => {
        let key = CryptoJS.enc.Utf8.parse(keystr);
        let iv = CryptoJS.enc.Utf8.parse(keystr.substr(0, 16)); // 偏移量：规定的是key前15位
        let srcs = CryptoJS.enc.Utf8.parse(value);
        let encrypted = CryptoJS.AES.encrypt(srcs, key, {
          iv: iv,
          mode: CryptoJS.mode.ECB,
          padding: CryptoJS.pad.Pkcs7,
        });
        return CryptoJS.enc.Base64.stringify(encrypted.ciphertext);
    }


//解密
const decryption = (value) => {
    const key = CryptoJS.enc.Utf8.parse(keystr);
    let iv = CryptoJS.enc.Utf8.parse(keystr.substr(0, 16));
    const decrypt = CryptoJS.AES.decrypt(value, key, { iv: iv, mode: CryptoJS.mode.ECB, padding: CryptoJS.pad.Pkcs7 });
    return CryptoJS.enc.Utf8.stringify(decrypt).toString();
  }

//读取数据
getDataSourse = (filePath='./data.json') => {
  let content = ""

 if (fs.existsSync(filePath)) {
   content=fs.readFileSync(filePath, {
    encoding: "utf-8"
  });
}


return content?JSON.parse(decryption(content)):{}
}
//存入数据
 setDataSourse=(data,filePath='./data.json',en=true)=>{

   if (!fs.existsSync(filePath)) {
        writeFileByUser(filePath)
    }
  
  fs.writeFileSync(
    filePath,
   en?encryption(JSON.stringify(data)):data, {
      encoding: "utf-8"
    }
  );
}
//
function writeFileByUser(filePath){
   mkdir(filePath);
   fs.appendFile(filePath,'','utf8',function(err){  
        if(err)  {  
            console.log(err);  
        } else {
            console.log('appendFile')
        }
    })
}

function mkdir(filePath) {
    const arr=filePath.split('/');
    let dir=arr[0];
    for(let i=1;i<arr.length;i++){
        if(!dirCache[dir]&&!fs.existsSync(dir)){
            dirCache[dir]=true;
            fs.mkdirSync(dir);
        }
        dir=dir+'/'+arr[i];
    }
    fs.writeFileSync(filePath, '')
}










module.exports = {
  getDataSourse,
  setDataSourse
};