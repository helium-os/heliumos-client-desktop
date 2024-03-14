import React, { useState, useEffect, useMemo, useCallback, memo, useRef } from 'react';
import PanelLayout from '../common/PanelLayout';
import DownOutlinedIcon from '@/components/common/icon/DownOutlined';
import SuccessOutlinedIcon from '@/components/common/icon/SuccessOutlined';
import FooterButtons from '../common/FooterButtons';
import useStyles from './style';
import { RootState, useAppSelector } from '@/store';
import { ModeType } from '@/utils/data';
import { message } from 'antd';
import Image from 'next/image';
import { BaseTabContentProps } from '@/components/install-process/data';

export interface IProps extends BaseTabContentProps {}

enum DeploymentInstallStatus {
    Waiting = 'Waiting', // 等待安装
    Unavailable = 'Unavailable', // 正在安装
    Available = 'Available', // 安装成功
}

interface InstallDeploymentItem {
    name: string;
    status: DeploymentInstallStatus;
}

interface InstallStatus {
    percent: number;
    deployments: InstallDeploymentItem[];
}

const Install: React.FC<IProps> = ({ title, ...restProps }) => {
    const orgId = useAppSelector((state: RootState) => state.installConfig.orgId);
    const adminUsername = useAppSelector((state: RootState) => state.installConfig.adminUsername);

    const { styles } = useStyles();
    const [messageApi, contextHolder] = message.useMessage();

    const timerRef = useRef<any>(null);

    const [expand, setExpand] = useState<boolean>(false);
    const [progress, setProgress] = useState<number>(0); // 安装进度
    const isComplete: boolean = useMemo(() => progress >= 100, [progress]); // 是否安装完成
    const [deployments, setDeployments] = useState<InstallDeploymentItem[]>([]);

    const clearTimer = () => {
        timerRef.current && clearInterval(timerRef.current);
    };

    useEffect(() => {
        if (!orgId) return;

        timerRef.current = setInterval(() => {
            window.versions
                ?.getInstallStatus(orgId)
                .then((installStatus: InstallStatus) => {
                    console.log('install status:', installStatus);
                    const { percent, deployments } = installStatus;
                    if (percent >= 100) clearTimer();
                    setProgress(percent);
                    setDeployments(deployments);
                })
                .catch((error) => {
                    console.error('查询安装状态失败', error);
                    messageApi.open({
                        type: 'error',
                        content: error.message,
                    });
                });
        }, 1000);

        return () => {
            clearTimer();
        };
    }, [orgId, messageApi]);

    const onToggleExpand = () => {
        setExpand((state) => !state);
    };

    const onLogin = useCallback(async () => {
        const ip = await window.versions?.getIpByOrgId(orgId);
        const env = `custom@${ip}`;
        await window.versions?.setEnv(env);
        await window.versions?.setuserInfo({
            org: orgId, // 安装完成后，orgId暂时用作别名
            orgId,
            name: adminUsername,
            display_name: adminUsername,
            autoLogin: null,
        });
        window.versions?.switchModeType(ModeType.Normal, orgId);
    }, [orgId]);

    const footerButtons = useMemo(
        () => (
            <FooterButtons
                primaryButton={
                    isComplete
                        ? {
                              text: '登录HeliumOS',
                              onClick: onLogin,
                          }
                        : null
                }
            />
        ),
        [isComplete, onLogin],
    );

    return (
        <>
            {contextHolder}
            <PanelLayout title={title} footer={footerButtons} {...restProps}>
                <div className={styles.installWrap}>
                    <div className={styles.installInner}>
                        {isComplete ? (
                            <div className={styles.installSuccess}>
                                <SuccessOutlinedIcon />
                                安装完成
                            </div>
                        ) : (
                            <>
                                <div className={styles.progressBarBox}>
                                    <div className={styles.doneBar} style={{ width: `${progress}%` }} />
                                </div>
                                <div className={styles.installLogWrap}>
                                    <div
                                        className={`${styles.logTitle} ${expand ? 'expand' : ''}`}
                                        onClick={onToggleExpand}
                                    >
                                        <div className={styles.expandIcon}>
                                            <DownOutlinedIcon />
                                        </div>
                                        正在安装配置（{progress}%）
                                    </div>
                                    {expand && (
                                        <div className={styles.logDetailWrap}>
                                            <ul className={styles.logDetailList}>
                                                {deployments.map((item) => {
                                                    let icon,
                                                        className = '';
                                                    switch (item.status as DeploymentInstallStatus) {
                                                        case DeploymentInstallStatus.Waiting:
                                                            icon = 'waiting.svg';
                                                            break;
                                                        case DeploymentInstallStatus.Unavailable:
                                                            icon = 'loading.svg';
                                                            className = 'loading';
                                                            break;
                                                        case DeploymentInstallStatus.Available:
                                                            icon = 'success.svg';
                                                            break;
                                                    }
                                                    return (
                                                        <li className={className} key={item.name}>
                                                            <label>{item.name}</label>
                                                            <div className="statusIcon">
                                                                <Image width={12} height={12} alt="" src={`/${icon}`} />
                                                            </div>
                                                        </li>
                                                    );
                                                })}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </PanelLayout>
        </>
    );
};

export default memo(Install);
