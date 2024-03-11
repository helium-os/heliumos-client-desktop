import { AppProps } from 'next/app';
import { Provider } from 'react-redux';
import store from '@/store';
import { ConfigProvider } from 'antd';
import config from '@/antd/config';
import SpinLayout from '@/components/structure/SpinLayout';
import '@/styles/reset.css';
import '@/antd/antd.css';
import '@/styles/main.css';
import '@/styles/loading.css';

export default function App({ Component, pageProps }: AppProps) {
    return (
        <Provider store={store}>
            <ConfigProvider {...config}>
                <SpinLayout>
                    <Component {...pageProps} />
                </SpinLayout>
            </ConfigProvider>
        </Provider>
    );
}
