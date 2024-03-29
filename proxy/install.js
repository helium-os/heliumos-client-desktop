const crypto = require('crypto');
const yaml = require('js-yaml');
const util = require('util');
const exec = util.promisify(require('child_process').exec);
const fs = require('fs');
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const { app } = require("electron");
const logger = require('electron-log');
const path = require("path");
const fixPath  = require('fix-path');

module.exports = {
    getBinaryPath,
    getBinaryVersion,
    getDefaultKubeConfig,
    getClusterConfig,
    installHeliumos,
    getInstallStatus,
    installSuccess,
    getIpMap,
};

const chartRepo = 'https://easypayx-helm.pkg.coding.net/heliumos/charts';
const orgsDb = 'orgsdb';
const userDataPath = app.getPath('userData');

const deploymentList = [
    'api-server',
    'deployer',
    'internal-dns',
    'heliumos-grafana',
    'heliumos-proxy',
    'postgres',
    'pulsar-zookeeper',
    'pulsar-bookie',
    'couchdb',
    'heliumos-vault-ldq0001-agent-injector',
    'vault-manager',
    'pulsar-manager',
    'postgres-manager',
    'external-dns-manager',
    'couchdb-manager',
    'pulsar-broker',
    'resource-manager',
    'external-dns',
    'transaction-agent',
    'app-manager',
    'app-store',
    'file--file--system',
    'keycloak--user--system',
    'user--user--system',
    'org-desktop--org-desktop--system',
    'matrix--matrix--system',
    'consortium-desktop--consortium-desktop--system',
    'chat-desktop--chat-desktop--system',
    'desktop--desktop--system',
    'file-desktop--file-desktop--system',
    'ipfs--ipfs--system'
]

let kubectlPath = "kubectl";
let helmPath = "helm";


//检测helm kubectl 安装路径
async function getBinaryPath(binaryName) {
    fixPath();
    let command = 'which ';
    if (process.platform === "win32") {
        command = 'where ';
    }
    command += binaryName;
    try {
        let { stdout } = await exec(command);
        stdout = stdout.split('\n')[0];
        stdout = stdout.replace(/[\r\n]/g, "");
        return { path: stdout };
    } catch (err) {
        logger.error(`getBinaryPath exception: ${err}`);
        return { path: '' };
    }
}

//返回helm kubectl 版本号
async function getBinaryVersion(path, binaryName) {
    let command = `"` + path + `"`;
    try {
        if (binaryName === 'kubectl') {
            command += ' version --client=true --output=yaml';
            const result = await exec(command);
            const version = yaml.load(result.stdout).clientVersion.gitVersion.substring(1);
            const versionSplit = version.split('.');
            kubectlPath = `"` + path + `"`;
            return { version: version, pass: versionSplit[0] >= 1 && versionSplit[1] >= 20 ? true : false };
        } else if (binaryName === 'helm') {
            command += ` version --template="Version: {{.Version}}"`;
            const result = await exec(command);
            const version = result.stdout.split(' ')[1].substring(1);
            const versionSplit = version.split('.');
            helmPath = `"` + path + `"`;
            return { version: version, pass: versionSplit[0] >= 3 ? true : false };
        } else {
            return { version: '', pass: false };
        }
    } catch (err) {
        logger.error(`getBinaryVersion exception: ${err.message}`);
        return { version: '', pass: false };
    }
}

//获取默认kube配置
async function getDefaultKubeConfig() {
    try {
        const currentDirectory = process.env.HOME || process.env.USERPROFILE;
        logger.info(`currentDirectory: ${currentDirectory}`);
        let filePath = path.join(currentDirectory, ".kube/config");
        const data = fs.readFileSync(filePath, { encoding: 'utf8', flag: 'r' });
        return data;
    } catch (err) {
        return "";
    }
}

//通过kubeConfig获取集群配置,生成OrgId
async function getClusterConfig(kubeConfig) {
    let config = {};
    config.nodes = [];
    config.storageClasses = [];
    config.expose = ['loadBalancer'];
    config.serverVersion = { value: "", pass: false };
    config.component = { value: 'coreDNS', pass: false };
    config.serverIp = { value: "", pass: false };


    config.baseConfig = {
        storage: {
            apiServer: '1',
            couchdb: '100',
            postgres: '100',
            pulsarBookie: '100',
            pulsarZookeeper: '20',
            vaultManager: '10',
            vault: '10',
            signCa: '1',
            orderer: '100',
            peer: '100',
            deployer: '1',
            loki: '300',
            externalDns: '10',
            internalDns: '10',
            postgresC: '100',
        },
    };

    config.oamConfig = {
        storage: {
            'synapse-pvc': '1',
            'ipfs-config-pvc': '1',
            'ipfs-pvc': '100',
        },
    };
    const shasum = crypto.createHash('sha256');
    shasum.update(kubeConfig, 'utf-8');
    const hexStr = shasum.digest('hex');
    let final = /[^\d]/.exec(hexStr);
    config.orgId = hexStr.substr(final.index, 10);

    const yamlConfig = yaml.load(kubeConfig);
    let filePath = path.join(userDataPath, config.orgId);
    fs.writeFileSync(filePath, kubeConfig);
    filePath = `"` + filePath + `"`;


    for (const cluster of yamlConfig.clusters) {
        config.serverIp = { value: cluster.cluster.server.split(':')[1].replace(/\//g, ''), pass: true };
    }

    try {
        //k8s version
        let result = await exec(kubectlPath + ' version --output=yaml --kubeconfig=' + filePath);
        const version = yaml.load(result.stdout).serverVersion.gitVersion.substring(1);
        const versionSplit = version.split('.');
        config.serverVersion = { value: version, pass: versionSplit[0] >= 1 && versionSplit[1] >= 20 ? true : false };

        //nodes
        result = await exec(kubectlPath + ' get nodes --output=yaml --kubeconfig=' + filePath);
        for (const node of yaml.load(result.stdout).items) {
            let memory = node.status.capacity.memory.replace('Ki', '');
            memory = Math.ceil(memory / (1000 * 1000));
            config.nodes.push({
                name: { value: node.metadata.name, pass: true },
                cpu: { value: node.status.capacity.cpu, pass: node.status.capacity.cpu >= 4 ? true : false },
                memory: { value: memory + 'G', pass: memory >= 8 ? true : false },
            });
        }

        //storage classes
        result = await exec(kubectlPath + ' get sc --output=yaml --kubeconfig=' + filePath);
        for (const sc of yaml.load(result.stdout).items) {
            config.storageClasses.push(sc.metadata.name);
        }

        //coreDNS
        result = await exec(kubectlPath + ' get pods --namespace="kube-system" --output=yaml --kubeconfig=' + filePath);
        for (const pod of yaml.load(result.stdout).items) {
            if (pod.metadata.name.indexOf('coredns') >= 0) {
                config.component = { value: 'coreDNS', pass: true };
                break;
            }
        }
    } catch (err) {
        logger.error(`getClusterConfig exception: ${err.message}`);
    }
    return config;
}

//安装Heliumos
async function installHeliumos(installConfig) {
    let config = {};
    config.Environment = '';
    config.chartRepo = chartRepo;
    config.expose = {};
    config.expose.type = installConfig.expose;
    config.adminPw = Buffer.from(installConfig.adminPw, 'utf8').toString('hex');
    config.orgId = installConfig.orgId;
    config.storageClass = installConfig.storageClass;
    config.storageSize = {
        apiServer: installConfig.baseConfig.storage.apiServer + 'Gi',
        deployer: installConfig.baseConfig.storage.deployer + 'Gi',
    };

    config.baseConfig = { storage: {} };
    config.oamConfig = { storage: {} };

    for (let key in installConfig.baseConfig.storage) {
        if (installConfig.baseConfig.storage.hasOwnProperty(key)) {
            config.baseConfig.storage[key] = installConfig.baseConfig.storage[key] + 'Gi';
        }
    }

    for (let key in installConfig.oamConfig.storage) {
        if (installConfig.oamConfig.storage.hasOwnProperty(key)) {
            config.oamConfig.storage[key] = installConfig.oamConfig.storage[key] + 'Gi';
        }
    }

    config.baseConfig = Buffer.from(JSON.stringify(config.baseConfig, null, 2), 'utf8').toString('hex');
    config.oamConfig = Buffer.from(JSON.stringify(config.oamConfig, null, 2), 'utf8').toString('hex');


    let configFilePath = path.join(userDataPath, "config.yaml");
    fs.writeFileSync(configFilePath, JSON.stringify(config, null, 2));
    configFilePath = `"` + configFilePath + `"`;

    try {
        let filePath = path.join(userDataPath, config.orgId);
        filePath = `"` + filePath + `"`;
        const result = await exec(kubectlPath + ' get ns --output=yaml --kubeconfig=' + filePath);
        let nsFlag = false;
        for (const ns of yaml.load(result.stdout).items) {
            if (config.orgId === ns.metadata.name) {
                nsFlag = true;
                break;
            }
        }

        if (!nsFlag) {
            const result = await exec(kubectlPath + ' create ns ' + config.orgId + ' --output=yaml --kubeconfig=' + filePath);
        }

        const list = await exec(helmPath + ' repo list --output=yaml');

        let repoFlag = false;
        for (const repo of yaml.load(list.stdout)) {
            if (repo.name == 'heliumos') {
                repoFlag = true;
                break;
            }
        }
        if (!repoFlag) {
            await exec(helmPath + ' repo add heliumos ' + chartRepo);
        }
        await exec(helmPath + ' repo update');
        await exec(
            helmPath + ' install -f ' +
            configFilePath +
            ' heliumos-operator heliumos/heliumos-operator -n ' +
            config.orgId +
            ' --kubeconfig=' +
            filePath
        );
        return config.orgId;
    } catch (err) {
        logger.error(`installHeliumos exception: ${err.message}`);
        return "";
    }
}

//获取安装状态
async function getInstallStatus(orgId) {
    let filePath = path.join(userDataPath, orgId);
    filePath = `"` + filePath + `"`;

    let deployments = [];
    let deploymentNameList = [];
    let percent = 0;

    try {
        const result = await exec(
            kubectlPath + ' get deployment -n ' +
            orgId +
            ' --output=yaml --kubeconfig=' +
            filePath
        );
        let availableCount = 0;
        for (const deployment of yaml.load(result.stdout).items) {
            for (const status of deployment.status.conditions) {
                if (status.type === "Available") {
                    if (status.status === "True") {
                        availableCount ++;
                    }
                    deployments.push({name: deployment.metadata.name, status: status.status === "True"? "Available":"Unavailable"});
                    deploymentNameList.push(deployment.metadata.name);
                }
            }
        }

        const waitingList = deploymentList.filter(item => !deploymentNameList.includes(item));
        for (const item of waitingList) {
            deployments.push({name: item, status: "Waiting"});
        }

        const percent = Math.round((availableCount / deploymentList.length) * 100)
        return {percent, deployments};
    } catch (err) {
        logger.error(`getInstallStatus exception: ${err.message}`);
        return {percent, deployments};
    }
}

//安装成功
async function installSuccess(orgId) {
    try {
        let filePath = path.join(userDataPath, orgId);
        filePath = `"` + filePath + `"`;
        const { stdout } = await exec(
            kubectlPath + ' get service heliumos-lb -n ' +
            orgId +
            ' --output=yaml --kubeconfig=' +
            filePath
        );

        for (const ip of yaml.load(stdout).status.loadBalancer.ingress) {
            await updateDb(orgId, ip.ip);
            return ip.ip;
        }
    } catch (err) {
        logger.error(`get service heliumos-lb exception: ${err.message}`);
        return "";
    }
}


//组织与集群ip对应关系
async function getIpMap() {
    return await getDbValue();
}

function createDbConnection() {
    const filePath = path.join(userDataPath, orgsDb);
    return open({
        filename: filePath,
        driver: sqlite3.Database,
    });
}

async function updateDb(orgId, ip) {
    try {
        const orgDb = await createDbConnection();
        await orgDb.exec(`CREATE TABLE IF NOT EXISTS orgs (id TEXT PRIMARY KEY, ip TEXT)`);
        await orgDb.exec(`DELETE from orgs where id='` + orgId + `'`);
        await orgDb.exec(`insert into orgs(id, ip) values('` + orgId + `','` + ip + `')`);
        await orgDb.close();
    } catch (err) {
        logger.error(`sqlite update error message: ${err.message}`);
    }
}

async function getDbValue() {
    try {
        const orgDb = await createDbConnection();
        const row = await orgDb.all('SELECT * from orgs;');
        await orgDb.close();
        return row;
    } catch (err) {
        logger.error(`sqlite read error message: ${err.message}`);
        return [];
    }
}
