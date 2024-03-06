import { createStyles } from 'antd-style';

const useStyles = createStyles(({ token, css, cx, prefixCls }) => {
    const halfPxBorder = (borderRadius: string, borderColor: string) => css`
        position: relative;
        border-radius: ${borderRadius};
        &:before {
            content: '';
            box-sizing: border-box;
            position: absolute;
            top: 0;
            left: 0;
            width: 200%;
            height: 200%;
            border: 1px solid ${borderColor};
            border-radius: calc(2 * ${borderRadius});
            transform-origin: top left;
            transform: scale(0.5);
            pointer-events: none;
        }
    `;
    return {
        panelLayout: css`
            display: flex;
            flex-direction: column;
            height: 100%;
        `,
        content: css`
            flex: 1;
            overflow: hidden;
            background: #fff;
            box-shadow: 0 0 3px 0 rgba(0, 0, 0, 0.06) inset;
            ${halfPxBorder('10px', 'rgba(0, 0, 0, 0.06)')};
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
