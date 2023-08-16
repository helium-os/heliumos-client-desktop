//登录
const Login = () => {
  const onFinish = async (values) => {
    if (values?.usePoint.split("@")[1]) {
      let dbList = []
      if (window?.versions) {
        dbList = await window?.versions?.getDbValue()
        if (dbList.find(item => item?.alias == values?.usePoint.split("@")[1])) {
          await window?.versions?.setuserInfo({ DNS: values?.usePoint.split("@")[1], name: values?.usePoint.split("@")[0] });
        } else {
         
         antd.message.error('没有该组织')
          return
        }
      }

      window.location.href =
        // "http://192.168.50.120:8312/";
        'https://desktop.' + dbList.filter(item => item?.alias == values?.usePoint.split("@")[1])[0]?.id;
    }
  };
  const [form] = antd.Form.useForm();
  const getValue = async () => {
    if (window?.versions) {
      let a = await window?.versions?.getDNS();
      let b = await window?.versions?.name()
      if (a && b) {
        form.setFieldsValue({ usePoint: b + '@' + a });
      }
    }
  }
  React.useEffect(() => {
    getValue()
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
            label="账号"
          >
            <antd.Input placeholder="请输入账号" style={{ width: "100%" }} />
          </antd.Form.Item>
        </div>
        <antd.Form.Item>
          <antd.Button className="loginButton" type="primary" htmlType="submit">
            <img src="asset/arrowhead.png" alt="" />
          </antd.Button>
        </antd.Form.Item>
      </antd.Form>
    </div>
  );
};


const MessageBox = () => {
  return (<>
    <div className="login">
      <div className="panel">
        <div className="form">
          <Login  />
        </div>
      </div>
    </div>
  </>
  );
};

ReactDOM.render(<MessageBox />, document.getElementById("app"));
