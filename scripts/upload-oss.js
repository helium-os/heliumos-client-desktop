const OSS = require('ali-oss');
const path = require('path');
const fs = require('fs');
const semver = require('semver');

const BUILD_OUT_DIR = 'dist';
const LATEST_IDENTIFY = 'latest';
const ALI_OSS_RELEASE_PATH = process.env.ALI_OSS_RELEASE_PATH;
const VERSION = process.env.VERSION;
const VERSION_TAG = 'v' + VERSION;

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

// 将字符串中的反斜杠的目录分隔符，替换为正斜杠（默认）
function replaceDelimiter(p = '', delimiter = '/') {
  return p?.replace(/\\/g, delimiter);
}

// 阿里云 OSS 使用正斜杠作为目录分隔符
function aliOSSPathJoin(...paths) {
  return replaceDelimiter(path.join(...paths));
}

// 检查是否时安全的 GitHub 文件名称
// https://github.com/github/rest-api-description/issues/2968
function isSafeGithubName(name = '') {
  return /^[0-9A-Za-z._-]+$/.test(name);
}

// 为构建产物文件计算安全的文件名称，如果给定的文件名不安全的时候
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

// 生成以 latest 为版本号的安装包文件名称
function generateLatestInstallerNameIfMatch(fileName = '') {
  // artifactName => "${productName}-${version}-${arch}-${os}.${ext}"
  // ${version} 1.2.3 (preid? beta-sde31d3.0)
  // ${arch}: x64|arm64|x86_64|ia32|armv7l ${os}: mac|win|linux ${ext}: dmg|exe|AppImage
  const regexp =
    /^([\w]+)-([0-9]+\.[0-9]+\.[0-9]+)-([\w\.-]+-)?(x64|arm64|x86_64|ia32|armv7l)-(mac|win|linux)\.([(dmg|exe|AppImage)]+)$/;
  if (!fileName || !regexp.test(fileName)) {
    return null;
  }

  return fileName.replace(regexp, function (_, productName, _version, _preid, arch, os, ext) {
    console.log(
      `Generate Latest Installer Name If Match, arguments: _=${_} productName=${productName} _version=${_version} _preid=${_preid} arch=${arch} os=${os} ext=${ext}`,
    );

    return `${productName}-${LATEST_IDENTIFY}-${arch}-${os}.${ext}`;
  });
}

// 递归遍历目录并上传文件
async function uploadFiles(source, target) {
  console.log(`From: ${source}, \nTo: ${target}`);

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
        const targetPath = aliOSSPathJoin(target, fileName);
        const uploadRes = await client.multipartUpload(targetPath, filePath, {
          headers,
          progress: function (p) {
            console.log(`Uploading ${fileName}: ${Math.round(p * 100)}%`);
          },
        });
        const uploadOK = uploadRes?.res?.statusCode === 200;
        console.log(`${uploadOK ? 'Uploaded' : 'Failed'}: targetPath=${fileName} filePath=${filePath} file=${file}`);

        // 创建软链接
        const symlinkPath = aliOSSPathJoin(ALI_OSS_RELEASE_PATH, fileName);
        const symlinkRes = await client.putSymlink(symlinkPath, targetPath);
        const symlinkOK = symlinkRes?.res.statusCode === 200;
        console.log(
          `${symlinkOK ? 'Created' : 'Failed'}: symlinkPath=${symlinkPath} targetPath=${targetPath} file=${file}`,
        );

        // 创建/更新 latest 软链接
        // 为不同操作系统的安装包创建版本 version='latest' 的软链接，以确保官网上的下载链接始终指向最新的文件
        const latestFileName = generateLatestInstallerNameIfMatch(fileName);
        if (latestFileName) {
          const latestSymlinkPath = aliOSSPathJoin(ALI_OSS_RELEASE_PATH, latestFileName);
          const latestSymlinkRes = await client.putSymlink(latestSymlinkPath, targetPath);
          const latestSymlinkOK = latestSymlinkRes?.res.statusCode === 200;
          console.log(
            `${
              latestSymlinkOK ? 'Updated' : 'Failed'
            }: symlinkPath=${latestSymlinkPath} targetPath=${targetPath} file=${file}`,
          );
        }

        const statusOK = uploadOK && symlinkOK;
        console.log(
          `${statusOK ? 'Uploaded' : 'Failed'}: fileName=${fileName} file=${file}`,
          `${!statusOK ? `uploadOK=${uploadOK}, symlinkOK=${symlinkOK}` : ``}`,
        );
        return statusOK;
      } catch (e) {
        // 不覆盖文件
        console.log('[ERROR]: Upload Failed', e);
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

// 提取产物名称中的版本号
function extractVersionFromArtifactName(name) {
  // HeliumOS-1.2.12-beta.1-arm64-mac.dmg.blockmap
  // artifactName => "${productName}-${version}-${arch}-${os}.${ext}"
  // G1: ${productName} => HeliumOS
  // G2: ${version} => (1.2.12)-?(beta.1)?
  // G3: ${version} no preid => 1.2.3
  // G4: ${version} preid => beta.1, beta-sde31d3.0
  // G5: ${arch} => x64|arm64|x86_64|ia32|armv7l
  // G6: ${os} => mac|win|linux
  // G7: ${ext} => dmg.blockmap, (dmg|exe|AppImage|zip)\.?(blockmap)?
  // G8: ${ext} prefix => dmg, G9: ${ext} suffix => blockmap
  const regexp =
    /^([\w]+)-(([\d]+\.[\d]+\.[\d]+)-?([\w\.-]+)?)-(x64|arm64|x86_64|ia32|armv7l)-(mac|win|linux)\.((dmg|exe|AppImage|zip)\.?(blockmap)?)$/;
  // 使用正则匹配构建产物名称
  const matchRet = name.match(regexp);

  // 准备预过滤版本号
  let inputVersion = '';
  if (matchRet) {
    inputVersion = `${matchRet[2]}`;
  } else {
    // 正则没匹配到版本号时，将产物名称作为预过滤版本号，等待强制提取
    console.log(`[INFO]: Regexp match null, try to force extract version from fileName=${name}`);
    inputVersion = name;
  }

  // 过滤版本号，确保版本号符合规范
  // https://github.com/npm/node-semver?tab=readme-ov-file#coercion
  const semverVal = semver.coerce(inputVersion, {
    includePrerelease: true,
  });
  const outputVersion = semverVal.raw;
  console.log(`${inputVersion} => ${outputVersion}`);

  return outputVersion;
}

// 经过比较后批量删除过时版本的软链接（除当前版本外，保留最近一个版本的软链接）
async function deleteOutdatedSymlinks(prefix) {
  // 不带任何参数，默认最多返回100个文件。
  try {
    // 列出目录下的文件
    const result = await client.listV2({
      prefix: prefix,
      delimiter: '/',
    });
    // 列出软链接文件名称
    const symlinkNames = result?.objects
      ?.filter((obj) => {
        return obj.type === 'Symlink' && obj.name.indexOf(LATEST_IDENTIFY) === -1;
      })
      .map((obj) => obj.name.replace(prefix, ''));

    if (symlinkNames && symlinkNames.length) {
      // 按文件名中的版本号进行分组
      const nameGroupByVersion = {};
      symlinkNames.forEach((name) => {
        const outputVersion = extractVersionFromArtifactName(name);

        if (!nameGroupByVersion[outputVersion]) {
          nameGroupByVersion[outputVersion] = [];
        }
        nameGroupByVersion[outputVersion].push(name);
      });

      // 找到历史版本中相对最新的版本号
      const sortedVersions = Object.keys(nameGroupByVersion).sort((a, b) => (semver.lt(a, b) ? 1 : -1));
      const previousVersion = sortedVersions[0];
      console.log(`currentVersion=${VERSION}, previousVersion=${previousVersion}`, sortedVersions);

      // 检查是否有过时版本的软链接
      const oldVersions = Object.keys(nameGroupByVersion);
      if (previousVersion === VERSION || oldVersions?.length <= 1) {
        console.log(
          `[INFO]: Skip delete, because no outdated version symlink files in ${prefix} directory`,
          `, previousVersion=${oldVersions?.[0] || ''}`,
        );
        return null;
      }

      // 除当前版本外，保留最近一个版本的软链接
      delete nameGroupByVersion[VERSION];
      delete nameGroupByVersion[previousVersion];
      console.log('nameGroupByOutdatedVersion', nameGroupByVersion);

      // 组装远程文件路径
      const willDeleteFileNames = Object.keys(nameGroupByVersion).reduce((ret, v) => {
        const names = nameGroupByVersion[v];
        const namesWithPrefix = names.map((name) => aliOSSPathJoin(prefix, name));
        return [].concat(ret, namesWithPrefix);
      }, []);
      console.log('willDeleteFileNames', willDeleteFileNames);
      // 批量删除其余旧版本的软链接
      const deleteRes = await client.deleteMulti(willDeleteFileNames, { quiet: true });
      console.log('deleteRes', deleteRes);

      const deleteOK = deleteRes?.res?.statusCode === 200;
      console.log(`${deleteOK ? 'All outdated symlink deleted.' : 'Outdated symlink delete failed.'}`);
    } else {
      console.log(`[INFO]: No match symlink files in ${prefix} directory`);
    }
  } catch (e) {
    console.log(`[ERROR]: Delete outdated symlinks failed`, e);
  }
}

async function start() {
  const pathPrefix = aliOSSPathJoin(ALI_OSS_RELEASE_PATH, '/');
  // 执行删除过时软链接操作
  await deleteOutdatedSymlinks(pathPrefix);

  const sourcePath = path.join(process.cwd(), BUILD_OUT_DIR);
  const targetPath = aliOSSPathJoin(ALI_OSS_RELEASE_PATH, VERSION_TAG);
  // 执行并发上传操作
  uploadFiles(sourcePath, targetPath).catch((error) => {
    console.log('UploadFiles error:', error);
  });
}

start();
