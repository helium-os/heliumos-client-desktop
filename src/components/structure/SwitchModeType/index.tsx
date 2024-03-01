import React, { useState, useEffect } from 'react';
import { Select } from 'antd';
import { ModeType } from '@/utils/data';
import useStyles from './style';

const modeTypeOptions = [
    {
        value: ModeType.Normal,
        label: '普通用户模式',
    },
    {
        value: ModeType.Install,
        label: '安装模式',
    },
];

interface IProps {
    defaultModeType: ModeType;
    orgId?: string;
}

const SwitchModeType: React.FC<IProps> = ({ defaultModeType, orgId }) => {
    const { styles } = useStyles();

    const [modeType, setModeType] = useState<ModeType>(defaultModeType);

    const onModeTypeChange = (value: ModeType) => {
        setModeType(value);

        switch (value) {
            case ModeType.Normal:
                window.versions?.switchModeType(value, orgId);
                break;
            case ModeType.Install:
                window.versions?.switchModeType(value);
                break;
        }
    };

    return (
        <div className={styles.switchModeType}>
            <Select
                style={{ width: '120px' }}
                value={modeType}
                onChange={onModeTypeChange}
                options={modeTypeOptions}
                variant="borderless"
            />
        </div>
    );
};

export default SwitchModeType;
