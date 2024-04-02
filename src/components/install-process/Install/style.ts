import { createStyles, keyframes } from 'antd-style';

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

    const loading = keyframes`
    from {
      transform: rotate(0);
    }
    to{
      transform: rotate(360deg);
    }
  `;

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
        `,
        logDetailList: css`
            padding: 0 20px;
            height: 214px;
            overflow-y: auto;
            & > li {
                display: flex;
                align-items: center;
                gap: 10px;
                margin-bottom: 4px;
                label {
                    width: 300px;
                    font-size: 13px;
                    line-height: 18px;
                    font-weight: 400;
                    color: rgba(0, 0, 0, 0.5);
                }
                .statusIcon {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 18px;
                    height: 18px;
                }
                &.loading {
                    .statusIcon {
                        animation: ${loading} 2s ease infinite;
                    }
                }
            }
        `,
    };
});

export default useStyles;
