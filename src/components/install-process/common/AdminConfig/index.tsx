import React, { memo } from 'react';
import type { FormInstance } from 'antd';
import SectionLayout, { Size } from '../SectionLayout';
import AdminConfigSetting from './AdminConfigSetting';
import AdminConfigReader from './AdminConfigReader';
import EyeVisibleOutlinedIcon from '@/components/common/icon/EyeVisibleOutlined';
import EyeInVisibleOutlinedIcon from '@/components/common/icon/EyeInvisibleOutlined';
import useStyles from './style';

type IProps = {
    readOnly: boolean;
    form?: FormInstance;
};

export type PasswordIconRender = (visible: boolean) => React.ReactNode;

const passwordIconRender: PasswordIconRender = (visible) =>
    visible ? <EyeVisibleOutlinedIcon /> : <EyeInVisibleOutlinedIcon />;

const AdminConfig: React.FC<IProps> = ({ readOnly, form }) => {
    const { styles } = useStyles({ readOnly });

    return (
        <SectionLayout title="系统管理" size={Size.Large}>
            <div className={styles.adminConfigContent}>
                {readOnly ? (
                    <AdminConfigReader passwordIconRender={passwordIconRender} />
                ) : (
                    <AdminConfigSetting passwordIconRender={passwordIconRender} />
                )}
            </div>
        </SectionLayout>
    );
};

export default memo(AdminConfig);
