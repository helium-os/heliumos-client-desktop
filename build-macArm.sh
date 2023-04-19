#!/bin/bash
npm run version
version=`cat version`
sed -e "s/VERSION/${version}/" version.template.js > version.js
PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
npm run dist-macArm
sed -e "s/VERSION/${version}/" version.template.json > dist/version.json
