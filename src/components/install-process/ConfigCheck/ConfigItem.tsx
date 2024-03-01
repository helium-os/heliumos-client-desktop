import React, { memo } from 'react';
import useStyles from './style';
import SectionLayout, { Direction } from '../common/SectionLayout';

interface IProps {
    title: string;
    value: string;
}

const ConfigItem: React.FC<IProps> = ({ title, value }) => {
    const { styles } = useStyles();

    return (
        <SectionLayout direction={Direction.Row} title={title}>
            <label className={styles.configItemValue}>{value}</label>
        </SectionLayout>
    );
};

export default memo(ConfigItem);
