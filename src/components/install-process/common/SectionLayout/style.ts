import { createStyles } from 'antd-style';
import { Direction, Size } from '@/components/install-process/common/SectionLayout/index';

const useStyles = createStyles(({ token, css, cx, prefixCls }, props: { direction: Direction; size: Size }) => {
    const isRow = props.direction === Direction.Row;

    const sectionLayoutStyle = isRow
        ? css`
              display: flex;
              align-items: center;
          `
        : '';

    let titleStyle, contentStyle;
    switch (props.size) {
        case Size.Large:
            titleStyle = css`
                font-size: 15px;
                line-height: 21px;
                font-weight: 500;
                color: rgba(0, 0, 0, 0.9);
            `;
            contentStyle = css`
                margin-top: 12px;
            `;
            break;
        case Size.Small:
        case Size.Default:
            titleStyle = css`
                font-size: 14px;
                line-height: 20px;
                font-weight: 400;
                color: rgba(0, 0, 0, 0.8);
            `;
            contentStyle = css`
                margin-top: 6px;
            `;
            break;
    }

    if (isRow) {
        contentStyle = css``;
    }

    return {
        sectionLayout: css`
            ${sectionLayoutStyle};
            padding: 12px 0;
        `,
        title: titleStyle,
        content: contentStyle,
        guide: css`
            display: inline-block;
            margin-top: 8px;
            font-size: 13px;
            font-weight: 400;
            text-decoration-line: underline;
            color: rgba(0, 0, 0, 0.5);
            cursor: pointer;
            &:hover {
                color: rgba(0, 0, 0, 0.8);
            }
        `,
    };
});

export default useStyles;
