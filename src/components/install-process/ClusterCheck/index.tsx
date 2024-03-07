import React, { useState, useEffect, useMemo, memo, useRef } from 'react';
import { Spin, Input, message, Divider } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import PanelLayout from '../common/PanelLayout';
import SectionLayout, { GuideInfo } from '../common/SectionLayout';
import CheckResultItem from './CheckResultItem';
import { useAppDispatch } from '@/store';
import {
    setStorageClassList,
    setServerExposeList,
    setServerIp,
    setOrgId,
    setStoreConfigList,
    setOamStoreConfigList,
} from '@/store/slices/installConfigSlice';
import { checkHasNoPass, keyNameMap, ResultItem, ResultRes } from '@/components/install-process/ClusterCheck/data';
import { BaseTabContentProps, Step } from '@/components/install-process/data.d';
import FooterButtons from '../common/FooterButtons';
import useStyles from './style';

const { TextArea } = Input;

export interface IProps extends BaseTabContentProps {}

const guideInfo: GuideInfo = {
    text: '从哪里获得 Kubeconfig？',
    link: '',
};
const ClusterCheck: React.FC<IProps> = ({ display, onStep, ...restProps }) => {
    const dispatch = useAppDispatch();

    const [messageApi, contextHolder] = message.useMessage();
    const { styles } = useStyles();

    const timerRef = useRef<any>(null);
    const [kubeConfig, setKubeConfig] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const [res, setRes] = useState<ResultRes | null>(null);
    const [checkResults, setCheckResults] = useState<ResultItem[]>([]); // 检验结果
    const [allCheckPass, setAllCheckPass] = useState<boolean>(false); // 是否全部校验通过

    useEffect(() => {
        if (!display) return;

        window.versions
            ?.getDefaultKubeConfig()
            .then((res) => {
                console.log('getDefaultKubeConfig success', res);
                setKubeConfig(res);
            })
            .catch((error) => {
                console.error('getDefaultKubeConfig error', error);
            });
    }, [display]);

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
            setLoading(false);
            return;
        }

        clearTimer();
        timerRef.current = setTimeout(() => {
            setLoading(true);
            setRes(null);
            window.versions
                ?.getClusterConfig(trimKubeConfig)
                .then((res: ResultRes) => {
                    console.log('获取到ClusterConfig', res);
                    setRes(res);
                })
                .catch((error: any) => {
                    console.error('获取ClusterConfig失败', error);
                    messageApi.open({
                        type: 'error',
                        content: error.message,
                    });
                })
                .finally(() => {
                    setLoading(false);
                });
        }, 300);
    }, [kubeConfig, messageApi]);

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
        dispatch(setStorageClassList(storageClasses));

        // 服务暴露方式列表
        dispatch(setServerExposeList(expose));

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
        <>
            {contextHolder}
            <PanelLayout footer={footerButtons} {...restProps}>
                <SectionLayout title="Kubeconfig" guideInfo={guideInfo}>
                    <TextArea className={styles.textarea} rows={6} value={kubeConfig} onChange={onKubeConfigChange} />
                </SectionLayout>
                {loading ? (
                    <div className={styles.spinBox}>
                        <Spin indicator={<LoadingOutlined />} />
                    </div>
                ) : (
                    res && (
                        <>
                            <Divider />
                            <SectionLayout>
                                <div className={styles.clusterCheckResult}>
                                    {checkResults.map((item) => (
                                        <CheckResultItem key={item.id} {...item}></CheckResultItem>
                                    ))}
                                </div>
                            </SectionLayout>
                        </>
                    )
                )}
            </PanelLayout>
        </>
    );
};

export default memo(ClusterCheck);
