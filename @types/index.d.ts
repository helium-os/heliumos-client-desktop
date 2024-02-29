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
        loadUrl: (url) => void;
        switchModeType: (modeType, orgId?: string) => void;
        getBinaryVersion: (path, id) => Promise<any>;
        getClusterConfig: (config) => Promise<any>;
        installHeliumos: (configObj) => Promise<any>;
        getInstallStatus: (orgId) => Promise<any>;
    };
}
