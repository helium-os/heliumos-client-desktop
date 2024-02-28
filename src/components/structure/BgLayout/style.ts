import { createStyles } from 'antd-style';

const useStyles = createStyles(({ token, css, prefixCls }) => {
    return {
        bgLayoutContainer: css`
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
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
