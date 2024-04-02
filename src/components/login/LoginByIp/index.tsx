import React, { useState, memo } from 'react';
import { useRouter } from 'next/router';
import { message } from 'antd';
import { LoginType, loginTypeMap } from '@/components/login/data';
import Login from '../common/Login';

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

            const orgList = await window?.versions?.getDbValue();
            if (!orgList?.length) {
                throw new Error('setEnv成功，但orgList长度为0');
            }

            const { id: orgId, alias: orgAlias } = orgList[0];
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
