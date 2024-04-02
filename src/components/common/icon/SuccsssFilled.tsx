import React from 'react';
import Icon from '@ant-design/icons';
import type { GetProps } from 'antd';

type CustomIconComponentProps = GetProps<typeof Icon>;

const SuccessFilled = () => (
    <svg width="1em" height="1em" viewBox="0 0 14 14" fill="currentColor">
        <path
            id="Vector"
            d="M14 7.00001C14 10.6861 10.9427 13.75 7.25001 13.75C3.56397 13.75 0.5 10.6861 0.5 7.00001C0.5 3.30736 3.55736 0.25 7.24339 0.25C10.9361 0.25 14 3.30736 14 7.00001ZM9.3081 4.3728L6.48236 8.91251L5.13898 7.17869C4.97354 6.9603 4.82795 6.90074 4.63604 6.90074C4.33824 6.90074 4.10662 7.1456 4.10662 7.44339C4.10662 7.5956 4.16618 7.74119 4.26545 7.87354L5.92648 9.91178C6.09854 10.1434 6.28383 10.236 6.50883 10.236C6.73383 10.236 6.92574 10.1302 7.06472 9.91178L10.175 5.01471C10.2544 4.87574 10.3405 4.72354 10.3405 4.57795C10.3405 4.26692 10.0691 4.06839 9.77795 4.06839C9.6059 4.06839 9.43384 4.17427 9.3081 4.3728Z"
        />
    </svg>
);

const SuccessFilledIcon = (props: Partial<CustomIconComponentProps>) => <Icon component={SuccessFilled} {...props} />;

export default SuccessFilledIcon;
