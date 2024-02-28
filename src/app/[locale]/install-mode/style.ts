import { createStyles } from 'antd-style';

const useStyles = createStyles(({ token, css, prefixCls }) => {
    return {
        installGuideContainer: css`
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
        switchModeType: css`
            position: fixed;
            right: 40px;
            bottom: 40px;
            .ant-select-selection-item {
                color: rgba(255, 255, 255, 0.9) !important;
                text-align: right;
                text-shadow: 0 2px 4px rgba(48, 48, 48, 0.06);
                font-size: 13px;
                font-weight: 400;
                line-height: 20px;
            }
            .ant-select-arrow {
                color: rgba(255, 255, 255, 0.9) !important;
            }
            .ant-select-item-option {
                color: rgba(0, 0, 0, 0.76);
            }
        `,
    };
});

export default useStyles;
