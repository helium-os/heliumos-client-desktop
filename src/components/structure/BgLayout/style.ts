import { createStyles } from 'antd-style';

const useStyles = createStyles(({ token, css, prefixCls }) => {
    return {
        bgLayoutContainer: css`
            position: relative;
            width: 100vw;
            height: 100vh;
            background: url('/background.jpg') no-repeat center;
            background-size: cover;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            text-shadow: 0 2px 3px rgba(48, 48, 48, 0.06);
        `,
    };
});

export default useStyles;
