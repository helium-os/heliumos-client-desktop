import React, { memo } from 'react';
import useStyles from './style';

type IProps = {
    title: string;
    style?: object;
    children?: React.ReactNode;
};
const Layout: React.FC<IProps> = ({ title, style, children }) => {
    const { styles } = useStyles();

    return (
        <div className={styles.contentLayout} style={style}>
            <h2 className={styles.title}>{title}</h2>
            <div className={styles.content}>{children}</div>
        </div>
    );
};

export default memo(Layout);
