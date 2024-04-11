const OSS = require('ali-oss');
const path = require('path');
const fs = require('fs');

const BUILD_OUT_DIR = 'dist';
const ALI_OSS_RELEASE_PATH = process.env.ALI_OSS_RELEASE_PATH;
const VERSION_TAG = 'v' + process.env.VERSION;

const SOURCE_PATH = path.join(process.cwd(), BUILD_OUT_DIR);
const TARGET_PATH = path.join(ALI_OSS_RELEASE_PATH, VERSION_TAG);

const client = new OSS({
  // region: process.env.ALI_OSS_REGION,
  accessKeyId: process.env.ALI_OSS_ACCESS_KEY_ID,
  accessKeySecret: process.env.ALI_OSS_ACCESS_KEY_SECRET,
  bucket: process.env.ALI_OSS_BUCKET,
  endpoint: process.env.ALI_OSS_ENDPOINT,
});

const headers = {
  // 指定PutObject操作时是否覆盖同名目标Object。此处设置为true，表示禁止覆盖同名Object。
  'x-oss-forbid-overwrite': 'true',
};

// 将 Windows 下的反斜杠的目录分隔符，替换为正斜杠
function replaceToForwardSlash(p = '') {
  return p?.replace(/\\/g, '/');
}

// 递归遍历目录并上传文件
async function uploadFiles(source, target) {
  console.log('From: ', source);
  console.log('To: ', target, replaceToForwardSlash(target));

  const files = fs.readdirSync(source);
  const uploadPromises = files.map(async (file) => {
    const filePath = path.join(source, file);
    const stat = fs.statSync(filePath);
    if (stat.isFile()) {
      try {
        // 上传文件
        const targetPath = replaceToForwardSlash(path.join(target, file));
        const uploadRes = await client.multipartUpload(targetPath, filePath, {
          headers,
          progress: function (p) {
            console.log(`Uploading ${file}: ${Math.round(p * 100)}%`);
          },
        });
        const symlinkPath = replaceToForwardSlash(path.join(ALI_OSS_RELEASE_PATH, file));
        const symlinkRes = await client.putSymlink(symlinkPath, targetPath);

        const uploadOK = uploadRes?.res?.statusCode === 200;
        const symlinkOK = symlinkRes?.res.statusCode === 200;
        const statusOK = uploadOK && symlinkOK;
        console.log(`uploadOK=${uploadOK} symlinkOK=${symlinkOK}`);
        console.log(`${statusOK ? 'Uploaded' : 'Failed'}: ${file}`);
        return statusOK;
      } catch (e) {
        // 不覆盖文件
        console.log('[DEBUG]: Upload Failed', e);
        const isFileAlreadyExists = String(e?.code) === 'FileAlreadyExists';
        console.log(`${String(e?.code || '')}: `, file);
        return isFileAlreadyExists ? true : false;
      }
    } else {
      // 忽略文件夹
      console.log(`Skip folder: ${file}`);
      return true;
    }
  });

  // 并发上传所有文件
  const results = await Promise.all(uploadPromises);
  const successfully = results.every((result) => !!result);

  if (!successfully) {
    console.log('results', results);
    console.log('Some files upload failed.');
  } else {
    console.log('All files uploaded.');
  }
}

// 执行并发上传操作
uploadFiles(SOURCE_PATH, TARGET_PATH).catch((error) => {
  console.log('UploadFiles error:', error);
});
