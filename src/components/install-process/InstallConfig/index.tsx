import React, { useMemo, useCallback, memo } from 'react';
import { Divider, Form } from 'antd';
import PanelLayout from '../common/PanelLayout';
import { Step, BaseTabContentProps } from '@/components/install-process/data.d';
import StorageClassConfig from '../common/StorageClassConfig';
import ServerExposeConfig from '../common/ServerExposeConfig';
import AdminConfig from '../common/AdminConfig';
import StoreConfigList from '../common/StoreConfigList';
import useStyles from './style';
import FooterButtons from '../common/FooterButtons';
import { setStorageClass, setServerExpose, setAdminPassword } from '@/store/slices/installConfigSlice';
import { useAppDispatch } from '@/store';
export interface IProps extends BaseTabContentProps {}

const readOnly = false;

const InstallConfig: React.FC<IProps> = ({ onStep, ...restProps }) => {
    const dispatch = useAppDispatch();

    const { styles } = useStyles();

    const [form] = Form.useForm();

    const onSubmit = useCallback(async () => {
        await form.validateFields();
        const { storageClass, serverExpose, adminPassword } = form.getFieldsValue();
        dispatch(setStorageClass(storageClass));
        dispatch(setServerExpose(serverExpose));
        dispatch(setAdminPassword(adminPassword));
    }, [form, dispatch]);

    const footerButtons = useMemo(
        () => (
            <FooterButtons
                cancelButton={{
                    text: '返回',
                    onClick: () => onStep?.(Step.Back),
                }}
                primaryButton={{
                    text: '下一步',
                    onClick: async () => {
                        try {
                            await onSubmit();
                            onStep?.(Step.Next);
                        } catch (error) {
                            console.log(error);
                        }
                    },
                }}
            />
        ),
        [onSubmit, onStep],
    );

    return (
        <PanelLayout footer={footerButtons} {...restProps}>
            <div className={styles.installConfigContent}>
                <Form form={form}>
                    <StorageClassConfig readOnly={readOnly} form={form} />
                    <ServerExposeConfig readOnly={readOnly} form={form} />
                    <AdminConfig readOnly={readOnly} form={form} />
                </Form>
                <Divider />
                <StoreConfigList readOnly={readOnly} />
            </div>
        </PanelLayout>
    );
};

export default memo(InstallConfig);
