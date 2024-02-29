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

module.exports = {
    getBinaryVersion,
    getClusterConfig,
    installHeliumos,
    getInstallStatus,
    getIpMap,
};

const chartRepo = 'https://easypayx-helm.pkg.coding.net/heliumos/charts-dev';
const orgsDb = 'orgsdb';
const userDataPath = app.getPath('userData');

const deploymentList = [
    'api-server',
    'deployer',
    'app-store',
    'internal-dns',
    'heliumos-grafana',
    'heliumos-proxy',
    'postgres',
    'pulsar-zookeeper',
    'pulsar-bookie',
    'couchdb',
    'heliumos-vault-2cc473d7ee-agent-injector',
    'vault-manager',
    'pulsar-manager',
    'postgres-manager',
    'pulsar-broker',
    'sign-ca',
    'couchdb-manager',
    'resource-manager',
    'external-dns-manager',
    'app-manager',
    'peer',
    'orderer',
    'transaction-agent',
    'external-dns'
]

//返回helm kubectl 版本号
async function getBinaryVersion(path, binaryName) {
    let command = path;
    try {
        if (binaryName === 'kubectl') {
            command += ' version --output=yaml';
            const { stdout } = await exec(command);
            const version = yaml.load(stdout).clientVersion.gitVersion.substring(1);
            const versionSplit = version.split('.');
            return { version: version, pass: versionSplit[0] >= 1 && versionSplit[1] >= 20 ? true : false };
        } else if (binaryName === 'helm') {
            command += " version --template='Version: {{.Version}}'";
            let { stdout } = await exec(command);
            const version = stdout.substring(stdout.indexOf('Version')).split(' ')[1].substring(1);
            const versionSplit = version.split('.');
            return { version: stdout.split(' ')[1].substring(1), pass: versionSplit[0] >= 3 ? true : false };
        } else {
            return { version: '', pass: false };
        }
    } catch (err) {
        logger.error(`getBinaryVersion exception: ${err.message}`);
        return { version: '', pass: false };
    }
}

//通过kubeConfig获取集群配置,生成OrgId
async function getClusterConfig(kubeConfig) {
    let config = {};
    config.nodes = [];
    config.storageClasses = [];
    config.expose = ['loadBalancer'];

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

    const yamlConfig = yaml.load(kubeConfig);
    let filePath = path.join(userDataPath, "kubeConfig");
    fs.writeFileSync(filePath, kubeConfig);
    filePath = `'` + filePath + `'`

    const shasum = crypto.createHash('sha256');
    shasum.update(kubeConfig, 'utf-8');
    const hexStr = shasum.digest('hex');
    config.orgId = hexStr.substring(0, 10);

    for (const cluster of yamlConfig.clusters) {
        config.serverIp = { value: cluster.cluster.server.split(':')[1].replace(/\//g, ''), pass: true };
    }

    try {
        //k8s version
        let result = await exec('kubectl version --output=yaml --kubeconfig=' + filePath);
        const version = yaml.load(result.stdout).serverVersion.gitVersion.substring(1);
        const versionSplit = version.split('.');
        config.serverVersion = { value: version, pass: versionSplit[0] >= 1 && versionSplit[1] >= 20 ? true : false };

        //nodes
        result = await exec('kubectl get nodes --output=yaml --kubeconfig=' + filePath);
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
        result = await exec('kubectl get sc --output=yaml --kubeconfig=' + filePath);
        for (const sc of yaml.load(result.stdout).items) {
            config.storageClasses.push(sc.metadata.name);
        }

        //coreDNS
        result = await exec('kubectl get pods --namespace="kube-system" --output=yaml --kubeconfig=' + filePath);
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
    config.Environment = 'demo';
    config.chartRepo = chartRepo;
    config.expose = {};
    config.expose.type = installConfig.expose;
    config.adminPw = installConfig.adminPw;
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
    configFilePath = `'` + configFilePath + `'`;

    try {
        let filePath = path.join(userDataPath, "kubeConfig");
        filePath = `'` + filePath + `'`;
        const result = await exec('kubectl get ns --output=yaml --kubeconfig=' + filePath);
        let nsFlag = false;
        for (const ns of yaml.load(result.stdout).items) {
            if (config.orgId === ns.metadata.name) {
                nsFlag = true;
                break;
            }
        }

        await updateDb(installConfig.orgId, installConfig.serverIp);

        if (!nsFlag) {
            const result = await exec('kubectl create ns ' + config.orgId + ' --output=yaml --kubeconfig=' + filePath);
        }

        const list = await exec('helm repo list --output=yaml');

        let repoFlag = false;
        for (const repo of yaml.load(list.stdout)) {
            if (repo.name == 'heliumos') {
                repoFlag = true;
                break;
            }
        }
        if (!repoFlag) {
            await exec('helm repo add heliumos ' + chartRepo);
        }
        await exec('helm repo update');
        await exec(
            'helm install -f ' +
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
    let filePath = path.join(userDataPath, "kubeConfig");
    filePath = `'` + filePath + `'`;

    let deployments = [];
    let deploymentNameList = [];
    let percent = 0;

    try {
        const result = await exec(
            'kubectl get deployment -n ' +
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
                    deployments.push({value: deployment.metadata.name, pass: status.status === "True"? true:false});
                    deploymentNameList.push(deployment.metadata.name);
                }
            }
        }

        const waitingList = deploymentList.filter(item => !deploymentNameList.includes(item));
        for (const item of waitingList) {
            deployments.push({value: item, pass: false});
        }

        const percent = Math.round((availableCount / deploymentList.length) * 100)
        return {percent, deployments};
    } catch (err) {
        logger.error(`getInstallStatus exception: ${err.message}`);
        return {percent, deployments};
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
