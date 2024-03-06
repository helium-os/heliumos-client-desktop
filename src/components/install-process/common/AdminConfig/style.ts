import { createStyles } from 'antd-style';
import { configSettingWidth } from '@/components/install-process/data.d';

const useStyles = createStyles(({ token, css, prefixCls }, props: { readOnly: boolean }) => {
    const adminConfigContentStyle = props.readOnly
        ? css`
              display: flex;
              flex-direction: row;
              align-items: center;
              gap: 60px;
          `
        : css``;

    return {
        adminConfigContent: css`
            ${adminConfigContentStyle};
            .ant-input,
            .ant-input-password {
                width: ${configSettingWidth}px;
            }
        `,
        passwordIcon: css`
            cursor: pointer;
            .anticon {
                font-size: 18px;
                color: rgba(0, 0, 0, 0.5);
            }
        `,
    };
});

export default useStyles;
