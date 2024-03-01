import { createStyles } from 'antd-style';

const useStyles = createStyles(({ token, css, prefixCls }) => {
    return {
        configItemValue: css`
            margin-left: 10px;
            font-size: 13px;
            font-weight: 400;
            color: rgba(0, 0, 0, 0.5);
        `,
    };
});

export default useStyles;
