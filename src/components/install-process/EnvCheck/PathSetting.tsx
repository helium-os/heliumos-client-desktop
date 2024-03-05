import React, { useState, useEffect, useMemo, useCallback, useRef, memo } from 'react';
import { Input, Upload, message } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import SectionLayout, { GuideInfo } from '../common/SectionLayout';
import useStyles from './style';
import SuccessFilledIcon from '@/components/common/icon/SuccsssFilled';
import FailFilledIcon from '@/components/common/icon/FailFilled';
import { BaseEnvItem } from '@/components/install-process/EnvCheck/index';

type VersionAndPassChangeFn = (id: string, version: string, pass: boolean) => void;

interface IProps extends BaseEnvItem {
    onVersionAndPassChange?: VersionAndPassChangeFn;
}

const PathSetting: React.FC<IProps> = ({ id, name, installLink, onVersionAndPassChange = null }) => {
    const { styles } = useStyles();

    const [messageApi, contextHolder] = message.useMessage();

    const timerRef = useRef<any>(null);

    const onVersionAndPassChangeRef = useRef<VersionAndPassChangeFn | null>(null);

    const [path, setPath] = useState<string>('');

    const [loading, setLoading] = useState<boolean>(false);
    const [version, setVersion] = useState<string>('');
    const [pass, setPass] = useState<boolean>(false); // 是否校验通过

    const clearTimer = () => {
        if (timerRef) {
            clearTimeout(timerRef.current);
            setLoading(false);
        }
    };

    // 自动获取path
    useEffect(() => {
        if (!id) return;

        window.versions
            ?.getBinaryPathAndVersion(id)
            .then((res) => {
                console.log('getBinaryPathAndVersion ', id, 'res', res);
                const { path } = res;
                setPath(path);
            })
            .catch((error) => {
                console.error('getBinaryPathAndVersion error', error, id);
            });
    }, [id]);

    // path改变后，重新获取版本号 & 是否校验通过
    useEffect(() => {
        if (!path) {
            setVersion('');
            setPass(false);
            clearTimer();
            return;
        }

        clearTimer();
        timerRef.current = setTimeout(async () => {
            setLoading(true);
            try {
                const res = await window.versions?.getBinaryVersion(path, id);
                console.log('getBinaryVersion请求成功', res);
                const { version, pass } = res;
                setVersion(version);
                setPass(pass);
            } catch (error: any) {
                console.error('getBinaryVersion请求失败 error', error);
                setVersion('');
                setPass(false);
                messageApi.open({
                    type: 'error',
                    content: error.message,
                });
            }
            setLoading(false);
        }, 300);
    }, [path, id, messageApi]);

    useEffect(() => {
        onVersionAndPassChangeRef.current = onVersionAndPassChange;
    }, [onVersionAndPassChange]);

    useEffect(() => {
        onVersionAndPassChangeRef.current?.(id, version, pass);
    }, [id, version, pass]);

    const onInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { value } = e.target;
        setPath(value.trim());
    };

    const beforeUpload = (file: any) => {
        setPath(file.path);
        return false;
    };

    const suffix = useMemo(() => {
        if (loading) return <LoadingOutlined />;

        if (path && version) {
            return (
                <div className={`${styles.versionCheckBox} ${pass ? 'pass' : 'not-pass'}`}>
                    {version}
                    {pass ? <SuccessFilledIcon /> : <FailFilledIcon />}
                </div>
            );
        }

        return null;
    }, [loading, path, version, pass, styles]);

    return (
        <>
            {contextHolder}
            <SectionLayout
                title={`${name} 所在路径`}
                guideInfo={
                    {
                        text: `如何安装 ${name}？`,
                        link: installLink,
                    } as GuideInfo
                }
            >
                <div className={styles.pathSettingWrap}>
                    <div className={`${styles.inputBox} ${version ? 'hasVersion' : ''}`}>
                        <Input placeholder={`请输入${name} 所在路径`} value={path} onChange={onInputChange} />
                        <div className={styles.suffix}>{suffix}</div>
                    </div>
                    <Upload beforeUpload={beforeUpload} showUploadList={false}>
                        <div className={styles.uploadBtn}>
                            <span className="dot" />
                            <span className="dot" />
                            <span className="dot" />
                        </div>
                    </Upload>
                </div>
            </SectionLayout>
        </>
    );
};

export default memo(PathSetting);
