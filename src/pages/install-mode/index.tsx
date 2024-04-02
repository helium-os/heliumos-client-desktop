import { useRouter } from 'next/router';
import Image from 'next/image';
import { Button } from 'antd';
import BgLayout from '@/components/structure/BgLayout';
import useStyles from '@/components/install-mode/style';
import { ModeType } from '@/utils/data';
import SwitchModeType from '@/components/structure/SwitchModeType';
const { pageToPathMap } = require('../../../electron-src/util/pagePath');

export default function Page() {
    const router = useRouter();

    const { styles } = useStyles();

    const onStart = () => {
        router.push(pageToPathMap.installProcess);
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
            <p>你可以在这里安装最新版的Helium OS系统</p>
            <Button className={styles.installBtn} onClick={onStart}>
                开始安装
            </Button>
            <SwitchModeType defaultModeType={ModeType.Install} />
        </BgLayout>
    );
}
