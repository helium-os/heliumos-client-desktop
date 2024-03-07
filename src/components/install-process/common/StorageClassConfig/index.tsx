import React, { useEffect, useMemo, useCallback, memo } from 'react';
import { Form, Input, Select } from 'antd';
import SectionLayout, { Size } from '../SectionLayout';
import ConfigReader from '../ConfigReader';
import { configSettingWidth } from '@/components/install-process/data.d';
import { RootState, useAppDispatch, useAppSelector } from '@/store';
import { setStorageClass } from '@/store/slices/installConfigSlice';
import useStyles from './style';
export interface IProps {
    readOnly: boolean;
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

const StorageClassConfig: React.FC<IProps> = ({ readOnly }) => {
    const { styles } = useStyles({ readOnly });

    const dispatch = useAppDispatch();
    const storageClassList = useAppSelector((state: RootState) => state.installConfig.storageClassList);
    const storageClass = useAppSelector((state: RootState) => state.installConfig.storageClass);

    // StorageClass下拉菜单Options
    const storageClassOptions = useMemo(
        () => storageClassList.map((value) => ({ value, label: value })),
        [storageClassList],
    );

    // 修改store StorageClass
    const changeStorageClass = useCallback(
        (storageClass: string) => {
            dispatch(setStorageClass(storageClass));
        },
        [dispatch],
    );

    // StorageClass默认选中第一项
    useEffect(() => {
        changeStorageClass(storageClassList[0]);
    }, [storageClassList, changeStorageClass]);

    // 点击切换StorageClass
    const onStorageClassChange = (value: string) => {
        changeStorageClass(value);
    };

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
                        <Select
                            placeholder="请选择数据持久化方式"
                            value={storageClass}
                            options={storageClassOptions}
                            onChange={onStorageClassChange}
                            style={{ width: `${configSettingWidth}px` }}
                        />
                    </>
                )}
            </div>
        </SectionLayout>
    );
};

export default memo(StorageClassConfig);
