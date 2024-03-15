import dynamic from 'next/dynamic';

const Login = dynamic(
    () => {
        return import('@/components/login');
    },
    { ssr: false },
);

export default Login;
