'use client';
import React, { memo } from 'react';
import useStyles from './style';

export enum Direction {
    Row,
    Column,
}
export interface GuideInfo {
    text: string;
    link: string;
}

type IProps = {
    direction?: Direction;
    title?: string;
    children?: React.ReactNode;
    guideInfo?: GuideInfo;
    className?: string;
    style?: object;
};
const SectionLayout: React.FC<IProps> = ({
    direction = Direction.Column, // 垂直排列 || 水平排列
    title,
    children,
    guideInfo,
    className,
    style,
}) => {
    const { styles } = useStyles({ direction });

    const onOpenUrl = () => {
        (window as any).versions?.openExternal(guideInfo?.link);
    };

    return (
        <div className={`${styles.sectionLayout} ${className || ''}`} style={style}>
            {title && <p className={styles.title}>{title}</p>}
            <div className={styles.content}>{children}</div>
            {guideInfo?.text && (
                <p className={styles.guide} onClick={onOpenUrl}>
                    {guideInfo.text}
                </p>
            )}
        </div>
    );
};

export default memo(SectionLayout);
