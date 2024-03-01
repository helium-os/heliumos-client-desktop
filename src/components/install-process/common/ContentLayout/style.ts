import { createStyles } from 'antd-style';

const useStyles = createStyles(({ token, css, prefixCls }) => {
    return {
        contentLayout: css`
            display: flex;
            flex-direction: column;
            box-sizing: border-box;
            height: 100%;
            padding-bottom: 10px;
        `,
        title: css`
            padding: 20px 24px;
            font-size: 20px;
            font-weight: 600;
            color: rgba(0, 0, 0, 0.9);
        `,
        content: css`
            flex: 1;
            overflow: auto;
            padding: 0 24px 20px;
        `,
    };
});

export default useStyles;
