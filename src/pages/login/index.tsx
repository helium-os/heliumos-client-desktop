import dynamic from 'next/dynamic';

const Login = dynamic(
    () => {
        return import('@/components/login/Login');
    },
    { ssr: false },
);

export default Login;
