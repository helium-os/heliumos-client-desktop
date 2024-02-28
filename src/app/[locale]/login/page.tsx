'use client';
import { useState, useEffect } from 'react';
import { useRouter } from '@/navigation';
import { Form, message } from 'antd';
import BgLayout from '@/components/structure/BgLayout';
import MyInput from '@/components/common/MyInput';
import useStyles from './style';

export default function Page() {
    const router = useRouter();

    const { styles } = useStyles();

    const [form] = Form.useForm();
    const [messageApi, contextHolder] = message.useMessage();

    const [spinning, setSpinning] = useState<boolean>(false);
    const [value, setValue] = useState<string>('');
    const [back, setBack] = useState<boolean>(true);
    const onFinish = async (values) => {
        if (values?.usePoint) {
            let orgList = [];
            if (window?.versions) {
                orgList = await window?.versions?.getDbValue();
                if (orgList.find((item) => item?.alias == values?.usePoint)) {
                    await window?.versions?.setuserInfo({
                        org: values?.usePoint,
                        orgId: orgList.filter((item) => item?.alias == values?.usePoint)[0]?.id,
                        name: null,
                        autoLogin: null,
                    });
                } else {
                    messageApi.open({
                        type: 'error',
                        content: '没有该组织',
                    });
                    return;
                }
            }

            window.location.href =
                // "http://localhost:3000/";
                'https://desktop.system.app.' + orgList.filter((item) => item?.alias == values?.usePoint)[0]?.id;
        }
    };
    const addObverser = async () => {
        if (window?.versions) {
            await window?.versions?.getMessage('change-env', (event, arg) => {
                form.setFieldsValue({ usePoint: '' });
                setBack(false);
            });
            let name = await window?.versions?.invokMethod('getUserValue', 'name');
            setBack(!!name);
        }
    };
    useEffect(() => {
        addObverser();
    }, []);

    return (
        <>
            {contextHolder}
            <BgLayout className={styles.loginPageContainer}>
                <Form form={form} onFinish={onFinish} layout={'vertical'}>
                    <div className="account">
                        <div className="accountTitle">组织别名</div>
                        <div className="accountContent">请输入组织别名跳转到组织的登录界面</div>
                        <Form.Item name="usePoint" label={''}>
                            <MyInput
                                onChange={(e) => {
                                    setValue(e);
                                }}
                                rules={{ required: true, message: '请输入组织别名' }}
                                spinning={spinning}
                                form={form}
                                name="usePoint"
                                title="组织别名"
                                allowclear={true}
                                placeholder="请输入组织别名"
                            />
                        </Form.Item>
                        <input className="loginButton" type="submit" disabled={!value} value={'下一步'} />
                    </div>
                </Form>
                {window.history.length > 1 && back && (
                    <div
                        className="goBack"
                        onClick={() => {
                            console.log(window.history.length);
                            window.history.back();
                        }}
                    >
                        返回
                    </div>
                )}
            </BgLayout>
        </>
    );
}
