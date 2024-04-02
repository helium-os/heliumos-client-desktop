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
            align-items: center;
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
                display: block; // 为了解决外层div高度 > icon自身高度的问题
                font-size: 16px;
                &:hover {
                    color: rgba(0, 0, 0, 0.8);
                }
            }
        `,
    };
});

export default useStyles;
