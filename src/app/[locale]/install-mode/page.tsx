'use client';
import { useState, useEffect } from 'react';
import { useRouter } from '@/navigation';
import Image from 'next/image';
import { Button, Select } from 'antd';
import { getBinaryVersion, getClusterConfig, installHeliumos, getInstallStatus } from '@/app/actions';
import useStyles from './style';

enum ModeType {
    Normal = 'normal',
    Install = 'install',
}

const modeTypeOptions = [
    {
        value: ModeType.Normal,
        label: '普通用户模式',
    },
    {
        value: ModeType.Install,
        label: '安装模式',
    },
];

export default function Page() {
    const router = useRouter();

    const { styles } = useStyles();

    const [modeType, setModeType] = useState<ModeType>(ModeType.Install);

    useEffect(() => {
        switch (modeType) {
            case ModeType.Normal:
                break;
        }
    }, [modeType]);

    const onStart = () => {
        router.push('/install-process');
    };

    const onModeTypeChange = (value: ModeType) => {
        setModeType(value);
    };

    return (
        <div className={styles.installGuideContainer}>
            <div className={styles.avatarBox}>
                <Image fill alt="" src="/guide-avatar-bg.svg" />
                <div className={styles.avatar}>
                    <Image fill alt="" src="" />
                </div>
            </div>
            <h2>欢迎来到安装模式</h2>
            <p>你可以在这里安装最新版的HeliumOS系统</p>
            <Button onClick={onStart}>开始安装</Button>
            <div className={styles.switchModeType}>
                <Select value={modeType} onChange={onModeTypeChange} options={modeTypeOptions} />
            </div>
        </div>
    );
}
