import React, { useMemo, useCallback, memo } from 'react';
import { Input, Divider, Form } from 'antd';
import SectionLayout from '../common/SectionLayout';
import PanelLayout from '../common/PanelLayout';
import { Step, BaseTabContentProps } from '@/components/install-process/data.d';
import StoreConfigList, { ModeType } from '../common/StoreConfigList';
import { RootState, useAppDispatch, useAppSelector } from '@/store';
import { setAdminPassword } from '@/store/slices/installConfigSlice';
import useStyles from './style';
import FooterButtons from '../common/FooterButtons';
export interface IProps extends BaseTabContentProps {}

const regex = new RegExp('(?=.*[0-9])(?=.*[a-zA-Z])(?=.*[^a-zA-Z0-9]).{8,30}');

const checkPassword = (rule: any, value: string) => {
    const regex = new RegExp('(?=.*[0-9])(?=.*[a-zA-Z])(?=.*[^a-zA-Z0-9]).{8,30}');
    if (value && !regex.test(value)) {
        return Promise.reject('请设置8位以上30位以下密码,由数字、字母和符号组成');
    }
    return Promise.resolve();
};

const InstallConfig: React.FC<IProps> = ({ onStep, ...restProps }) => {
    const { styles } = useStyles();

    const dispatch = useAppDispatch();
    const adminPassword = useAppSelector((state: RootState) => state.installConfig.adminPassword);

    const changeAdminPassword = useCallback(
        (password: string) => {
            dispatch(setAdminPassword(password));
        },
        [dispatch],
    );

    // admin密码更改
    const onAdminChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { value } = e.target;
        changeAdminPassword(value.trim());
    };

    const footerButtons = useMemo(
        () => (
            <FooterButtons
                cancelButton={{
                    text: '返回',
                    onClick: () => onStep?.(Step.Back),
                }}
                primaryButton={{
                    text: '下一步',
                    disabled: !adminPassword || !regex.test(adminPassword),
                    onClick: () => onStep?.(Step.Next),
                }}
            />
        ),
        [adminPassword, onStep],
    );

    return (
        <PanelLayout footer={footerButtons} {...restProps}>
            <Form>
                <SectionLayout title="admin 密码">
                    <Form.Item
                        name="adminPassword"
                        rules={[
                            {
                                required: true,
                                message: '请设置8位以上30位以下密码,由数字、字母和符号组成',
                            },
                            { validator: checkPassword },
                        ]}
                    >
                        <Input placeholder="admin 密码" value={adminPassword} onChange={onAdminChange} />
                    </Form.Item>
                </SectionLayout>
            </Form>
            <Divider />
            <StoreConfigList type={ModeType.Write} />
        </PanelLayout>
    );
};

export default memo(InstallConfig);
