import { createStyles } from 'antd-style';

const useStyles = createStyles(({ token, css, cx, prefixCls }) => {
    return {
        panelLayout: css`
            display: flex;
            flex-direction: column;
            height: 100%;
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
