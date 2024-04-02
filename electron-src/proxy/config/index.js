const yaml = require('js-yaml');
const fs = require('fs');
const logger = require('electron-log');


function loadConfig() {
  const dnsConfig = loadDnsConfig();
  return Object.assign({}, dnsConfig);
}

function loadDnsConfig() {
  try {
    const config = yaml.load(fs.readFileSync(__dirname + '/dns.yml', 'utf8'));
    return config;
  } catch (e) {
    logger.fatal(`load dns config failed, ${e.message}`);
    throw e;
  }
}

module.exports = loadConfig();
