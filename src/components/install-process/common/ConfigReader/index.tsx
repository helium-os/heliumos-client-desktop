import React, { memo } from 'react';
import { Direction } from '@/components/install-process/data';
import useStyles from './style';
export interface IProps {
    className?: string;
    style?: object;
    label: string;
    children?: React.ReactNode;
    direction?: Direction;
    separator?: string;
}

const ConfigReader: React.FC<IProps> = ({
    className = '',
    style,
    label,
    children,
    direction = Direction.Column,
    separator = '：',
}) => {
    const { styles } = useStyles({
        direction,
    });

    return (
        <div className={`${styles.configReaderWrap} ${className}`} style={style}>
            <label className={styles.label}>
                {label}
                {direction === Direction.Row ? separator : ''}
            </label>
            {children && <div className={styles.content}>{children}</div>}
        </div>
    );
};

export default memo(ConfigReader);
