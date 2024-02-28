'use client';
import React, { useState, useEffect, useMemo, useCallback, memo } from 'react';
import { Input } from 'antd';
import { StoreConfigItem } from '@/components/structure/StoreConfigList/index';
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
        <div className={styles.storeConfig}>
            <label className="title">{id}</label>
            <div className="content">
                {readOnly ? (
                    <label className="value">{value || defaultValue}</label>
                ) : (
                    <Input placeholder={defaultValue + ''} value={value} onChange={onValueChange} />
                )}
                <label className="unit">Gi</label>
            </div>
        </div>
    );
};

export default memo(StoreConfig);
