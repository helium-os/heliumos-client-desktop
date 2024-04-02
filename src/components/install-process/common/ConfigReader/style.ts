import { createStyles } from 'antd-style';
import { Direction } from '@/components/install-process/data';

const useStyles = createStyles(({ token, css, prefixCls }, props: { direction: Direction }) => {
    const isRow = props.direction === Direction.Row;

    const configReaderWrapStyle = isRow
        ? css`
              display: flex;
              flex-direction: row;
              align-items: center;
              gap: 10px;
          `
        : css``;

    return {
        configReaderWrap: css`
            min-width: 240px;
            font-size: 14px;
            line-height: 20px;
            font-weight: 400;
            ${configReaderWrapStyle};
        `,
        label: css`
            color: rgba(0, 0, 0, 0.8);
        `,
        content: css`
            color: rgba(0, 0, 0, 0.5);
        `,
    };
});

export default useStyles;
