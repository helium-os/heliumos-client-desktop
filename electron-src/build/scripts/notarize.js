// require('dotenv').config();
const { notarize } = require('@electron/notarize');

exports.default = async function notarizing(context) {
  console.log("APPLE_ID: ", process.env.APPLE_ID)
  console.log("APPLE_ID_PASSWORD: ", process.env.APPLE_ID_PASSWORD)
  console.log("APPLE_TEAM_ID: ", process.env.APPLE_TEAM_ID)
  
  const { electronPlatformName, appOutDir } = context;  
  if (electronPlatformName !== 'darwin') {
    return;
  }

  const appName = context.packager.appInfo.productFilename;

  // Package your app here, and code sign with hardened runtime
  // https://github.com/electron/notarize?tab=readme-ov-file#api
  return await notarize({
    appPath: `${appOutDir}/${appName}.app`,
    appleId: process.env.APPLE_ID,
    appleIdPassword: process.env.APPLE_ID_PASSWORD,
    teamId: process.env.APPLE_TEAM_ID,
  });
};
