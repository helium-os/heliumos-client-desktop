import React, { useState, memo } from 'react';
import { useRouter } from 'next/router';
import { Form, message } from 'antd';
import { LoginType, loginTypeMap } from '@/components/login/data';
import Login from '@/components/login/Login';
const { pageToPathMap } = require('../../../../util/path.ts');

const loginType = LoginType.Ip;
const switchList = [loginTypeMap[LoginType.Alias]];
const LoginByIp = () => {
    const router = useRouter();

    const [messageApi, contextHolder] = message.useMessage();

    const [spinning, setSpinning] = useState<boolean>(false);
    const onFinish = async (values: any) => {
        const { ip } = values;
        if (!ip || spinning) return;

        setSpinning(true);

        try {
            const env = `custom@${ip}`;
            await window.versions?.setEnv(env);
            const { alias } = await window.versions?.runProxy(env);

            const { id: orgId, alias: orgAlias } = alias[0] || {};
            await window.versions?.setuserInfo({
                org: orgAlias,
                orgId,
                name: null,
                username: null,
                autoLogin: null,
            });

            window.versions?.loadKeycloakLogin(orgId);
        } catch (error: any) {
            messageApi.open({
                type: 'error',
                content: error.message,
            });
        }

        setSpinning(false);
    };

    const onSwitchLoginType = () => {
        router.push(pageToPathMap.loginByAlias);
    };

    return (
        <>
            {contextHolder}
            <Login
                type={loginType}
                name={loginTypeMap[loginType]?.name}
                switchList={switchList}
                loading={spinning}
                onFinish={onFinish}
            />
        </>
    );
};

export default memo(LoginByIp);
