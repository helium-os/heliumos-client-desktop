'use client';
import React, { useState, useEffect, useMemo, useCallback, memo } from 'react';
import PanelLayout from '@/components/installProcess/PanelLayout';
import { Step, TabContentProps } from '@/app/[locale]/install-process/page';
import DownOutlinedIcon from '@/components/common/icon/DownOutlined';
import SuccessOutlinedIcon from '@/components/common/icon/SuccessOutlined';
import FooterButtons from '@/components/installProcess/FooterButtons';
import useStyles from './style';
import { getInstallStatus } from '@/app/actions';

interface IProps extends TabContentProps {}

const Install: React.FC<IProps> = ({ title, ...restProps }) => {
    const { styles } = useStyles();

    const [progress, setProgress] = useState<number>(0); // 安装进度
    const [isComplete, setIsComplete] = useState<boolean>(false);
    const [expand, setExpand] = useState<boolean>(false);

    useEffect(() => {
        setInterval(() => {
            getInstallStatus().then((installstatus) => {
                console.log('install status:', installstatus);
                // setProgress((state) => {
                //     return Math.min(state + 50, 100);
                // });
            });
        }, 1000);
    }, []);

    useEffect(() => {
        setIsComplete(progress >= 100);
    }, [progress]);

    const onToggleExpand = () => {
        setExpand((state) => !state);
    };

    const onLogin = () => {};

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
    );
};

export default memo(Install);
