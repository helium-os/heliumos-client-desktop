import { createStyles } from 'antd-style';

const useStyles = createStyles(({ token, css, cx, prefixCls }) => {
    const orderIcon = cx(css`
        display: inline-block;
        width: 9px;
        height: 9px;
        border-radius: 50%;
        background: rgba(0, 0, 0, 0.08);
    `);

    return {
        installProcessContainer: css`
          position: relative;
            box-sizing: border-box;
            width: 100vw;
            height: 100vh;
            display: flex;
            flex-direction: column;
            padding: 26px 40px 0 0;
            background: linear-gradient(
                    112deg,
                    rgba(213, 221, 248, 0.3) 1.25%,
                    rgba(226, 227, 249, 0.3) 34.01%,
                    rgba(237, 231, 240, 0.3) 61.83%,
                    rgba(242, 234, 232, 0.3) 98.93%
                );
                rgba(255, 255, 255, 0.97);
            backdrop-filter: blur(20px);
        `,
        closeBtn: css`
            position: absolute;
            top: 4px;
            right: 11px;
            cursor: pointer;
        `,
        mainContent: css`
            flex: 1;
            overflow: hidden;
            display: flex;
            gap: 20px;
        `,
        leftPanel: css`
            width: 197px;
            padding: 20px;
        `,
        tabList: css`
            li {
                display: flex;
                align-items: center;
                margin: 5px 0;
                padding: 0 10px;
                color: rgba(0, 0, 0, 0.5);
                font-size: 15px;
                font-weight: 400;
                &.active {
                    color: #007aff;
                    .${orderIcon} {
                        background: #007aff;
                    }
                }
            }
        `,
        orderIconBox: css`
            display: flex;
            justify-content: center;
            align-items: center;
            width: 30px;
            height: 30px;
            margin-right: 2px;
        `,
        orderIcon,
        rightPanel: css`
            flex: 1;
            overflow: hidden;
            display: flex;
            flex-direction: column;
        `,
        content: css`
            flex: 1;
            overflow: hidden;
            border-radius: 10px;
            border: 0.5px solid rgba(0, 0, 0, 0.04);
            background: #fff;
            box-shadow: 0 0 3px 0 rgba(0, 0, 0, 0.06) inset;
            .sectionArea {
                padding: 12px 0;
            }
        `,
        footer: css`
            display: flex;
            justify-content: flex-end;
            gap: 12px;
            padding: 20px 0;
            .ant-btn-primary:disabled {
                background: #007aff;
                opacity: 0.3;
                color: #fff;
            }
        `,
    };
});

export default useStyles;
