import { createStyles } from 'antd-style';

const useStyles = createStyles(({ token, css, cx, prefixCls }) => {
    const verifyContent = cx(css`
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: space-between;
    `);

    const textFontSize = '13px';
    const textLineHeight = '18px';

    const commonVerifyTitle = css`
        flex: 1;
        overflow: hidden;
        font-size: ${textFontSize};
        font-weight: 400;
        line-height: ${textLineHeight};
        color: rgba(0, 0, 0, 0.76);
    `;

    const verifyTitle = cx(commonVerifyTitle);

    return {
        textarea: css`
            resize: none !important;
        `,
        spinBox: css`
            height: 100px;
            display: flex;
            justify-content: center;
            align-items: center;
        `,
        clusterCheckResult: css`
            padding: 12px;
            border-radius: 5px;
            background: rgba(0, 0, 0, 0.02);
            overflow-x: auto;
        `,
        checkResultItem: css`
            display: flex;
            align-items: flex-start;
            margin-bottom: 6px;
            white-space: nowrap;
            &:last-of-type {
                margin-bottom: 0;
            }
            dt {
                margin-right: 16px;
                width: 120px;
                flex: 0 0 auto;
                font-size: ${textFontSize};
                line-height: ${textLineHeight};
                font-weight: 400;
                color: rgba(0, 0, 0, 0.5);
            }
        `,
        verifyWrap: css`
            margin-right: 24px;
            box-sizing: border-box;
            width: 220px;
            flex: 0 0 auto;
            padding: 0 20px;
            display: flex;
            flex-direction: row;
            align-items: center;
            &:last-of-type {
                margin-right: 0;
            }
            &.hasChildren {
                .${verifyTitle} {
                    color: rgba(0, 0, 0, 0.6);
                }
            }
        `,
        verifyContent,
        verifyTitle,
        verifyIcon: css`
            background: #fff;
            img {
                display: block;
            }
        `,
        nodesTable: css`
            .ant-table {
                background: transparent;
            }
            .ant-table-thead > tr > th {
                padding: 0 20px;
                border-bottom: none;
                background: transparent;
                ${commonVerifyTitle};
                &:before {
                    display: none;
                }
            }
            .ant-table-tbody > tr {
                & > td {
                    padding: 2px 0 0;
                    border-bottom: none;
                }
            }
        `,
    };
});

export default useStyles;
