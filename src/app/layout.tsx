import { ReactNode } from 'react';
import type { Metadata } from 'next';
import { unstable_setRequestLocale } from 'next-intl/server';
import { ConfigProvider } from 'antd';
import { theme } from '@/utils/theme';
import { Locale } from '@/config';
import '@/css/reset.css';
import '@/css/main.css';
import '@/css/loading.css';
import StyleRegistry from '@/app/StyleRegistry';
import StoreProvider from '@/app/StoreProvider';
import SpinLayout from './SpinLayout';
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
                        <StyleRegistry>
                            <SpinLayout>{children}</SpinLayout>
                        </StyleRegistry>
                    </ConfigProvider>
                </StoreProvider>
            </body>
        </html>
    );
}
