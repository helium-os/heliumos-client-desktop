import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import { Button, Select } from 'antd';
import BgLayout from '@/components/structure/BgLayout';
import useStyles from '@/components/install-mode/style';
import { ModeType } from '@/utils/data';
const { pageToPathMap } = require('../../../util/path.ts');

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

export default function Index() {
    const router = useRouter();

    const { styles } = useStyles();

    const [modeType, setModeType] = useState<ModeType>(ModeType.Install);

    useEffect(() => {
        switch (modeType) {
            case ModeType.Normal:
                window.versions?.switchModeType(ModeType.Normal);
                break;
        }
    }, [modeType]);

    const onStart = () => {
        router.push(pageToPathMap.installProcess);
    };

    const onModeTypeChange = (value: ModeType) => {
        setModeType(value);
    };

    return (
        <BgLayout className={styles.installGuideContainer}>
            <div className={styles.avatarBox}>
                <Image fill alt="" src="/guide-avatar-bg.svg" />
                <div className={styles.avatar}>
                    <Image fill alt="" src="/logo.svg" />
                </div>
            </div>
            <h2>欢迎来到安装模式</h2>
            <p>你可以在这里安装最新版的HeliumOS系统</p>
            <Button className={styles.installBtn} onClick={onStart}>
                开始安装
            </Button>
            <div className={styles.switchModeType}>
                <Select
                    style={{ width: '120px' }}
                    value={modeType}
                    onChange={onModeTypeChange}
                    options={modeTypeOptions}
                    variant="borderless"
                />
            </div>
        </BgLayout>
    );
}
