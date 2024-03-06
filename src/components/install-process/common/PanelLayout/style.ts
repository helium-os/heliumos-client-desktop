import { createStyles } from 'antd-style';

const useStyles = createStyles(({ token, css, cx, prefixCls }) => {
    return {
        panelLayout: css`
            display: flex;
            flex-direction: column;
            height: 100%;
        `,
        content: css`
            position: relative;
            flex: 1;
            overflow: hidden;
            background: #fff;
            box-shadow: 0 0 3px 0 rgba(0, 0, 0, 0.06) inset;
            &:before {
                content: '';
                box-sizing: border-box;
                position: absolute;
                top: 0;
                left: 0;
                width: 200%;
                height: 200%;
                border: 1px solid rgba(0, 0, 0, 0.04);
                border-radius: 20px;
                transform-origin: left top;
                transform: scale(0.5);
                pointer-events: none;
            }
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
