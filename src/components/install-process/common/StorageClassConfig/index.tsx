import React, { useEffect, useMemo, memo } from 'react';
import type { FormInstance } from 'antd';
import { Form, Select } from 'antd';
import SectionLayout, { Size } from '../SectionLayout';
import ConfigReader from '../ConfigReader';
import { configSettingWidth } from '@/components/install-process/data.d';
import { RootState, useAppSelector } from '@/store';
import useStyles from './style';
export interface IProps {
    readOnly: boolean;
    form?: FormInstance;
}

enum Association {
    PV,
}

const associationOptions = [
    {
        label: '使用 StorageClass 自动创建 PV',
        value: Association.PV,
    },
];

const associationValue = Association.PV;

const associationLabel = associationOptions.find((item) => item.value === associationValue)?.label || '';

const StorageClassConfig: React.FC<IProps> = ({ readOnly, form }) => {
    const { styles } = useStyles({ readOnly });

    const storageClassList = useAppSelector((state: RootState) => state.installConfig.storageClassList);
    const storageClass = useAppSelector((state: RootState) => state.installConfig.storageClass);

    // StorageClass下拉菜单Options
    const storageClassOptions = useMemo(
        () => storageClassList.map((value) => ({ value, label: value })),
        [storageClassList],
    );

    // StorageClass默认选中第一项
    useEffect(() => {
        if (!form) return;

        form!.setFieldValue('storageClass', storageClassList[0]);
    }, [form, storageClassList]);

    return (
        <SectionLayout title="数据持久化方式" size={Size.Large}>
            <div className={styles.storageClassContent}>
                {readOnly ? (
                    <>
                        <ConfigReader label={associationLabel} />
                        <ConfigReader label={storageClass} />
                    </>
                ) : (
                    <>
                        <Select
                            value={associationValue}
                            options={associationOptions}
                            style={{ width: `${configSettingWidth}px` }}
                        />
                        <Form.Item name="storageClass" rules={[{ required: true, message: '请选择数据持久化方式' }]}>
                            <Select
                                placeholder="请选择数据持久化方式"
                                options={storageClassOptions}
                                style={{ width: `${configSettingWidth}px` }}
                            />
                        </Form.Item>
                    </>
                )}
            </div>
        </SectionLayout>
    );
};

export default memo(StorageClassConfig);
