import React, { useEffect, useMemo, memo } from 'react';
import { Divider, Form } from 'antd';
import PanelLayout from '../common/PanelLayout';
import { Step, BaseTabContentProps } from '@/components/install-process/data.d';
import StorageClassConfig from '../common/StorageClassConfig';
import ServerExposeConfig from '../common/ServerExposeConfig';
import AdminConfig from '../common/AdminConfig';
import StoreConfigList from '../common/StoreConfigList';
import useStyles from './style';
import FooterButtons from '../common/FooterButtons';
export interface IProps extends BaseTabContentProps {}

const readOnly = false;

const InstallConfig: React.FC<IProps> = ({ onStep, ...restProps }) => {
    const { styles } = useStyles();

    const [form] = Form.useForm();
    const values = Form.useWatch([], form);

    const [submittable, setSubmittable] = React.useState<boolean>(false);

    useEffect(() => {
        form.validateFields({ validateOnly: true })
            .then(() => setSubmittable(true))
            .catch(() => setSubmittable(false));
    }, [form, values]);

    const footerButtons = useMemo(
        () => (
            <FooterButtons
                cancelButton={{
                    text: '返回',
                    onClick: () => onStep?.(Step.Back),
                }}
                primaryButton={{
                    text: '下一步',
                    disabled: !submittable,
                    onClick: () => onStep?.(Step.Next),
                }}
            />
        ),
        [submittable, onStep],
    );

    return (
        <PanelLayout footer={footerButtons} {...restProps}>
            <div className={styles.installConfigContent}>
                <Form form={form}>
                    <StorageClassConfig readOnly={readOnly} />
                    <ServerExposeConfig readOnly={readOnly} />
                    <AdminConfig readOnly={readOnly} />
                </Form>
                <Divider />
                <StoreConfigList readOnly={readOnly} />
            </div>
        </PanelLayout>
    );
};

export default memo(InstallConfig);
