const userBackgoundColor = [
  "#7E7CE3",
  "#E37C7C",
  "#E3A17C",
  "#E3C67C",
  "#7CE38C",
  "#7CE3BE",
  "#B07CE3",
  "#E37CD9",
  "#E37C88",
  "#7CD7E3",
  "#7CB8E3",
  "#7CABE3",
];
function getColorForCharacter(char) {
  const charCode = char.charAt(0).codePointAt(0); // 使用codePointAt处理Unicode字符

  // 自定义的映射规则，这只是一个示例，你可以根据自己的需求进行调整
  const colorCount = 12;
  const colorIndex = charCode % colorCount;

  return userBackgoundColor[colorIndex];
}



//登录用户选择
const User = ({ changePage }) => {
  const [userList, setUserList] = React.useState([])
  const [pageno, setPageno] = React.useState(1)
  const onFinish = async (values) => {
    let List = values.split("@")
    if (List.length > 1) {
      let orgList = []
      if (window?.versions) {
        orgList = await window?.versions?.getDbValue()
        if (orgList.find(item => item?.alias == List[1])) {
          await window?.versions?.setuserInfo({
            org: List[1],
            name: values.split("@")[0],
            orgId: orgList.filter(item => item?.alias == List[1])[0]?.id
          });
        } else {
          antd.message.error('没有该组织');
          return
        }
      }
      window.location.href =
        // "http://localhost:3000/";
        'https://desktop.system.app.' + orgList.filter(item => item?.alias == List[1])[0]?.id;
    }
  };

  const getValue = async () => {
    if (window?.versions) {
      let List = await window?.versions?.invokMethod('getLogList')
      if (List?.length == 0) {
        changePage('first')
      }
      setUserList(List)
    }
  }
  const addObverser = async () => {
    if (window?.versions) {
      await window?.versions?.getMessage('change-env', async (event, arg) => {
        let List = await window?.versions?.invokMethod('getLogList')
        setUserList(List)
        if (List?.length == 0) {
          changePage('first')
        }
      })

    }
  }

  React.useEffect(() => {
    getValue()
    addObverser()
    // autoLogin()
  }, []);

  return (
    <>
      <img src={'./img/left.png'} style={pageno == 1 ? { visibility: 'hidden' } : {}} onClick={() => setPageno(pageno - 1)}></img>
      <div className="userList" style={userList.length > 5 ? { justifyContent: 'flex-start' } : {}}>
        {userList.slice((pageno - 1) * 10, pageno * 10).map((item, index) => {
          return item?.name ?
            <div className='userInfo' onClick={() => onFinish(item?.name + '@' + item?.org)} key={index}>
              <div className='userImg' style={
                item?.display_name && !item?.avatar
                  ? {
                    background: getColorForCharacter(
                      item?.display_name
                    ),
                  }
                  : {}
              } >   {item?.avatar ? (
                <img src={item?.avatar || './img/userInfo.svg'}></img>
              ) : (
                <div
                  className="userBackgroundFont"
                >
                  {item?.display_name?.[0]}
                </div>
              )}</div>
              <div className='useName textOverflow' title={item?.display_name || item?.name}>{item?.display_name || item?.name}</div>
              <div className='useOrg textOverflow' title={item?.org}>{item?.org}</div>
            </div> : ''

        })}
      </div>
      <img src={'./img/right.png'} style={pageno * 10 >= userList.length ? { visibility: 'hidden' } : {}} onClick={() => setPageno(pageno + 1)}></img>
    </>
  );
};

//登录(输入账号密码)
const Login = ({ spinning }) => {
  const [value, setValue] = React.useState('');
  const [back, setBack] = React.useState(true);
  const onFinish = async (values) => {
    if (values?.usePoint) {
      let orgList = []
      if (window?.versions) {
        orgList = await window?.versions?.getDbValue()
        if (orgList.find(item => item?.alias == values?.usePoint)) {
          await window?.versions?.setuserInfo({ org: values?.usePoint, orgId: orgList.filter(item => item?.alias == values?.usePoint)[0]?.id, name: null, autoLogin: null });
        } else {
          antd.message.error('没有该组织')
          return
        }
      }

      window.location.href =
        // "http://localhost:3000/";
        'https://desktop.system.app.' + orgList.filter(item => item?.alias == values?.usePoint)[0]?.id;
    }
  };
  const [form] = antd.Form.useForm();
  const addObverser = async () => {
    if (window?.versions) {
      await window?.versions?.getMessage('change-env', (event, arg) => {
        form.setFieldsValue({ usePoint: '' });
        setBack(false)
      })
      let name = await window?.versions?.invokMethod('getUserValue', 'name')
      setBack(!!name)
    }
  }
  React.useEffect(() => {
    addObverser()
  }, []);

  return (
    <div>
      <antd.Form form={form} onFinish={onFinish} layout={"vertical"}>
        <div className="account">
          <div className="accountTitle">组织别名</div>
          <div className="accountContent">请输入组织别名跳转到组织的登录界面</div>
          <antd.Form.Item
            name="usePoint"
            label={''}
          >
            <MyInput
              onChange={(e) => {
                setValue(e)
              }}
              rules={
                { required: true, message: "请输入组织别名" }
              }
              spinning={spinning}
              form={form}
              name="usePoint"
              title="组织别名"
              allowclear={true}
              placeholder="请输入组织别名"
            />
          </antd.Form.Item>
          <input className="loginButton" type="submit" disabled={!value} value={'下一步'} />
        </div>
      </antd.Form>
      {
        window.history.length > 1 && back && <div className="goBack" onClick={() => {
          console.log(window.history.length)
          window.history.back()
        }}>返回</div>
      }
    </div>
  );
};


const MessageBox = () => {
  const [page, setPage] = React.useState(window.location.hash.split('#')?.[1] || 'second')
  const [spinning, setSpinning] = React.useState(false)
  const addObverser = async () => {
    if (window?.versions) {
      await window?.versions?.getMessage('Loading', async (event, arg) => {
        setSpinning(arg)
      })
      setSpinning(false)
    }
  }
  React.useEffect(() => {
    setSpinning(true)
    addObverser()
  }, []);

  return (<>
    <antd.Spin spinning={spinning}>
      <div className="login whiteShadow">
        {page == 'first' && <Login changePage={(res) => setPage(res)} spinning={spinning} key='first' />}
        {page == 'second' && <User changePage={(res) => setPage(res)} key='User' />}
      </div>
    </antd.Spin>
  </>
  );
};

ReactDOM.render(<MessageBox />, document.getElementById("app"));
