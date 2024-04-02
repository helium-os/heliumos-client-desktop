import { createStyles } from 'antd-style';

const useStyles = createStyles(({ token, css, prefixCls }, props: { readOnly: boolean }) => {
    const gap = props.readOnly ? '60px' : '12px';

    return {
        storageClassContent: css`
            display: flex;
            gap: ${gap};
            .ant-select {
                flex: none;
            }
        `,
    };
});

export default useStyles;
