const { pageToPathMap } = require('../../../pagePath');

export enum LoginType {
    Alias = 'alias',
    Ip = 'ip',
}

export interface LoginTypeInfo {
    type: LoginType;
    name: string;
    path: string;
}

export type LoginTypeMap = {
    [key in LoginType]: LoginTypeInfo;
};

export const loginTypes: LoginType[] = [LoginType.Alias, LoginType.Ip];

export const loginTypeMap: LoginTypeMap = {
    [LoginType.Alias]: {
        type: LoginType.Alias,
        name: '组织别名',
        path: pageToPathMap.loginByAlias,
    },
    [LoginType.Ip]: {
        type: LoginType.Ip,
        name: '节点IP',
        path: pageToPathMap.loginByIp,
    },
};
