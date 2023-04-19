#!/bin/bash
version=`cat version`
sed -e "s/VERSION/${version}/" version.template.js > version.js
PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
npm install npm@8.15.0 -g
npm config set electron_mirror "https://npm.taobao.org/mirrors/electron/"
npm install --registry=https://registry.npm.taobao.org/
npm run dist
sed -e "s/VERSION/${version}/" version.template.json > dist/version.json
