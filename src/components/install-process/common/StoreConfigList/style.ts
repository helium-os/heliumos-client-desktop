import { createStyles } from 'antd-style';

const useStyles = createStyles(({ token, css, prefixCls }, props: { readOnly: boolean }) => {
    const advancedConfigStyle = props.readOnly
        ? css`
              color: rgba(0, 0, 0, 0.3);
          `
        : css`
              color: #007aff;
              cursor: pointer;
              &:hover {
                  color: #3395ff;
              }
          `;

    return {
        advancedConfig: css`
            margin-top: -8px;
            font-size: 13px;
            font-weight: 400;
            ${advancedConfigStyle};
            .anticon {
                margin-left: 2px;
                transition: all 0.2s ease;
            }
            &.expand .anticon {
                transform: rotate(180deg);
            }
        `,
        storeConfigListWrap: css`
            overflow: hidden;
        `,
        storeConfigList: css`
            margin-right: -24px;
            display: flex;
            flex-wrap: wrap;
            & > li {
                width: 25%;
                flex: 0 0 auto;
                margin-bottom: 12px;
            }
            .configItem {
                margin-right: 24px;
            }
        `,
        storeConfigReader: css`
            min-width: unset;
        `,
        storeConfigSetting: css`
            .title {
                font-size: 12px;
                font-weight: 400;
                color: rgba(0, 0, 0, 0.8);
            }
            .content {
                margin-top: 8px;
                display: flex;
                align-items: center;
                gap: 8px;
            }
            .ant-input {
                flex: 1;
                overflow: hidden;
            }
            .value,
            .unit {
                font-size: 14px;
                font-weight: 400;
                color: rgba(0, 0, 0, 0.5);
            }
        `,
    };
});

export default useStyles;
