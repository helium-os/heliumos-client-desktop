'use client';
import React, { useState, useEffect, useMemo, useCallback, memo, useRef } from 'react';
import useStyles from './style';
import { Divider, Input, Select } from 'antd';
import PanelLayout from '@/components/installProcess/PanelLayout';
import SectionLayout, { GuideInfo } from '@/components/installProcess/SectionLayout';
import CheckResultItem from './CheckResultItem';
import { RootState, useAppDispatch, useAppSelector } from '@/store';
import {
    setStorageClass,
    setServerExpose,
    setServerIp,
    setOrgId,
    setStoreConfigList,
    setOamStoreConfigList,
} from '@/store/slices/installConfigSlice';
import { getClusterConfig } from '@/app/actions';
import { checkHasNoPass, keyNameMap, ResultItem, ResultRes } from '@/components/installProcess/ClusterCheck/data';
import { BaseTabContentProps, Step } from '@/app/[locale]/install-process/page';
import FooterButtons from '@/components/installProcess/FooterButtons';

const { TextArea } = Input;

interface IProps extends BaseTabContentProps {}

const guideInfo: GuideInfo = {
    text: '从哪里获得 Kubeconfig？',
    link: '',
};
const ClusterCheck: React.FC<IProps> = ({ onStep, ...restProps }) => {
    const dispatch = useAppDispatch();
    const storageClass = useAppSelector((state: RootState) => state.installConfig.storageClass);
    const serverExpose = useAppSelector((state: RootState) => state.installConfig.serverExpose);

    const { styles } = useStyles();

    const timerRef = useRef<any>(null);

    const [kubeConfig, setKubeConfig] = useState<string>('');
    const [res, setRes] = useState<ResultRes | null>(null);
    const [storageClassList, setStorageClassList] = useState<string[]>([]);
    const [serverExposeList, setServerExposeList] = useState<string[]>([]);
    const [checkResults, setCheckResults] = useState<ResultItem[]>([]); // 检验结果
    const [allCheckPass, setAllCheckPass] = useState<boolean>(false); // 是否全部校验通过

    const clearTimer = () => {
        if (timerRef) {
            clearTimeout(timerRef.current);
        }
    };

    useEffect(() => {
        const trimKubeConfig = kubeConfig.trim();
        if (!trimKubeConfig) {
            clearTimer();
            setRes(null);
            return;
        }

        clearTimer();
        timerRef.current = setTimeout(() => {
            getClusterConfig(trimKubeConfig).then((res: ResultRes) => {
                console.log('获取到ClusterConfig', res);
                setRes(res);
            });
        }, 300);
    }, [kubeConfig]);

    useEffect(() => {
        const {
            storageClasses = [],
            expose = [],
            orgId = '',
            baseConfig: { storage: baseStorage } = { storage: {} },
            oamConfig: { storage: oamStorage } = { storage: {} },
            ...rest
        } = res || ({} as ResultRes);

        // StorageClass列表
        setStorageClassList(storageClasses);

        // 服务暴露方式列表
        setServerExposeList(expose);

        // 组织id
        dispatch(setOrgId(orgId));

        // PV存储列表
        const storageConfigList = [];
        for (let [key, value] of Object.entries(baseStorage)) {
            storageConfigList.push({
                id: key,
                defaultValue: value,
            });
        }
        dispatch(setStoreConfigList(storageConfigList));

        // oam存储列表
        const oamStorageConfigList = [];
        for (let [key, value] of Object.entries(oamStorage)) {
            oamStorageConfigList.push({
                id: key,
                defaultValue: value,
            });
        }
        dispatch(setOamStoreConfigList(oamStorageConfigList));

        // 存储公网ip
        dispatch(setServerIp(rest.serverIp?.value || ''));

        // Kubeconfig校验结果
        const newCheckResults: ResultItem[] = [];
        for (const [key, value] of Object.entries(rest)) {
            if (typeof value !== 'object') continue;
            if (Array.isArray(value)) {
                newCheckResults.push({
                    id: key,
                    name: keyNameMap[key],
                    children: value,
                });
            } else {
                newCheckResults.push({
                    id: key,
                    name: keyNameMap[key],
                    ...value,
                });
            }
        }
        setCheckResults(newCheckResults);

        // 检查是否全部通过校验
        setAllCheckPass(!!res && !checkHasNoPass(rest));
    }, [res, dispatch]);

    // 修改StorageClass
    const changeStorageClass = useCallback(
        (storageClass: string) => {
            dispatch(setStorageClass(storageClass));
        },
        [dispatch],
    );

    // StorageClass默认选中第一项
    useEffect(() => {
        if (!storageClassList.length) return;

        changeStorageClass(storageClassList[0]);
    }, [storageClassList, changeStorageClass]);

    // StorageClass下拉菜单Options
    const storageClassOptions = useMemo(
        () => storageClassList.map((value) => ({ value, label: value })),
        [storageClassList],
    );

    // 切换StorageClass
    const onStorageClassChange = (value: string) => {
        changeStorageClass(value);
    };

    // 修改服务暴露方式
    const changeServerExpose = useCallback(
        (serverExpose: string) => {
            dispatch(setServerExpose(serverExpose));
        },
        [dispatch],
    );

    // 服务暴露方式默认选中第一项
    useEffect(() => {
        if (!serverExposeList.length) return;

        changeServerExpose(serverExposeList[0]);
    }, [serverExposeList, changeServerExpose]);

    // 服务暴露方式下拉菜单Options
    const serverExposeOptions = useMemo(
        () => serverExposeList.map((value) => ({ value, label: value })),
        [serverExposeList],
    );

    // 切换StorageClass
    const onServerExposeChange = (value: string) => {
        changeServerExpose(value);
    };

    // 输入的Kubeconfig改变
    const onKubeConfigChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { value } = e.target;
        setKubeConfig(value);
    };

    const footerButtons = useMemo(
        () => (
            <FooterButtons
                cancelButton={{
                    text: '返回',
                    onClick: () => onStep?.(Step.Back),
                }}
                primaryButton={{
                    text: '下一步',
                    disabled: !allCheckPass,
                    onClick: () => onStep?.(Step.Next),
                }}
            />
        ),
        [allCheckPass, onStep],
    );

    return (
        <PanelLayout footer={footerButtons} {...restProps}>
            <SectionLayout title="Kubeconfig" guideInfo={guideInfo}>
                <TextArea className={styles.textarea} rows={6} value={kubeConfig} onChange={onKubeConfigChange} />
            </SectionLayout>
            {res && (
                <>
                    <SectionLayout title="StorageClass">
                        <Select
                            value={storageClass}
                            onChange={onStorageClassChange}
                            style={{ width: '100%' }}
                            options={storageClassOptions}
                        />
                    </SectionLayout>
                    <SectionLayout title="服务暴露方式">
                        <Select
                            value={serverExpose}
                            onChange={onServerExposeChange}
                            style={{ width: '100%' }}
                            options={serverExposeOptions}
                        />
                    </SectionLayout>
                    <Divider />
                    <SectionLayout>
                        <div className={styles.clusterCheckResult}>
                            {checkResults.map((item) => (
                                <CheckResultItem key={item.id} {...item}></CheckResultItem>
                            ))}
                        </div>
                    </SectionLayout>
                </>
            )}
        </PanelLayout>
    );
};

export default memo(ClusterCheck);
