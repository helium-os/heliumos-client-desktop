import { createStyles } from 'antd-style';

const useStyles = createStyles(({ token, css, prefixCls }) => {
    return {
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
