import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/router';
import { CloseOutlined } from '@ant-design/icons';
import EnvCheck, { IProps as EnvCheckProps } from '@/components/install-process/EnvCheck';
import ClusterCheck, { IProps as ClusterCheckProps } from '@/components/install-process/ClusterCheck';
import InstallConfig, { IProps as InstallConfigProps } from '@/components/install-process/InstallConfig';
import ConfigCheck, { IProps as ConfigCheckProps } from '@/components/install-process/ConfigCheck';
import Install, { IProps as InstallProps } from '@/components/install-process/Install';
import useStyles from '@/components/install-process/style';
import { Step } from '@/components/install-process/data.d';

enum Tab {
    EnvCheck,
    ClusterCheck,
    InstallConfig,
    ConfigCheck,
    Install,
}

type TabContentProps = EnvCheckProps | ClusterCheckProps | InstallConfigProps | ConfigCheckProps | InstallProps;

type TabItem = {
    key: Tab;
    name: string;
    Component: React.FC<TabContentProps>;
    props: Partial<TabContentProps>;
};
export default function Page() {
    const router = useRouter();

    const { styles } = useStyles();

    const tabList: TabItem[] = useMemo(
        () => [
            {
                key: Tab.EnvCheck,
                name: '客户端环境检查',
                Component: EnvCheck,
                props: {},
            },
            {
                key: Tab.ClusterCheck,
                name: '集群配置检查',
                Component: ClusterCheck,
                props: {},
            },
            {
                key: Tab.InstallConfig,
                name: '安装配置',
                Component: InstallConfig,
                props: {},
            },
            {
                key: Tab.ConfigCheck,
                name: '检查配置',
                Component: ConfigCheck,
                props: {},
            },
            {
                key: Tab.Install,
                name: '安装',
                Component: Install,
                props: {},
            },
        ],
        [],
    );

    const [activeTab, setActiveTab] = useState<TabItem>(tabList[0]);
    const activeTabIndex: number = useMemo(
        () => tabList.findIndex((item) => item.key === activeTab.key),
        [tabList, activeTab],
    );

    // 返回 || 下一步
    const onStep = useCallback(
        (step: Step) => {
            const tab = step === Step.Next ? tabList[activeTabIndex + 1] : tabList[activeTabIndex - 1];
            setActiveTab(tab);
        },
        [tabList, activeTabIndex],
    );

    const onClose = () => {
        router.push('/install-mode');
    };

    return (
        <div className={styles.installProcessContainer}>
            <div className={styles.closeBtn} onClick={onClose}>
                <CloseOutlined />
            </div>
            <div className={styles.mainContent}>
                <div className={styles.leftPanel}>
                    <ul className={styles.tabList}>
                        {tabList.map((item) => (
                            <li key={item.key} className={activeTab.key === item.key ? 'active' : ''}>
                                <div className={styles.orderIconBox}>
                                    <span className={styles.orderIcon} />
                                </div>
                                {item.name}
                            </li>
                        ))}
                    </ul>
                </div>
                <div className={styles.rightPanel}>
                    {tabList.map(({ key, name, Component, props }) =>
                        (key === Tab.Install && activeTab.key !== Tab.Install) ||
                        (activeTab.key === Tab.Install && key !== Tab.Install) ? null : (
                            <Component
                                key={key}
                                title={name}
                                display={activeTab.key === key}
                                style={activeTab.key === key ? {} : { display: 'none' }}
                                onStep={onStep}
                                {...props}
                            />
                        ),
                    )}
                </div>
            </div>
        </div>
    );
}
