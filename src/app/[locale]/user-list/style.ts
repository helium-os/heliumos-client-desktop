import { createStyles } from 'antd-style';

const useStyles = createStyles(({ token, css, prefixCls }) => {
    return {
        userListContainer: css`
            flex-direction: row !important;
        `,
    };
});

export default useStyles;
