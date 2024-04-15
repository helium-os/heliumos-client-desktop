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

const ignoreFiles = ['builder-debug.yml'];

// TODO: 保留最近两个版本软链接 +-
// TODO: 为不同操作系统的安装包创建版本 version=latest 的软链接，以确保官网上的下载链接始终指向最新的文件 ++

// 将 Windows 下的反斜杠的目录分隔符，替换为正斜杠
function replaceToForwardSlash(p = '') {
  return p?.replace(/\\/g, '/');
}

// // https://github.com/github/rest-api-description/issues/2968
function isSafeGithubName(name = '') {
  return /^[0-9A-Za-z._-]+$/.test(name);
}

function computeSafeArtifactNameIfNeeded(suggestedName = '', safeNameProducer = () => '') {
  // GitHub only allows the listed characters in file names.
  if (!!suggestedName) {
    if (isSafeGithubName(suggestedName)) {
      return null;
    }

    // prefer to use suggested name - so, if space is the only problem, just replace only space to dash
    suggestedName = suggestedName.replace(/ /g, '-');
    if (isSafeGithubName(suggestedName)) {
      return suggestedName;
    }
  }

  return safeNameProducer();
}

// 递归遍历目录并上传文件
async function uploadFiles(source, target) {
  console.log(`From: ${source}, \nTo: ${target} format=${replaceToForwardSlash(target)}`);

  const files = fs.readdirSync(source);
  const uploadPromises = files.map(async (file) => {
    const filePath = path.join(source, file);
    const fileName = computeSafeArtifactNameIfNeeded(file) || file;
    const stat = fs.statSync(filePath);
    if (stat.isFile()) {
      if (ignoreFiles.includes(file)) {
        // 忽略文件
        console.log(`Skip file: ${file}`);
        return true;
      }
      try {
        // 上传文件
        const targetPath = replaceToForwardSlash(path.join(target, fileName));
        const uploadRes = await client.multipartUpload(targetPath, filePath, {
          headers,
          progress: function (p) {
            console.log(`Uploading ${fileName}: ${Math.round(p * 100)}%`);
          },
        });
        const symlinkPath = replaceToForwardSlash(path.join(ALI_OSS_RELEASE_PATH, fileName));
        const symlinkRes = await client.putSymlink(symlinkPath, targetPath);

        const uploadOK = uploadRes?.res?.statusCode === 200;
        const symlinkOK = symlinkRes?.res.statusCode === 200;
        const statusOK = uploadOK && symlinkOK;
        console.log(
          `${statusOK ? 'Uploaded' : 'Failed'}: fileName=${fileName} file=${file}`,
          `${!statusOK ? `uploadOK=${uploadOK}, symlinkOK=${symlinkOK}` : ``}`,
        );
        return statusOK;
      } catch (e) {
        // 不覆盖文件
        console.log('[DEBUG]: Upload Failed', e);
        const isFileAlreadyExists = String(e?.code) === 'FileAlreadyExists';
        console.log(`${String(e?.code || '')}: `, fileName);
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
