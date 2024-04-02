import React, { memo } from 'react';
import { Input } from 'antd';
import { StoreConfigItem } from '@/components/install-process/common/StoreConfigList/index';
import ConfigReader from '@/components/install-process/common/ConfigReader';
import { Direction } from '@/components/install-process/data';
import useStyles from './style';

interface IProps extends StoreConfigItem {
    readOnly: boolean;
    onChange: (id: string, value: string) => void;
}

const StoreConfig: React.FC<IProps> = ({ readOnly, id, defaultValue, value, onChange }) => {
    const { styles } = useStyles({ readOnly });

    const onValueChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { value } = e.target;
        onChange(id, value);
    };

    return (
        <>
            {readOnly ? (
                <ConfigReader className={styles.storeConfigReader} label={id} direction={Direction.Row} separator=":">
                    {value || defaultValue}Gi
                </ConfigReader>
            ) : (
                <div className={styles.storeConfigSetting}>
                    <label className="title">{id}</label>
                    <div className="content">
                        <Input placeholder={defaultValue + ''} value={value} onChange={onValueChange} />
                        <label className="unit">Gi</label>
                    </div>
                </div>
            )}
        </>
    );
};

export default memo(StoreConfig);
