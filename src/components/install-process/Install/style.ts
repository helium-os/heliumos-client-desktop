import { createStyles } from 'antd-style';

const useStyles = createStyles(({ token, css, cx, prefixCls }) => {
    const expandIcon = cx(css`
        display: flex;
        align-items: center;
        justify-content: center;
        width: 16px;
        height: 16px;
        margin-right: 4px;
        transform: rotate(-90deg);
        transition: all 0.1s ease;
        .anticon {
            font-size: 12px;
        }
    `);
    return {
        installWrap: css`
            height: 100%;
            display: flex;
            align-items: center;
        `,
        installInner: css`
            flex: 1;
        `,
        installSuccess: css`
            text-align: center;
            font-size: 14px;
            font-weight: 400;
            color: rgba(0, 0, 0, 0.5);
            .anticon {
                display: block;
                margin-bottom: 4px;
                color: #00af1e;
                font-size: 16px;
                font-weight: 400;
            }
        `,
        progressBarBox: css`
            position: relative;
            height: 12px;
            border: 1px solid rgba(0, 0, 0, 0.08);
        `,
        doneBar: css`
            position: absolute;
            top: 0;
            bottom: 0;
            background: #00af1e;
            transition: all 0.1s ease;
        `,
        installLogWrap: css`
            position: relative;
            margin-top: 4px;
        `,
        logTitle: css`
            display: flex;
            align-items: center;
            padding: 2px 0;
            font-size: 14px;
            line-height: 16px;
            font-weight: 400;
            color: rgba(0, 0, 0, 0.5);
            cursor: pointer;
            &.expand {
                .${expandIcon} {
                    transform: rotate(0);
                }
            }
        `,
        expandIcon,
        logDetailWrap: css`
            position: absolute;
            top: 24px;
            left: 0;
            right: 0;
            padding: 8px 0;
            border-radius: 6px;
            border: 1px solid rgba(0, 0, 0, 0.08);
            font-size: 13px;
            font-weight: 400;
            color: rgba(0, 0, 0, 0.5);
        `,
        logDetailInner: css`
            padding: 0 12px;
            max-height: 198px;
            overflow-y: auto;
        `,
    };
});

export default useStyles;
