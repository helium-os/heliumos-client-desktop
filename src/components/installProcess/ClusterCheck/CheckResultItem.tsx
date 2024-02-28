'use client';
import React, { useMemo, memo } from 'react';
import Image from 'next/image';
import type { TableProps } from 'antd';
import { Table } from 'antd';
import useStyles from './style';
import {
    keyNameMap,
    ResultChildrenItem,
    ResultInfo,
    ResultItem,
    ValueInfo,
} from '@/components/installProcess/ClusterCheck/data';

interface VerifyItemProps extends ValueInfo {
    className?: string;
}

const VerifyItem: React.FC<VerifyItemProps> = ({ className = '', value, pass }) => {
    const { styles } = useStyles();

    return (
        <div className={`${styles.verifyWrap} ${className}`}>
            <label className={styles.verifyTitle}>{value}</label>
            <div className={styles.verifyIcon}>
                {pass ? (
                    <Image width={12} height={12} alt="" src="/verify-success.svg" />
                ) : (
                    <Image width={14} height={13} alt="" src="/verify-fail.svg" />
                )}
            </div>
        </div>
    );
};

interface NodesResultTableProps {
    data: ResultChildrenItem[];
}
const NodesResultTable: React.FC<NodesResultTableProps> = ({ data }) => {
    const { styles } = useStyles();

    const commonColumnsData = {
        width: 200,
        render: (item: ValueInfo) => <VerifyItem className="hasChildren" {...item} />,
    };
    const columns = [
        {
            title: keyNameMap.mame,
            dataIndex: 'name',
            ...commonColumnsData,
        },
        {
            title: keyNameMap.cpu,
            dataIndex: 'cpu',
            ...commonColumnsData,
        },
        {
            title: keyNameMap.memory,
            dataIndex: 'memory',
            ...commonColumnsData,
        },
    ];

    return <Table className={styles.nodesTable} columns={columns} dataSource={data} pagination={false} />;
};

interface ChildrenResultProps {
    id: string;
    data: ResultChildrenItem[];
}
const ChildrenResult: React.FC<ChildrenResultProps> = ({ id, data }) => {
    switch (id) {
        case 'nodes':
            return <NodesResultTable data={data} />;
    }
};

const CheckResultItem: React.FC<ResultItem> = ({ id, name, value, pass, children }) => {
    const { styles } = useStyles();

    return (
        <dl className={styles.checkResultItem}>
            <dt>{name}</dt>
            {children?.length > 0 ? (
                <ChildrenResult id={id} data={children} />
            ) : (
                <dd>
                    <VerifyItem value={value} pass={pass} />
                </dd>
            )}
        </dl>
    );
};

export default memo(CheckResultItem);
