import { createStyles } from 'antd-style';

const useStyles = createStyles(({ token, css, prefixCls }) => {
    return {
        installGuideContainer: css`
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: url('/background.jpg') no-repeat center;
            background-size: cover;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            & > h2 {
                color: rgba(255, 255, 255, 0.8);
                text-align: center;
                text-shadow: 0 2px 3px rgba(48, 48, 48, 0.06);
                font-size: 32px;
                font-weight: 500;
            }
            & > p {
                margin-top: 2px;
                color: rgba(255, 255, 255, 0.8);
                text-align: center;
                text-shadow: 0 2px 3px rgba(48, 48, 48, 0.06);
                font-size: 15px;
                font-weight: 400;
                opacity: 0.9;
            }
            .ant-btn {
                margin-top: 28px;
            }
        `,
        avatarBox: css`
            position: relative;
            width: 120px;
            height: 120px;
            border-radius: 50%;
            box-shadow: 0 4px 4px 0 rgba(0, 0, 0, 0.25);
            backdrop-filter: blur(0.5px);
        `,
        avatar: css``,
    };
});

export default useStyles;
