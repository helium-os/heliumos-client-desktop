// require('dotenv').config();
const { notarize } = require('@electron/notarize');

// Required code signing(env: CSC_LINK,CSC_KEY_PASSWORD) before notarization
// https://www.electron.build/code-signing
exports.default = async function notarizing(context) {
  const { electronPlatformName, appOutDir } = context;
  if (electronPlatformName !== 'darwin' && process.env.SIGN_AND_NOTARIZE === 'false') {
    return;
  }

  const appName = context.packager.appInfo.productFilename;

  // Package your app here, and code sign with hardened runtime
  // https://github.com/electron/notarize?tab=readme-ov-file#api
  return await notarize({
    appPath: `${appOutDir}/${appName}.app`,
    // Option 1: Using an app-specific password
    // appleId: process.env.APPLE_ID,
    // appleIdPassword: process.env.APPLE_ID_PASSWORD,
    // teamId: process.env.APPLE_TEAM_ID,

    // Option 2: Using an App Store Connect API key
    appleApiKey: process.env.APPLE_API_KEY,
    appleApiKeyId: process.env.APPLE_API_KEY_ID,
    appleApiIssuer: process.env.APPLE_API_ISSUER,

    // Option 3: Using a keychain
    // keychain: process.env.HOS_KETCHAIN, // optional
    // keychainProfile: process.env.HOS_KEYCHAIN_PROFILE
  });
};
