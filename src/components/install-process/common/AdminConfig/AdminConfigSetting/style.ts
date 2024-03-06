import { createStyles } from 'antd-style';

const useStyles = createStyles(({ token, css, prefixCls }) => {
    return {
        settingContent: css`
            .ant-input-password-icon {
                font-size: 16px;
                color: rgba(0, 0, 0, 0.5);
            }
        `,
    };
});

export default useStyles;
