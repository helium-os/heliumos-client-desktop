import React, { memo } from 'react';
import ContentLayout from '../ContentLayout';
import useStyles from './style';

export interface IProps {
    className?: string;
    style?: object;
    title: string;
    children?: React.ReactNode;
    footer?: React.ReactNode;
}
const PanelLayout: React.FC<IProps> = ({ className = '', style, title, children, footer }) => {
    const { styles } = useStyles();

    return (
        <div className={`${styles.panelLayout} ${className}`} style={style}>
            <div className={styles.content}>
                <ContentLayout title={title}>{children}</ContentLayout>
            </div>
            <div className={styles.footer}>{footer}</div>
        </div>
    );
};

export default memo(PanelLayout);
