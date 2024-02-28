export enum SubTableTitleKey {
    NetworksSupport = 'networksSupport',
    AuthAndDeviceSupport = 'authAndDeviceSupport',
}

enum NetworksSupport {
    Env = 'env',
    Client = 'client',
    ResourceAccessPolicy = 'resourceAccessPolicy',
    Dns = 'dns',
    NetworkAccessPolicy = 'networkAccessPolicy',
    SplitTunnel = 'splitTunnel',
    LoadBalance = 'loadBalance',
}

enum AuthAndDeviceSupport {
    MFA = 'MFA',
    SecretKey = 'secretKey',
    Device = 'device',
    GoogleConsole = 'googleConsole',
}

export enum Version {
    Standard = 'standard',
    Advanced = 'advanced',
    Flagship = 'flagship',
}

export type VersionInfo = {
    type: Version;
    name: string;
    intro?: string;
    color: string;
    price: number;
    characteristic: string[];
    supports: {
        [key in SubTableTitleKey]: (NetworksSupport | AuthAndDeviceSupport)[];
    };
};

type SupportItem = {
    key: NetworksSupport | AuthAndDeviceSupport;
    name: string;
};

const networkSupports: SupportItem[] = [
    {
        key: NetworksSupport.Env,
        name: '对网络环境的广泛支持',
    },
    {
        key: NetworksSupport.Client,
        name: '对客户端平台的广泛支持',
    },
    {
        key: NetworksSupport.ResourceAccessPolicy,
        name: '资源级访问策略',
    },
    {
        key: NetworksSupport.Dns,
        name: '安全DNS',
    },
    {
        key: NetworksSupport.NetworkAccessPolicy,
        name: '网络级访问策略',
    },
    {
        key: NetworksSupport.SplitTunnel,
        name: '拆分隧道',
    },
    {
        key: NetworksSupport.LoadBalance,
        name: '自动负载平衡和故障转移',
    },
];

const authAndDeviceSupports: SupportItem[] = [
    {
        key: AuthAndDeviceSupport.MFA,
        name: '为任何资源添加MFA支持',
    },
    {
        key: AuthAndDeviceSupport.SecretKey,
        name: '每日加密密钥轮换',
    },
    {
        key: AuthAndDeviceSupport.Device,
        name: '设备姿势',
    },
    {
        key: AuthAndDeviceSupport.GoogleConsole,
        name: '谷歌工作区集成',
    },
];

type SubTableInfo = {
    key: SubTableTitleKey;
    name: string;
};
type SubTableItem = SubTableInfo & {
    children: SupportItem[];
};

const subTables: SubTableItem[] = [
    {
        key: SubTableTitleKey.NetworksSupport,
        name: '网络功能',
        children: networkSupports,
    },
    {
        key: SubTableTitleKey.AuthAndDeviceSupport,
        name: '身份验证和设备控制',
        children: authAndDeviceSupports,
    },
];

export const subTableTitleKeys: SubTableTitleKey[] = subTables.map((item) => item.key);

export const popularVersion = Version.Advanced;
export const versionList: VersionInfo[] = [
    {
        type: Version.Standard,
        name: '标准版',
        intro: '快速入门所需的一切。',
        color: '#6BEFCE',
        price: 0,
        characteristic: ['5人以内', '最多支持2个节点，8核36G'],
        supports: {
            [SubTableTitleKey.NetworksSupport]: [
                NetworksSupport.Env,
                NetworksSupport.Client,
                NetworksSupport.ResourceAccessPolicy,
                NetworksSupport.Dns,
                NetworksSupport.NetworkAccessPolicy,
                NetworksSupport.SplitTunnel,
                NetworksSupport.LoadBalance,
            ],
            [SubTableTitleKey.AuthAndDeviceSupport]: [
                AuthAndDeviceSupport.MFA,
                AuthAndDeviceSupport.SecretKey,
                AuthAndDeviceSupport.Device,
                AuthAndDeviceSupport.GoogleConsole,
            ],
        },
    },
    {
        type: Version.Advanced,
        name: '高级版',
        intro: '快速入门所需的一切。',
        color: '#6DB0EF',
        price: 1999,
        characteristic: ['支持更多用户', '支持更高配置', '支持创建联盟'],
        supports: {
            [SubTableTitleKey.NetworksSupport]: [
                NetworksSupport.Env,
                NetworksSupport.Client,
                NetworksSupport.ResourceAccessPolicy,
                NetworksSupport.Dns,
                NetworksSupport.NetworkAccessPolicy,
                NetworksSupport.SplitTunnel,
                NetworksSupport.LoadBalance,
            ],
            [SubTableTitleKey.AuthAndDeviceSupport]: [
                AuthAndDeviceSupport.MFA,
                AuthAndDeviceSupport.SecretKey,
                AuthAndDeviceSupport.Device,
                AuthAndDeviceSupport.GoogleConsole,
            ],
        },
    },
    {
        type: Version.Flagship,
        name: '旗舰版',
        intro: '快速入门所需的一切。',
        color: '#906CEF',
        price: 5999,
        characteristic: ['支持更多用户', '支持更高配置', '支持创建联盟'],
        supports: {
            [SubTableTitleKey.NetworksSupport]: [
                NetworksSupport.Env,
                NetworksSupport.Client,
                NetworksSupport.ResourceAccessPolicy,
                NetworksSupport.Dns,
                NetworksSupport.NetworkAccessPolicy,
                NetworksSupport.SplitTunnel,
                NetworksSupport.LoadBalance,
            ],
            [SubTableTitleKey.AuthAndDeviceSupport]: [
                AuthAndDeviceSupport.MFA,
                AuthAndDeviceSupport.SecretKey,
                AuthAndDeviceSupport.Device,
                AuthAndDeviceSupport.GoogleConsole,
            ],
        },
    },
];

export type SupportDataItem =
    | (SupportItem & {
          [key in Version]?: boolean;
      })
    | SubTableInfo;

export function getSupportsData(): SupportDataItem[] {
    const supportsData = [];
    for (const table of subTables) {
        const { children, ...tableInfo } = table;
        supportsData.push(tableInfo);
        for (const item of children) {
            const info: SupportDataItem = { ...item };
            for (const versionInfo of versionList) {
                info[versionInfo.type] = versionInfo.supports[tableInfo.key].includes(item.key);
            }
            supportsData.push(info);
        }
    }

    return supportsData;
}
