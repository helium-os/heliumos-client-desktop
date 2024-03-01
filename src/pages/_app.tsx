import { AppProps } from 'next/app';
import { Provider } from 'react-redux';
import store from '@/store';
import { ConfigProvider } from 'antd';
import { theme } from '@/utils/theme';
import SpinLayout from '@/components/structure/SpinLayout';
import '@/css/reset.css';
import '@/css/main.css';
import '@/css/loading.css';

export default function App({ Component, pageProps }: AppProps) {
    return (
        <Provider store={store}>
            <ConfigProvider theme={theme}>
                <SpinLayout>
                    <Component {...pageProps} />
                </SpinLayout>
            </ConfigProvider>
        </Provider>
    );
}
