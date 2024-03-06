import React, { useMemo, memo } from 'react';
import { Direction } from '@/components/install-process/data.d';
import useStyles from './style';
export interface IProps {
    label: string;
    children?: React.ReactNode;
    direction?: Direction;
}

const ConfigReader: React.FC<IProps> = ({ label, children, direction = Direction.Column }) => {
    const { styles } = useStyles({
        direction,
    });

    return (
        <div className={styles.configReaderWrap}>
            <label className={styles.label}>
                {label}
                {direction === Direction.Row ? '：' : ''}
            </label>
            {children && <div className={styles.content}>{children}</div>}
        </div>
    );
};

export default memo(ConfigReader);
