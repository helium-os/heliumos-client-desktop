import React, { useEffect, useMemo, memo } from 'react';
import type { FormInstance } from 'antd';
import { Form, Select } from 'antd';
import SectionLayout, { Size } from '../SectionLayout';
import ConfigReader from '@/components/install-process/common/ConfigReader';
import { RootState, useAppSelector } from '@/store';
import { configSettingWidth } from '@/components/install-process/data';
import useStyles from './style';
export interface IProps {
    readOnly: boolean;
    form?: FormInstance;
}

const serverExposeLabelMap: { [key: string]: string } = {
    loadBalancer: '创建新的 LoadBalancer',
};

const ServerExposeConfig: React.FC<IProps> = ({ readOnly, form }) => {
    const { styles } = useStyles();

    const serverExposeList = useAppSelector((state: RootState) => state.installConfig.serverExposeList);
    const serverExpose = useAppSelector((state: RootState) => state.installConfig.serverExpose);

    // 服务暴露方式下拉菜单Options
    const serverExposeOptions = useMemo(
        () => serverExposeList.map((value) => ({ value, label: serverExposeLabelMap[value] })),
        [serverExposeList],
    );

    const serverExposeLabel = serverExposeOptions.find((item) => item.value === serverExpose)?.label || '';

    // 服务暴露方式默认选中第一项
    useEffect(() => {
        if (!form) return;
        form!.setFieldValue('serverExpose', serverExposeList[0]);
    }, [form, serverExposeList]);

    return (
        <SectionLayout title="服务暴露方式" size={Size.Large}>
            {readOnly ? (
                <ConfigReader label={serverExposeLabel} />
            ) : (
                <Form.Item name="serverExpose" rules={[{ required: true, message: '请选择服务暴露方式' }]}>
                    <Select
                        placeholder="请选择服务暴露方式"
                        options={serverExposeOptions}
                        style={{ width: `${configSettingWidth}px` }}
                    />
                </Form.Item>
            )}
        </SectionLayout>
    );
};

export default memo(ServerExposeConfig);
