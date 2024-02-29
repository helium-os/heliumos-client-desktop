import { createStyles } from 'antd-style';
import { Direction } from '@/components/install-process/SectionLayout/index';

const useStyles = createStyles(({ token, css, prefixCls }, props: { direction: Direction }) => {
    const isRow = props.direction === Direction.Row;

    const sectionLayoutStyle = isRow
        ? css`
              display: flex;
              align-items: center;
          `
        : '';

    const contentStyle = isRow
        ? ''
        : css`
              margin-top: 8px;
          `;

    return {
        sectionLayout: css`
            ${sectionLayoutStyle};
            padding: 12px 0;
        `,
        title: css`
            font-size: 14px;
            font-weight: 400;
            color: rgba(0, 0, 0, 0.8);
        `,
        content: css`
            ${contentStyle};
        `,
        guide: css`
            margin-top: 8px;
            font-size: 13px;
            font-weight: 400;
            text-decoration-line: underline;
            color: rgba(0, 0, 0, 0.5);
            cursor: pointer;
        `,
    };
});

export default useStyles;
