import React, { useState, useEffect, useMemo, useCallback, memo, useRef } from 'react';
import PanelLayout from '@/components/install-process/PanelLayout';
import { TabContentProps } from '../../../pages/install-process';
import DownOutlinedIcon from '@/components/common/icon/DownOutlined';
import SuccessOutlinedIcon from '@/components/common/icon/SuccessOutlined';
import FooterButtons from '@/components/install-process/FooterButtons';
import useStyles from './style';
import { RootState, useAppSelector } from '@/store';
import { ModeType } from '@/utils/data';
import { message } from 'antd';

interface IProps extends TabContentProps {}

const Install: React.FC<IProps> = ({ title, ...restProps }) => {
    const orgId = useAppSelector((state: RootState) => state.installConfig.orgId);

    const { styles } = useStyles();
    const [messageApi, contextHolder] = message.useMessage();

    const timerRef = useRef<any>(null);

    const [progress, setProgress] = useState<number>(0); // 安装进度
    const [isComplete, setIsComplete] = useState<boolean>(false);
    const [expand, setExpand] = useState<boolean>(false);

    useEffect(() => {
        timerRef.current = setInterval(() => {
            window.versions?.getInstallStatus(orgId).then((installStatus) => {
                console.log('install status:', installStatus);
                // setProgress((state) => {
                //     return Math.min(state + 50, 100);
                // });
            });
        }, 1000);

        return () => {
            clearInterval(timerRef.current);
        };
    }, []);

    useEffect(() => {
        setIsComplete(progress >= 100);
    }, [progress]);

    const onToggleExpand = () => {
        setExpand((state) => !state);
    };

    const onLogin = useCallback(async () => {
        await window.versions?.setuserInfo({
            org: orgId, // 安装完成后，orgId暂时用作别名
            orgId,
            name: 'admin',
            autoLogin: null,
        });
        window.versions?.switchModeType(ModeType.Normal);
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
                                        正在安装配置...
                                    </div>
                                    {expand && (
                                        <div className={styles.logDetailWrap}>
                                            <div className={styles.logDetailInner}></div>
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
