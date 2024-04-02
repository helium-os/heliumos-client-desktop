import { GetStaticProps, GetStaticPaths } from 'next';
import dynamic from 'next/dynamic';
import { LoginType, loginTypes } from '@/components/login/data';

const Login = dynamic(
    () => {
        return import('@/components/login');
    },
    { ssr: false },
);

export default Login;

export const getStaticPaths: GetStaticPaths = async () => {
    const pathsWithParams = loginTypes.map((item: LoginType) => ({ params: { type: item } }));

    return {
        paths: pathsWithParams,
        fallback: false,
    };
};

export const getStaticProps: GetStaticProps = async (context) => {
    return {
        props: {
            loginType: context.params?.type, // 登录方式 alias-通过组织别名登录  ip-通过ip登录
        },
    };
};
