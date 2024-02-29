import { extractStaticStyle, StyleProvider } from 'antd-style';
import Document, { DocumentContext, Head, Html, Main, NextScript } from 'next/document';

class MyDocument extends Document {
    static async getInitialProps(ctx: DocumentContext) {
        // 插入 StyleProvider 进行渲染
        const page = await ctx.renderPage({
            enhanceApp: (App) => (props) => (
                <StyleProvider cache={extractStaticStyle.cache}>
                    <App {...props} />
                </StyleProvider>
            ),
        });

        // 逐一获取页面的静态样式
        const styles = extractStaticStyle(page.html).map((item) => item.style);

        const initialProps = await Document.getInitialProps(ctx);

        return {
            ...initialProps,
            styles: (
                <>
                    {initialProps.styles}
                    {styles}
                </>
            ),
        };
    }

    render() {
        return (
            <Html lang="zh">
                <Head>{this.props.styles}</Head>
                <body>
                    <Main />
                    <NextScript />
                </body>
            </Html>
        );
    }
}

export default MyDocument;
