import React, { memo, useCallback, useState } from 'react';
import ConfigReader from '@/components/install-process/common/ConfigReader';
import { PasswordIconRender } from '@/components/install-process/common/AdminConfig';
import { RootState, useAppSelector } from '@/store';
import { Direction } from '@/components/install-process/data.d';
import useStyles from './style';

export interface IProps {
    passwordIconRender: PasswordIconRender;
}

const AdminConfigReader: React.FC<IProps> = ({ passwordIconRender }) => {
    const { styles } = useStyles();

    const adminUsername = useAppSelector((state: RootState) => state.installConfig.adminUsername);
    const adminPassword = useAppSelector((state: RootState) => state.installConfig.adminPassword);

    const [visible, setVisible] = useState<boolean>(false);

    const onToggleVisible = () => {
        setVisible((state) => !state);
    };

    const renderPassword = () => {
        if (visible) return adminPassword;

        return (
            <ul className={styles.encryptionPwdBox}>
                {Array.from(adminPassword).map((item, index) => (
                    <li key={index} />
                ))}
            </ul>
        );
    };

    return (
        <>
            <ConfigReader label="用户名" direction={Direction.Row}>
                {adminUsername}
            </ConfigReader>
            <ConfigReader label="登录密码" direction={Direction.Row}>
                <div className={styles.passwordContent}>
                    {renderPassword()}
                    <div className={styles.encryptionIcon} onClick={onToggleVisible}>
                        {passwordIconRender(!visible)}
                    </div>
                </div>
            </ConfigReader>
        </>
    );
};

export default memo(AdminConfigReader);
