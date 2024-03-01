import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import BgLayout from '@/components/structure/BgLayout';
import Image from 'next/image';
import useStyles from '../../components/user-list/style';
import { message } from 'antd';

const userBackgoundColor = [
    '#7E7CE3',
    '#E37C7C',
    '#E3A17C',
    '#E3C67C',
    '#7CE38C',
    '#7CE3BE',
    '#B07CE3',
    '#E37CD9',
    '#E37C88',
    '#7CD7E3',
    '#7CB8E3',
    '#7CABE3',
];
function getColorForCharacter(char) {
    const charCode = char.charAt(0).codePointAt(0); // 使用codePointAt处理Unicode字符

    // 自定义的映射规则，这只是一个示例，你可以根据自己的需求进行调整
    const colorCount = 12;
    const colorIndex = charCode % colorCount;

    return userBackgoundColor[colorIndex];
}

export default function Page() {
    const router = useRouter();

    const { styles } = useStyles();

    const [messageApi, contextHolder] = message.useMessage();
    const [userList, setUserList] = useState([]);
    const [pageno, setPageno] = useState(1);

    const goToLogin = () => {
        router.push('/login');
    };
    const onFinish = async (values) => {
        let List = values.split('@');
        if (List.length > 1) {
            let orgList = [];
            if (window?.versions) {
                orgList = await window?.versions?.getDbValue();
                if (orgList.find((item) => item?.alias == List[1])) {
                    await window?.versions?.setuserInfo({
                        org: List[1],
                        name: values.split('@')[0],
                        orgId: orgList.filter((item) => item?.alias == List[1])[0]?.id,
                    });
                } else {
                    messageApi.open({
                        type: 'error',
                        content: '没有该组织',
                    });
                    goToLogin();
                    return;
                }
            }

            window.versions?.loadKeycloakLogin(orgList.filter((item) => item?.alias == List[1])[0]?.id);
        }
    };

    const getValue = async () => {
        if (window?.versions) {
            let List = await window?.versions?.invokMethod('getLogList');
            if (List?.length == 0) {
                goToLogin();
            }
            setUserList(List);
        }
    };
    const addObverser = async () => {
        if (window?.versions) {
            await window?.versions?.getMessage('change-env', async (event, arg) => {
                let List = await window?.versions?.invokMethod('getLogList');
                setUserList(List);
                if (List?.length == 0) {
                    goToLogin();
                }
            });
        }
    };

    useEffect(() => {
        getValue();
        addObverser();
        // autoLogin()
    }, []);

    return (
        <>
            {contextHolder}
            <BgLayout className={styles.userListContainer}>
                <Image
                    width={24}
                    height={24}
                    alt=""
                    src="/left.png"
                    style={pageno == 1 ? { visibility: 'hidden' } : { cursor: 'pointer' }}
                    onClick={() => setPageno(pageno - 1)}
                />
                <div className="userList" style={userList.length > 5 ? { justifyContent: 'flex-start' } : {}}>
                    {userList.slice((pageno - 1) * 10, pageno * 10).map((item, index) => {
                        return item?.name ? (
                            <div
                                className="userInfo"
                                onClick={() => onFinish(item?.name + '@' + item?.org)}
                                key={index}
                            >
                                <div
                                    className="userImg"
                                    style={
                                        item?.display_name && !item?.avatar
                                            ? {
                                                  background: getColorForCharacter(item?.display_name),
                                              }
                                            : {}
                                    }
                                >
                                    {' '}
                                    {item?.avatar ? (
                                        <img src={item?.avatar || '/userInfo.svg'} />
                                    ) : (
                                        <div className="userBackgroundFont">
                                            {item?.display_name?.[0].toUpperCase()}
                                        </div>
                                    )}
                                </div>
                                <div className="useName textOverflow" title={item?.display_name || item?.name}>
                                    {item?.display_name || item?.name}
                                </div>
                                <div className="useOrg textOverflow" title={item?.org}>
                                    {item?.org}
                                </div>
                            </div>
                        ) : (
                            ''
                        );
                    })}
                </div>
                <Image
                    width={24}
                    height={24}
                    alt=""
                    src="/right.png"
                    style={pageno * 10 >= userList.length ? { visibility: 'hidden' } : { cursor: 'pointer' }}
                    onClick={() => setPageno(pageno + 1)}
                />
            </BgLayout>
        </>
    );
}
