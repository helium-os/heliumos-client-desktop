import { createStyles } from 'antd-style';

const useStyles = createStyles(({ token, css, prefixCls }, props: { readOnly: boolean }) => {
    const fontSize = props.readOnly ? '12px' : '14px';

    const advancedConfigStyle = props.readOnly
        ? css`
              color: rgba(0, 0, 0, 0.3);
          `
        : css`
              color: #007aff;
              cursor: pointer;
          `;

    const storeConfigStyle = props.readOnly
        ? css`
              flex-direction: row;
              gap: 10px;
          `
        : css`
              flex-direction: column;
          `;

    const contentStyle = props.readOnly
        ? css`
              gap: 4px;
          `
        : css`
              margin-top: 8px;
              gap: 8px;
          `;

    return {
        advancedConfig: css`
            margin-top: -8px;
            font-size: 12px;
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
        storeConfig: css`
            display: flex;
            ${storeConfigStyle};
            .title {
                font-size: 12px;
                font-weight: 400;
                color: rgba(0, 0, 0, 0.8);
            }
            .content {
                display: flex;
                align-items: center;
                ${contentStyle};
            }
            .ant-input {
                flex: 1;
                overflow: hidden;
            }
            .value,
            .unit {
                font-size: ${fontSize};
                font-weight: 400;
                color: rgba(0, 0, 0, 0.5);
            }
        `,
    };
});

export default useStyles;
