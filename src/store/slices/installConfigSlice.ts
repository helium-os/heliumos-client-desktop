import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';
import { StoreConfigItem } from '../../components/install-process/common/StoreConfigList';

type State = {
    storageClass: string;
    serverExpose: string;
    serverIp: string;
    orgId: string;
    adminPassword: string;
    storeConfigList: StoreConfigItem[];
    oamStoreConfigList: StoreConfigItem[];
};

const initialState: State = {
    storageClass: '',
    serverExpose: '', // 服务暴露方式
    serverIp: '', // 公网IP
    orgId: '', // 组织id
    adminPassword: '',
    storeConfigList: [], // PV存储
    oamStoreConfigList: [], // OAM存储
};

const installConfigSlice = createSlice({
    name: 'installConfig',

    initialState,

    reducers: {
        setStorageClass: (state, { payload = '' }: PayloadAction<string>) => {
            state.storageClass = payload;
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
    setStorageClass,
    setServerExpose,
    setServerIp,
    setOrgId,
    setAdminPassword,
    setStoreConfigList,
    setOamStoreConfigList,
} = installConfigSlice.actions;
export default installConfigSlice.reducer;
