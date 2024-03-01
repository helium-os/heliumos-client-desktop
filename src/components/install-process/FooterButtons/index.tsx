import React from 'react';
import { Button } from 'antd';

interface ButtonProps {
    text: string;
    disabled?: boolean;
    onClick?: () => void;
}

interface IProps {
    primaryButton?: ButtonProps | null;
    cancelButton?: ButtonProps | null;
}
const FooterButtons: React.FC<IProps> = ({ primaryButton, cancelButton }) => {
    const onOk = () => {
        primaryButton?.onClick?.();
    };

    const onCancel = () => {
        cancelButton?.onClick?.();
    };

    return (
        <>
            {cancelButton && <Button onClick={onCancel}>{cancelButton?.text}</Button>}
            {primaryButton && (
                <Button type="primary" disabled={primaryButton.disabled} onClick={onOk}>
                    {primaryButton.text}
                </Button>
            )}
        </>
    );
};

export default FooterButtons;
