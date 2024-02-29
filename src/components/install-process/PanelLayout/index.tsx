import React, { memo } from 'react';
import Layout from '@/components/install-process/ContentLayout';
import useStyles from './style';

export interface IProps {
    title: string;
    style?: object;
    children?: React.ReactNode;
    footer?: React.ReactNode;
}
const PanelLayout: React.FC<IProps> = ({ title, style, children, footer }) => {
    const { styles } = useStyles();

    return (
        <div className={styles.panelLayout} style={style}>
            <div className={styles.content}>
                <Layout title={title}>{children}</Layout>
            </div>
            <div className={styles.footer}>{footer}</div>
        </div>
    );
};

export default memo(PanelLayout);
