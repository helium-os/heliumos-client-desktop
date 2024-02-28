import { createStyles } from 'antd-style';

const useStyles = createStyles(({ token, css, prefixCls }) => {
    return {
        envList: css`
            & > li {
            }
        `,
        pathSettingWrap: css`
            display: flex;
            align-items: center;
            gap: 8px;
            .ant-input {
                line-height: 20px;
            }
        `,
        inputBox: css`
            flex: 1;
            overflow: hidden;
            position: relative;
            &.hasVersion .ant-input {
                padding-right: 90px;
            }
        `,
        suffix: css`
            position: absolute;
            right: 12px;
            top: 50%;
            transform: translate(0, -50%);
        `,
        versionCheckBox: css`
            text-align: right;
            font-size: 13px;
            font-weight: 400;
            color: rgba(0, 0, 0, 0.76);
            .anticon {
                margin-left: 8px;
                font-size: 14px;
            }
            &.pass .anticon {
                color: #00af1e;
            }
            &.not-pass .anticon {
                color: #d33d3e;
            }
        `,
        uploadBtn: css`
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 3px;
            width: 36px;
            height: 36px;
            border-radius: 6px;
            border: 1px solid ${token.Input.colorBorder};
            cursor: pointer;
            .dot {
                width: 2px;
                height: 2px;
                border-radius: 50%;
                background: rgba(0, 0, 0, 0.5);
            }
            &:hover {
                .dot {
                    background: rgba(0, 0, 0, 0.8);
                }
            }
        `,
    };
});

export default useStyles;
