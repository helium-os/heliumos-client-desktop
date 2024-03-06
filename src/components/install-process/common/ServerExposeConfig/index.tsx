import React, { useEffect, useMemo, useCallback, memo } from 'react';
import { Form, Select } from 'antd';
import SectionLayout, { Size } from '../SectionLayout';
import ConfigReader from '@/components/install-process/common/ConfigReader';
import { RootState, useAppDispatch, useAppSelector } from '@/store';
import { setServerExpose } from '@/store/slices/installConfigSlice';
import { configSettingWidth } from '@/components/install-process/data.d';
import useStyles from './style';
export interface IProps {
    readOnly: boolean;
}

const serverExposeLabelMap: { [key: string]: string } = {
    loadBalancer: '创建新的 LoadBalancer',
};

const ServerExposeConfig: React.FC<IProps> = ({ readOnly }) => {
    const { styles } = useStyles();

    const dispatch = useAppDispatch();
    const serverExposeList = useAppSelector((state: RootState) => state.installConfig.serverExposeList);
    const serverExpose = useAppSelector((state: RootState) => state.installConfig.serverExpose);

    // 服务暴露方式下拉菜单Options
    const serverExposeOptions = useMemo(
        () => serverExposeList.map((value) => ({ value, label: serverExposeLabelMap[value] })),
        [serverExposeList],
    );

    const serverExposeLabel = serverExposeOptions.find((item) => item.value === serverExpose)?.label || '';

    // 修改store 服务暴露方式
    const changeServerExpose = useCallback(
        (serverExpose: string) => {
            dispatch(setServerExpose(serverExpose));
        },
        [dispatch],
    );

    // 服务暴露方式默认选中第一项
    useEffect(() => {
        changeServerExpose(serverExposeList[0]);
    }, [serverExposeList, changeServerExpose]);

    // 点击切换服务暴露方式
    const onServerExposeChange = (value: string) => {
        changeServerExpose(value);
    };

    return (
        <SectionLayout title="服务暴露方式" size={Size.Large}>
            {readOnly ? (
                <ConfigReader label={serverExposeLabel} />
            ) : (
                <Select
                    value={serverExpose}
                    options={serverExposeOptions}
                    onChange={onServerExposeChange}
                    style={{ width: `${configSettingWidth}px` }}
                />
            )}
        </SectionLayout>
    );
};

export default memo(ServerExposeConfig);
