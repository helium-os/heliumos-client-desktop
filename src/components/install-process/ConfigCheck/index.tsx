import React, { useState, useMemo, useCallback, memo } from 'react';
import useStyles from './style';
import { Divider, message } from 'antd';
import PanelLayout from '../common/PanelLayout';
import StoreConfigList from '../common/StoreConfigList';
import { RootState, useAppSelector } from '@/store';
import { BaseTabContentProps, ReadWriteType, Step } from '@/components/install-process/data';
import FooterButtons from '../common/FooterButtons';
import { StorageMap } from '@/components/install-process/ClusterCheck/data';
import StorageClassConfig from '@/components/install-process/common/StorageClassConfig';
import ServerExposeConfig from '@/components/install-process/common/ServerExposeConfig';
import AdminConfig from '@/components/install-process/common/AdminConfig';

export interface IProps extends BaseTabContentProps {}

const readOnly = true;

const ConfigCheck: React.FC<IProps> = ({ onStep, ...restProps }) => {
    const [messageApi, contextHolder] = message.useMessage();

    const storageClass = useAppSelector((state: RootState) => state.installConfig.storageClass);
    const serverExpose = useAppSelector((state: RootState) => state.installConfig.serverExpose);
    const serverIp = useAppSelector((state: RootState) => state.installConfig.serverIp);
    const orgId = useAppSelector((state: RootState) => state.installConfig.orgId);
    const adminPassword = useAppSelector((state: RootState) => state.installConfig.adminPassword);
    const storeConfigList = useAppSelector((state: RootState) => state.installConfig.storeConfigList);
    const oamStoreConfigList = useAppSelector((state: RootState) => state.installConfig.oamStoreConfigList);

    const { styles } = useStyles();

    const [loading, setLoading] = useState<boolean>(false);

    const onInstall = useCallback(() => {
        const baseConfigStorage: StorageMap = {};
        storeConfigList.forEach(({ id, value, defaultValue }) => {
            baseConfigStorage[id] = value || defaultValue;
        });

        const oamConfigStorage: StorageMap = {};
        oamStoreConfigList.forEach(({ id, value, defaultValue }) => {
            oamConfigStorage[id] = value || defaultValue;
        });

        return window.versions?.installHeliumos({
            storageClass,
            expose: serverExpose,
            serverIp,
            orgId,
            adminPw: adminPassword,
            baseConfig: {
                storage: baseConfigStorage,
            },
            oamConfig: {
                storage: oamConfigStorage,
            },
        });
    }, [storageClass, serverExpose, serverIp, orgId, adminPassword, storeConfigList, oamStoreConfigList]);

    const footerButtons = useMemo(
        () => (
            <FooterButtons
                cancelButton={{
                    text: '返回',
                    onClick: () => onStep?.(Step.Back),
                }}
                primaryButton={{
                    text: '安装',
                    loading,
                    disabled: loading,
                    onClick: async () => {
                        setLoading(true);
                        try {
                            const orgId = await onInstall();
                            console.log('安装接口调用完成 orgId = ', orgId);
                            if (!orgId) {
                                throw new Error('安装失败，没有返回orgId');
                            }
                            onStep?.(Step.Next);
                        } catch (error: any) {
                            console.error('安装失败', error);
                            messageApi.open({
                                type: 'error',
                                content: error.message,
                            });
                        }
                        setLoading(false);
                    },
                }}
            />
        ),
        [onInstall, onStep, messageApi, loading],
    );

    return (
        <>
            {contextHolder}
            <PanelLayout footer={footerButtons} {...restProps}>
                <StorageClassConfig readOnly={readOnly} />
                <Divider />
                <ServerExposeConfig readOnly={readOnly} />
                <Divider />
                <AdminConfig readOnly={readOnly} />
                <Divider />
                <StoreConfigList readOnly={readOnly} />
            </PanelLayout>
        </>
    );
};

export default memo(ConfigCheck);
