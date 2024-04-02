import { createStyles } from 'antd-style';

const useStyles = createStyles(({ token, css, prefixCls }) => {
    return {
        installConfigContent: css`
            .ant-form-item {
                margin-bottom: 0;
            }
        `,
    };
});

export default useStyles;
