//登录用户选择
const User = ({ changePage }) => {
  const [userList, setUserList] = React.useState([])
  const onFinish = async (values) => {
    let List=values.split("@")
    let env = await window?.versions?.invokMethod('getUserValue','env')
    if (List.length>1) {
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
        'https://'+env+'.desktop.system.app.' + orgList.filter(item => item?.alias == List[1])[0]?.id;
    }
  };

  const getValue = async () => {
    if (window?.versions) {
      let List = await window?.versions?.invokMethod('getLogList')
      setUserList(List)
    }
  }
  const addObverser = async () => {
    if (window?.versions) {
      await window?.versions?.getMessage('change-env', async (event, arg) => {
        let List = await window?.versions?.invokMethod('getLogList')
        setUserList(List)
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
      {userList.map(item => {
        return item?.name ?
          <div className='userInfo' onClick={() => onFinish(item?.name + '@' + item?.org)}>
            <div className='userImg'><img src={item?.avatar || './img/userInfo.svg'}></img></div>
            <div className='useName'>{item?.display_name}</div>
            <div className='useOrg'>{item?.name}@{item?.org}</div>
          </div> : ''

      })}
      <div className='userInfo' onClick={() => changePage('second')}>
        <div className='userImg'><img src={'./img/addUser.png'}></img></div>

      </div>
    </>
  );
};

//登录(输入账号密码)
const Login = ({ changePage }) => {

  const onFinish = async (values) => {
    let env = await window?.versions?.invokMethod('getUserValue','env')
    if (values?.usePoint.split("@")[1]) {
      let orgList = []
      if (window?.versions) {
        orgList = await window?.versions?.getDbValue()
        if (orgList.find(item => item?.alias == values?.usePoint.split("@")[1])) {
          await window?.versions?.setuserInfo({ org: values?.usePoint.split("@")[1], name: values?.usePoint.split("@")[0], orgId: orgList.filter(item => item?.alias == values?.usePoint.split("@")[1])[0]?.id });
        } else {
          antd.message.error('没有该组织')
          return
        }
      }

      window.location.href =
        // "http://192.168.50.120:8312/";
        'https://'+env+'.desktop.system.app.' + orgList.filter(item => item?.alias == values?.usePoint.split("@")[1])[0]?.id;
    }
  };
  const [form] = antd.Form.useForm();
  const addObverser = async () => {
    if (window?.versions) {
      await window?.versions?.getMessage('change-env', (event, arg) => {
        form.setFieldsValue({ usePoint: '' });
      })

    }
  }
  React.useEffect(() => {
    addObverser()
  }, []);

  return (
    <div>
      <antd.Form form={form} onFinish={onFinish} layout={"vertical"}>
        <div className="account">
          <antd.Form.Item
            name="usePoint"
            rules={[
              { required: true, message: "请输入账号!" },
            ]}
            label=""
          >
            <antd.Input placeholder="请输入账号" style={{ width: "100%" }} suffix={
              <antd.Button className="loginButton" htmlType="submit">
                <img src="img/submit.png" alt="" style={{ height: 30, marginRight: -10 }} />
              </antd.Button>} />
          </antd.Form.Item>
        </div>
      </antd.Form>
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

    }
  }
  React.useEffect(() => {
    addObverser()
  }, []);

  return (<>
    <antd.Spin spinning={spinning}>
      <div className="login">

        {page == 'first' && <User changePage={(res) => setPage(res)} />}
        {page == 'second' && <Login changePage={(res) => setPage(res)} />}

      </div>
    </antd.Spin>
  </>
  );
};

ReactDOM.render(<MessageBox />, document.getElementById("app"));
