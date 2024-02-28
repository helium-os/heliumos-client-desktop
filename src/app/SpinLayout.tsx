'use client';
import React, { useState, useEffect, memo } from 'react';
import { Spin } from 'antd';

interface IProps {
    children: React.ReactNode;
}

const SpinLayout: React.FC<IProps> = ({ children }) => {
    const [spinning, setSpinning] = useState<boolean>(true);

    const addObverser = async () => {
        if (window?.versions) {
            await window?.versions?.getMessage('Loading', async (event, arg: boolean) => {
                setSpinning(arg);
            });
            setSpinning(false);
        }
    };

    useEffect(() => {
        addObverser();
    }, []);

    return (
        <Spin style={{ top: '50%', transform: 'translate(0, -50%)' }} spinning={spinning} size="large">
            {children}
        </Spin>
    );
};

export default memo(SpinLayout);
