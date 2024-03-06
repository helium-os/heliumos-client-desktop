export const theme = {
    token: {
        motion: false,
        fontFamily: 'PingFang SC',
        colorText: 'rgba(0, 0, 0, 0.8)',
    },
    components: {
        Button: {
            controlHeight: 36,
            borderRadius: 5,
            defaultBorderColor: 'rgba(0, 0, 0, 0.30)',
            defaultColor: 'rgba(0, 0, 0, 0.9)',
            defaultShadow: 'none',
            defaultHoverBg: 'rgba(0, 0, 0, 0.06)',
            defaultHoverBorderColor: 'rgba(0, 0, 0, 0.06)',
            defaultHoverColor: 'rgba(0, 0, 0, 0.9)',
            colorPrimary: '#007AFF',
            primaryShadow: 'none',
            colorPrimaryHover: '#3395FF',
        },
        Input: {
            paddingBlock: 8,
            paddingInline: 12,
            borderRadius: 5,
            colorBorder: 'rgba(0, 0, 0, 0.12)',
            activeBorderColor: '#007AFF',
            activeShadow: '0 1px 6px 0 rgba(0, 122, 255, 0.07)',
            hoverBorderColor: 'none',
            hoverShadow: '0 1px 6px 0 rgba(0, 0, 0, 0.07)',
        },
        Select: {
            colorBorder: 'rgba(0, 0, 0, 0.12)',
            colorPrimaryHover: 'rgba(0, 0, 0, 0.12)',
            controlOutline: 'none',
            optionLineHeight: '20px',
            optionPadding: '6px 8px',
            optionActiveBg: 'rgba(0, 0, 0, 0.06)',
            optionSelectedBg: 'rgba(0, 0, 0, 0.08)',
            optionSelectedFontWeight: 400,
            paddingXXS: 8,
        },
        Table: {},
        Carousel: {},
        Divider: {
            colorSplit: 'rgba(0, 0, 0, 0.08)',
            marginLG: 12,
        },
    },
};

const config = {
    theme,
};
export default config;
