import React, { memo } from 'react';
import useStyles from './style';

export enum Direction {
    Row,
    Column,
}

export enum Size {
    Small,
    Default,
    Large,
}
export interface GuideInfo {
    text: string;
    link: string;
}

type IProps = {
    direction?: Direction;
    size?: Size;
    title?: string;
    children?: React.ReactNode;
    guideInfo?: GuideInfo;
    className?: string;
    style?: object;
};
const SectionLayout: React.FC<IProps> = ({
    direction = Direction.Column, // 垂直排列 || 水平排列
    size = Size.Default,
    title,
    children,
    guideInfo,
    className = '',
    style,
}) => {
    const { styles } = useStyles({ direction, size });

    const onOpenUrl = () => {
        (window as any).versions?.openExternal(guideInfo?.link);
    };

    return (
        <div className={`${styles.sectionLayout} ${className || ''}`} style={style}>
            {title && <p className={styles.title}>{title}</p>}
            <div className={styles.content}>{children}</div>
            {guideInfo?.text && (
                <span className={styles.guide} onClick={onOpenUrl}>
                    {guideInfo.text}
                </span>
            )}
        </div>
    );
};

export default memo(SectionLayout);
