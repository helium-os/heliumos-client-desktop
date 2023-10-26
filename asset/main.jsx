
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
        {userList.slice((pageno - 1) * 10, pageno * 10).map(item => {
          return item?.name ?
            <div className='userInfo' onClick={() => onFinish(item?.name + '@' + item?.org)}>
              <div className='userImg'><img src={item?.avatar || './img/userInfo.svg'}></img></div>
              <div className='useName'>{item?.display_name || item?.name}</div>
              <div className='useOrg'>{item?.org}</div>
            </div> : ''

        })}

        {/* <div className='userInfo' onClick={() => changePage('first')}>
        <div className='userImg'><img src={'./img/addUser.png'}></img></div>

      </div> */}
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
                { required: true, message: "请输入组织别名!" }
              }
              spinning={spinning}
              form={form}
              name="usePoint"
              title="组织别名"
              allowclear={true}
              placeholder="请输入组织别名!"
            />
          </antd.Form.Item>
          <antd.Button className="loginButton" htmlType="submit" disabled={!value}>
            登录
          </antd.Button>
        </div>
      </antd.Form>
      {
        window.history.length > 1 && back && <a className="goBack" onClick={() => {
          console.log(window.history.length)
          window.history.back()
        }}>返回</a>
      }
    </div>
  );
};


const MessageBox = () => {
  const [page, setPage] = React.useState('first')
  const [spinning, setSpinning] = React.useState(false)
  const addObverser = async () => {
    if (window?.versions) {
      await window?.versions?.getMessage('Loading', async (event, arg) => {
        setSpinning(arg)
      })
      await window?.versions?.getMessage('setPage', async (event, arg) => {
        setPage(arg)
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
      <div className="login">
        {page == 'first' && <Login changePage={(res) => setPage(res)} spinning={spinning} />}
        {page == 'second' && <User changePage={(res) => setPage(res)} />}
      </div>
    </antd.Spin>
  </>
  );
};

ReactDOM.render(<MessageBox />, document.getElementById("app"));
