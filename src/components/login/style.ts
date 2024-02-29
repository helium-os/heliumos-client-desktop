import { createStyles } from 'antd-style';

const useStyles = createStyles(({ token, css, prefixCls }) => {
    return {
        loginPageContainer: css`
            .ant-select-selector {
                margin-top: -35px;
                border: 0px solid white !important;
                background: rgba(30, 29, 29, 0.1);
                background-color: rgba(0, 0, 0, 0) !important;
                color: #fff !important;
                height: 0px !important;
                flex-shrink: 0;
                font-size: 14px;
                padding: 0px !important;
            }

            .ant-select-focused .ant-select-selector {
                border-color: rgba(0, 0, 0, 0) !important;
            }
            .ant-select-selection-placeholder {
                color: rgba(255, 255, 255, 0.4);

                font-size: 16px;
                font-style: normal;
                font-weight: 400;
                line-height: 24px;
            }
            .ant-form-item-has-error
                .ant-select:not(.ant-select-disabled):not(.ant-select-customize-input).ant-select-focused
                .ant-select-selector {
                border-color: transparent !important;
                box-shadow: none !important;
            }

            .ant-form-item-has-error
                .ant-select:not(.ant-select-disabled):not(.ant-select-customize-input)
                .ant-select-selector {
                border-color: transparent !important;
                box-shadow: none !important;
            }

            .ant-select:not(.ant-select-disabled):not(.ant-select-customize-input).ant-select-focused
                .ant-select-selector {
                border-color: transparent !important;
                box-shadow: none !important;
            }

            .ant-select:not(.ant-select-disabled).ant-select:not(.ant-select-customize-input) .ant-select-selector {
                height: 22px;
                border-color: transparent !important;
                box-shadow: none !important;
            }

            .ant-select-single:not(.act-select-customize-input)
                .ant-select-selector
                .ant-select-selection-search-input {
                height: 22px !important;
                color: #fff;

                font-size: 16px;
                font-style: normal;
                font-weight: 400;
                line-height: 24px;
                /* 150% */
            }

            .ant-select-single .ant-select-selector .ant-select-selection-search {
                position: absolute;
                top: 0;
                right: 0px;
                bottom: 0;
                left: 0px;
            }

            .ant-select-dropdown {
                border-radius: 8px;
            }

            .ant-select-item-option-selected:not(.ant-select-item-option-disabled) {
                background-color: rgba(238, 238, 238, 1);
                font-weight: normal;
            }

            .ant-select-item {
                margin: 1px 8px;
                border-radius: 4px;
            }
        `,
    };
});

export default useStyles;
