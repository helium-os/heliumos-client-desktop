import React, { memo } from 'react';
import useStyles from './style';
interface IProps {
    className?: string;
    style?: object;
    children?: React.ReactNode;
}

const BgLayout: React.FC<IProps> = ({ className = '', style, children }) => {
    const { styles } = useStyles();

    return (
        <div className={`${styles.bgLayoutContainer} ${className}`} style={style}>
            {children}
        </div>
    );
};

export default memo(BgLayout);
