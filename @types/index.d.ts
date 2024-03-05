interface Window {
    versions: {
        lock: string;
        name: () => Promise<any>;
        password: () => Promise<any>;
        setuserInfo: (value) => void;
        getDNS: () => Promise<any>;
        clearInfo: (res) => void;
        getValue: (res) => Promise<any>;
        getDbValue: () => Promise<any>;
        getMessage: (name, fun) => any;
        sendMethod: (name) => void;
        invokMethod: (name, value) => Promise<any>;
        loadLocalFont: () => Promise<any>;
        openExternal: (url) => void;
        loadKeycloakLogin: (orgId) => void;
        loadURL: (url) => void;
        switchModeType: (modeType, orgId?: string) => void;
        getBinaryPathAndVersion: (id) => Promise<any>;
        getBinaryVersion: (path, id) => Promise<any>;
        getDefaultKubeConfig: () => Promise<any>;
        getClusterConfig: (config) => Promise<any>;
        installHeliumos: (configObj) => Promise<any>;
        getInstallStatus: (orgId) => Promise<any>;
    };
}
