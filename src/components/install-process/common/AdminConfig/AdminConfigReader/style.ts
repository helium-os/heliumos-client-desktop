import { createStyles } from 'antd-style';

const useStyles = createStyles(({ token, css, prefixCls }) => {
    return {
        passwordContent: css`
            display: flex;
            align-items: center;
            gap: 12px;
        `,
        encryptionPwdBox: css`
            display: inline-flex;
            gap: 2px;
            li {
                width: 8px;
                height: 8px;
                border-radius: 50%;
                background: rgba(0, 0, 0, 0.5);
            }
        `,
        encryptionIcon: css`
            cursor: pointer;
            .anticon {
                font-size: 16px;
            }
        `,
    };
});

export default useStyles;
