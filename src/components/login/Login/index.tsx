import React, { useState, memo } from 'react';
import Link from 'next/link';
import { Form } from 'antd';
import MyInput from '@/components/common/MyInput';
import { LoginType, LoginTypeInfo } from '@/components/login/data';
import useStyles from './style';

interface IProps {
    type: LoginType;
    name: string;
    switchList: LoginTypeInfo[];
    onFinish: (values: any) => void;
    loading: boolean;
}

const Login: React.FC<IProps> = ({ type, name, switchList, loading, onFinish }) => {
    const { styles } = useStyles();

    const [form] = Form.useForm();

    const [value, setValue] = useState();

    return (
        <Form form={form} onFinish={onFinish} layout={'vertical'}>
            <div className={styles.loginWrap}>
                <div>
                    <div className={styles.accountTitle}>{name}</div>
                    <div className={styles.accountContent}>请输入{name}跳转到组织的登录界面</div>
                </div>
                <Form.Item name={type} label={''}>
                    <MyInput
                        onChange={(e: any) => {
                            setValue(e);
                        }}
                        rules={{ required: true, message: `请输入${name}` }}
                        spinning={loading}
                        form={form}
                        name={type}
                        title={name}
                        allowclear={true}
                        placeholder={`请输入${name}`}
                    />
                </Form.Item>
                <input className={styles.loginButton} type="submit" disabled={!value || loading} value={'下一步'} />
                <ul className={styles.switchList}>
                    {switchList.map(({ type, name, path }) => (
                        <li key={type}>
                            <Link href={path}>通过{name}找到组织</Link>
                        </li>
                    ))}
                </ul>
            </div>
        </Form>
    );
};

export default memo(Login);
