import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';
import { StoreConfigItem } from '../../components/install-process/common/StoreConfigList';

type State = {
    storageClassList: string[];
    storageClass: string;
    serverExposeList: string[];
    serverExpose: string;
    serverIp: string;
    orgId: string;
    adminUsername: string;
    adminPassword: string;
    storeConfigList: StoreConfigItem[];
    oamStoreConfigList: StoreConfigItem[];
};

const initialState: State = {
    storageClassList: [], // storageClass列表
    storageClass: '', // 选中的storageClass
    serverExposeList: [], // 服务暴露方式列表
    serverExpose: '', // 选中的服务暴露方式
    serverIp: '', // 公网IP
    orgId: '', // 组织id
    adminUsername: 'admin', // admin用户名
    adminPassword: '', // admin密码
    storeConfigList: [], // PV存储
    oamStoreConfigList: [], // OAM存储
};

const installConfigSlice = createSlice({
    name: 'installConfig',

    initialState,

    reducers: {
        setStorageClassList: (state, { payload = [] }: PayloadAction<string[]>) => {
            state.storageClassList = payload;
        },
        setStorageClass: (state, { payload = '' }: PayloadAction<string>) => {
            state.storageClass = payload;
        },
        setServerExposeList: (state, { payload = [] }: PayloadAction<string[]>) => {
            state.serverExposeList = payload;
        },
        setServerExpose: (state, { payload = '' }: PayloadAction<string>) => {
            state.serverExpose = payload;
        },
        setServerIp: (state, { payload = '' }: PayloadAction<string>) => {
            state.serverIp = payload;
        },
        setOrgId: (state, { payload = '' }: PayloadAction<string>) => {
            state.orgId = payload;
        },
        setAdminPassword: (state, { payload = '' }: PayloadAction<string>) => {
            state.adminPassword = payload;
        },
        setStoreConfigList: (state, { payload = [] }: PayloadAction<StoreConfigItem[]>) => {
            state.storeConfigList = payload;
        },
        setOamStoreConfigList: (state, { payload = [] }: PayloadAction<StoreConfigItem[]>) => {
            state.oamStoreConfigList = payload;
        },
    },
});

export const {
    setStorageClassList,
    setStorageClass,
    setServerExposeList,
    setServerExpose,
    setServerIp,
    setOrgId,
    setAdminPassword,
    setStoreConfigList,
    setOamStoreConfigList,
} = installConfigSlice.actions;
export default installConfigSlice.reducer;
