export interface ResultInfo {
    id: string;
    name: string;
    value: string;
    pass: boolean;
}

export type ValueInfo = Pick<ResultInfo, 'value' | 'pass'>;

export interface ResultChildrenItem {
    [key: string]: ValueInfo;
}

export type ResultItem =
    | ResultInfo
    | (Pick<ResultInfo, 'id' | 'name'> & {
          children: ResultChildrenItem[];
      });

export interface StorageMap {
    [key: string]: string;
}
export interface ResultRes {
    storageClasses: string[];
    expose: string[];
    baseConfig: {
        storage: {
            [key: string]: string;
        };
    };
    oamConfig: {
        storage: {
            [key: string]: string;
        };
    };
    orgId: string;
    serverVersion: ValueInfo;
    serverIp: ValueInfo;
    nodes: ResultChildrenItem[];
    component: ValueInfo;
}

export const keyNameMap: { [key: string]: string } = {
    serverVersion: 'Kubernetes 版本',
    serverIp: '公网 IP',
    nodes: '节点',
    component: '组件',
    mame: 'MAME',
    cpu: 'CPU',
    memory: 'MEM',
};

// 检查是否有未通过校验的
interface CheckPassData {
    [key: string]: ValueInfo | ResultChildrenItem[];
}
export function checkHasNoPass(data: CheckPassData) {
    let hasNoPass; // 是否有未通过校验的
    for (const [key, value] of Object.entries(data)) {
        if (typeof value !== 'object') return;

        if (Array.isArray(value)) {
            for (const item of value) {
                hasNoPass = checkHasNoPass(item);
                if (hasNoPass) return true;
            }
        } else {
            hasNoPass = !value.pass;
            if (hasNoPass) return true;
        }
    }
    return false;
}
