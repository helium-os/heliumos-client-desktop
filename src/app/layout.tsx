import { ReactNode } from 'react';
import type { Metadata } from 'next';
import { unstable_setRequestLocale } from 'next-intl/server';
import { ConfigProvider } from 'antd';
import { theme } from '@/utils/theme';
import { Locale } from '@/config';
import './reset.css';
import StyleRegistry from '@/app/StyleRegistry';
import StoreProvider from '@/app/StoreProvider';
type Props = {
    children: ReactNode;
    params: { locale: Locale };
};

export const metadata: Metadata = {
    title: 'HeliumOS',
    description: '',
};

export default function RootLayout({ children, params: { locale } }: Props) {
    unstable_setRequestLocale(locale);

    return (
        <html lang={locale}>
            <body>
                <StoreProvider>
                    <ConfigProvider theme={theme}>
                        <StyleRegistry>{children}</StyleRegistry>
                    </ConfigProvider>
                </StoreProvider>
            </body>
        </html>
    );
}
