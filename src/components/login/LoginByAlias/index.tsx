import React, { useState, memo } from 'react';
import { message } from 'antd';
import Login from '../common/Login';
import { LoginType, loginTypeMap } from '../data';

const loginType = LoginType.Alias;
const switchList = [loginTypeMap[LoginType.Ip]];

const LoginByAlias = () => {
    const [messageApi, contextHolder] = message.useMessage();

    const [spinning, setSpinning] = useState(false);

    const onFinish = async (values: any) => {
        const { alias } = values;
        if (!alias || spinning || !window.versions) return;

        setSpinning(true);

        try {
            const orgList = await window?.versions?.getDbValue();
            console.log('orgList', orgList);
            const org = orgList.find((item: any) => item.alias === alias);

            if (!org) {
                throw new Error('没有该组织');
            }

            await window.versions?.setuserInfo({
                org: alias,
                orgId: org.id,
                name: null,
                username: null,
                autoLogin: null,
            });
            window.versions?.loadKeycloakLogin(org.id);
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

export default memo(LoginByAlias);
