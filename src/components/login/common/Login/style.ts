import { createStyles } from 'antd-style';

const useStyles = createStyles(({ token, css, prefixCls }) => {
    return {
        loginWrap: css`
            min-height: 438px;
            font-size: 18px;
            color: #414b55;
            line-height: 28px;
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            justify-content: flex-start;
            gap: 32px;
            .ant-form-item {
                margin-bottom: 0;
            }
        `,

        accountTitle: css`
            margin-bottom: 4px;
            color: #fff;

            font-size: 24px;
            font-style: normal;
            font-weight: 500;
            line-height: 32px;
        `,

        accountContent: css`
            width: 100%;
            color: rgba(255, 255, 255, 0.8);

            font-size: 16px;
            font-style: normal;
            font-weight: 400;
            line-height: 24px;
        `,
        loginButton: css`
            border: 0px solid black !important;
            background: rgba(255, 255, 255, 1) !important;
            width: 295px;
            height: 48px;
            flex-shrink: 0;
            border-radius: 10px;
            z-index: 10;
            box-shadow: none;
            color: #151515;
            text-align: center;

            font-size: 16px;
            font-style: normal;
            font-weight: 600;
            line-height: normal;
            cursor: pointer;
            &:disabled {
                opacity: 0.3;
                background: #fff;
                color: #151515;
                text-align: center;
                cursor: default;
            }
        `,
        switchList: css`
            & > li > a {
                font-size: 12px;
                font-weight: 400;
                line-height: 16px;
                text-decoration-line: underline;
                color: #fff;
            }
        `,
    };
});

export default useStyles;
