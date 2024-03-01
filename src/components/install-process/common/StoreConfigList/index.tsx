import React, { useState, useMemo, useCallback, memo } from 'react';
import SectionLayout from '../SectionLayout';
import StoreConfig from './StoreConfig';
import DownOutlinedIcon from '@/components/common/icon/DownOutlined';
import { RootState, useAppDispatch, useAppSelector } from '@/store';
import { setStoreConfigList, setOamStoreConfigList } from '@/store/slices/installConfigSlice';
import useStyles from './style';

export enum ModeType {
    Read,
    Write,
}
interface IProps {
    type: ModeType;
}

export interface StoreConfigItem {
    id: string;
    defaultValue: string;
    value?: string;
}

const StoreConfigList: React.FC<IProps> = ({ type }) => {
    const dispatch = useAppDispatch();
    const storeConfigList = useAppSelector((state: RootState) => state.installConfig.storeConfigList);
    const oamStoreConfigList = useAppSelector((state: RootState) => state.installConfig.oamStoreConfigList);

    const readOnly = useMemo(() => type === ModeType.Read, [type]);

    const { styles } = useStyles({ readOnly });

    const [expand, setExpand] = useState<boolean>(readOnly); // 高级配置是否展开

    // 展开收起高级配置
    const onToggleExpand = () => {
        if (readOnly) return;

        setExpand((state) => !state);
    };

    // PV存储设置更改
    const changeStoreConfigList = useCallback(
        (storeList: StoreConfigItem[]) => {
            dispatch(setStoreConfigList(storeList));
        },
        [dispatch],
    );
    const onStoreChange = useCallback(
        (id: string, value: string) => {
            const newStoreList = [...storeConfigList];
            const index = newStoreList.findIndex((item) => item.id === id);
            if (index === -1) return;

            newStoreList.splice(index, 1, {
                ...newStoreList[index],
                value,
            });

            changeStoreConfigList(newStoreList);
        },
        [storeConfigList, changeStoreConfigList],
    );

    // oam存储设置更改
    const changeOamStoreConfigList = useCallback(
        (storeList: StoreConfigItem[]) => {
            dispatch(setOamStoreConfigList(storeList));
        },
        [dispatch],
    );
    const onOamStoreChange = useCallback(
        (id: string, value: string) => {
            const newStoreList = [...oamStoreConfigList];
            const index = newStoreList.findIndex((item) => item.id === id);
            if (index === -1) return;

            newStoreList.splice(index, 1, {
                ...newStoreList[index],
                value,
            });

            changeOamStoreConfigList(newStoreList);
        },
        [oamStoreConfigList, changeOamStoreConfigList],
    );

    return (
        <div>
            <SectionLayout>
                <div className={`${styles.advancedConfig} ${expand ? 'expand' : ''}`} onClick={onToggleExpand}>
                    高级配置
                    {!readOnly && <DownOutlinedIcon />}
                </div>
            </SectionLayout>
            <SectionLayout title="存储PV" style={{ display: expand ? 'block' : 'none' }}>
                <div className={styles.storeConfigListWrap}>
                    <ul className={styles.storeConfigList}>
                        {storeConfigList.map((item) => (
                            <li key={item.id}>
                                <div className="configItem">
                                    <StoreConfig
                                        readOnly={readOnly}
                                        key={item.id}
                                        id={item.id}
                                        defaultValue={item.defaultValue}
                                        value={item.value}
                                        onChange={onStoreChange}
                                    />
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            </SectionLayout>
            <SectionLayout title="OAM" style={{ display: expand ? 'block' : 'none' }}>
                <div className={styles.storeConfigListWrap}>
                    <ul className={styles.storeConfigList}>
                        {oamStoreConfigList.map((item) => (
                            <li key={item.id}>
                                <div className="configItem">
                                    <StoreConfig
                                        readOnly={readOnly}
                                        key={item.id}
                                        id={item.id}
                                        defaultValue={item.defaultValue}
                                        value={item.value}
                                        onChange={onOamStoreChange}
                                    />
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            </SectionLayout>
        </div>
    );
};

export default memo(StoreConfigList);
