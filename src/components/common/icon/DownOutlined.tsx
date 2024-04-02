import React from 'react';
import Icon from '@ant-design/icons';
import type { GetProps } from 'antd';

type CustomIconComponentProps = GetProps<typeof Icon>;

const DownOutlined = () => (
    <svg width="1em" height="1em" viewBox="0 0 11 7" fill="currentColor">
        <path d="M5.58594 6.39258C5.4375 6.39258 5.30469 6.33594 5.1875 6.22266L0.652344 1.58203C0.601562 1.53125 0.5625 1.47461 0.535156 1.41211C0.507812 1.3457 0.494141 1.27539 0.494141 1.20117C0.494141 1.09961 0.517578 1.00781 0.564453 0.925781C0.611328 0.84375 0.673828 0.779297 0.751953 0.732422C0.833984 0.685547 0.925781 0.662109 1.02734 0.662109C1.17578 0.662109 1.30273 0.712891 1.4082 0.814453L5.89648 5.40234H5.26953L9.75781 0.814453C9.86719 0.712891 9.99414 0.662109 10.1387 0.662109C10.2402 0.662109 10.3301 0.685547 10.4082 0.732422C10.4902 0.779297 10.5547 0.84375 10.6016 0.925781C10.6484 1.00781 10.6719 1.09961 10.6719 1.20117C10.6719 1.3457 10.6191 1.4707 10.5137 1.57617L5.97852 6.22266C5.92773 6.27734 5.86719 6.32031 5.79688 6.35156C5.73047 6.37891 5.66016 6.39258 5.58594 6.39258Z" />
    </svg>
);

const DownOutlinedIcon = (props: Partial<CustomIconComponentProps>) => <Icon component={DownOutlined} {...props} />;

export default DownOutlinedIcon;