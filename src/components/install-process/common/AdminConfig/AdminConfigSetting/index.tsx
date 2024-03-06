import React, { memo, useCallback, useState } from 'react';
import { Form, Input } from 'antd';
import SectionLayout from '../../SectionLayout';
import { PasswordIconRender } from '@/components/install-process/common/AdminConfig';
import { RootState, useAppDispatch, useAppSelector } from '@/store';
import { setAdminPassword } from '@/store/slices/installConfigSlice';
import useStyles from './style';

export interface IProps {
    passwordIconRender: PasswordIconRender;
}

const regex = new RegExp('(?=.*[0-9])(?=.*[a-zA-Z])(?=.*[^a-zA-Z0-9]).{8,30}');

const checkPassword = (rule: any, value: string) => {
    if (!value) {
        return Promise.reject('请输入登录密码');
    }
    if (!regex.test(value)) {
        return Promise.reject('请设置8位以上30位以下密码,由数字、字母和符号组成');
    }
    return Promise.resolve();
};

const AdminConfigSetting: React.FC<IProps> = ({ passwordIconRender }) => {
    const { styles } = useStyles();

    const dispatch = useAppDispatch();
    const adminUsername = useAppSelector((state: RootState) => state.installConfig.adminUsername);
    const adminPassword = useAppSelector((state: RootState) => state.installConfig.adminPassword);

    const [passwordVisible, setPasswordVisible] = useState<boolean>(false);
    const [verifyPassword, setVerifyPassword] = useState<string>(''); // 二次确认密码
    const [verifyPasswordVisible, setVerifyPasswordVisible] = useState<boolean>(false);

    // 修改store admin密码
    const changeAdminPassword = useCallback(
        (password: string) => {
            dispatch(setAdminPassword(password));
        },
        [dispatch],
    );

    // admin密码更改
    const onPasswordChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { value } = e.target;
        changeAdminPassword(value.trim());
    };

    // admin密码更改
    const onVerifyPasswordChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { value } = e.target;
        setVerifyPassword(value.trim());
    };

    const checkPasswordSame = (rule: any, value: string) => {
        if (!value) {
            return Promise.reject('请确认登录密码');
        }
        if (value !== adminPassword) {
            return Promise.reject('密码不一致');
        }
        return Promise.resolve();
    };

    return (
        <div className={styles.settingContent}>
            <SectionLayout title="用户名" style={{ paddingTop: 0 }}>
                <Form.Item rules={[{ required: true, message: '请输入用户名' }]}>
                    <Input value={adminUsername} disabled />
                </Form.Item>
            </SectionLayout>
            <SectionLayout title="登录密码">
                <Form.Item name="adminPassword" rules={[{ validator: checkPassword }]}>
                    <Input.Password
                        placeholder="请输入登录密码"
                        onChange={onPasswordChange}
                        visibilityToggle={{ visible: passwordVisible, onVisibleChange: setPasswordVisible }}
                        iconRender={passwordIconRender}
                    />
                </Form.Item>
            </SectionLayout>
            <SectionLayout title="确认登录密码">
                <Form.Item name="verifyPassword" rules={[{ validator: checkPasswordSame }]}>
                    <Input.Password
                        placeholder="请确认登录密码"
                        onChange={onVerifyPasswordChange}
                        visibilityToggle={{
                            visible: verifyPasswordVisible,
                            onVisibleChange: setVerifyPasswordVisible,
                        }}
                        iconRender={passwordIconRender}
                    />
                </Form.Item>
            </SectionLayout>
        </div>
    );
};

export default memo(AdminConfigSetting);
