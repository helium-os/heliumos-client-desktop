'use client';
import React, { useState, useEffect, useMemo, useCallback, memo } from 'react';
import useStyles from './style';
import { Divider, message } from 'antd';
import PanelLayout from '@/components/installProcess/PanelLayout';
import ConfigItem from './ConfigItem';
import StoreConfigList, { ModeType } from '@/components/structure/StoreConfigList';
import { RootState, useAppSelector } from '@/store';
import { BaseTabContentProps, Step } from '@/app/[locale]/install-process/page';
import FooterButtons from '@/components/installProcess/FooterButtons';
import { installHeliumos } from '@/app/actions';
import { StorageMap } from '@/components/installProcess/ClusterCheck/data';

interface IProps extends BaseTabContentProps {}

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

    const onInstall = useCallback(() => {
        const baseConfigStorage: StorageMap = {};
        storeConfigList.forEach(({ id, value, defaultValue }) => {
            baseConfigStorage[id] = value || defaultValue;
        });

        const oamConfigStorage: StorageMap = {};
        oamStoreConfigList.forEach(({ id, value, defaultValue }) => {
            oamConfigStorage[id] = value || defaultValue;
        });

        return installHeliumos({
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
                    onClick: async () => {
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
                    },
                }}
            />
        ),
        [onInstall, onStep, messageApi],
    );

    return (
        <>
            {contextHolder}
            <PanelLayout footer={footerButtons} {...restProps}>
                <ConfigItem title="StorageClass" value={storageClass} />
                <ConfigItem title="服务暴露方式" value={serverExpose} />
                <ConfigItem title="组织id" value={orgId} />
                <ConfigItem title="admin密码" value={adminPassword} />
                <Divider />
                <StoreConfigList type={ModeType.Read} />
            </PanelLayout>
        </>
    );
};

export default memo(ConfigCheck);
