// storage 方法
const storageUtil = {
  get(key) {
    let value = localStorage.getItem(key);
    if (value) {
      try {
        value = JSON.parse(value);
        return value;
      } catch (e) {
        return value;
      }
    }
    return false;
  },
  set(key, value) {
    let val = value;
    if (typeof value !== "string") val = JSON.stringify(value);
    localStorage.setItem(key, val);
  },
  remove(key) {
    localStorage.removeItem(key);
  },
  clear() {
    localStorage.clear();
  },
};
//拼接GET参数
const _get = (url, params) => {
  if (params) {
    let paramsArray = [];
    //拼接参数
    Object.keys(params).forEach((key) =>
      paramsArray.push(key + "=" + params[key])
    );
    if (url.search(/\?/) === -1) {
      url += "?" + paramsArray.join("&");
    } else {
      url += "&" + paramsArray.join("&");
    }
  }
  return url;
};
//验证码按钮
const CaptchaBtn = ({
  countDown,
  email,
  callback,
  hasEmail,
  btnText = "获取验证码",
  btnStyle,
  changeDisableStyle,
  merchant,
}) => {
  const [count, setCount] = React.useState(60);
  const [timing, setTiming] = React.useState(false);

  const onGetCaptcha = React.useCallback(async (mail, m) => {
    if (callback) {
      if (hasEmail) {
        callback({ email: mail, merchant: m }).then(() => {
          setTiming(true);
        });
      } else {
        callback({ merchant: m }).then(() => {
          setTiming(true);
        });
      }
    }
  }, []);

  React.useEffect(() => {
    let interval = 0;
    if (timing) {
      interval = window.setInterval(() => {
        setCount((preSecond) => {
          if (preSecond <= 1) {
            setTiming(false);
            clearInterval(interval); // 重置秒数
            return 60;
          }

          return preSecond - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timing]);

  return (
    <div>
      <antd.Button
        style={{ width: "100%" }}
        disabled={timing}
        onClick={() => onGetCaptcha(email, merchant)}
      >
        {timing ? `${count} 秒` : btnText}
      </antd.Button>
    </div>
  );
};

//邮箱校验
const checkEmail = (rule, value) => {
  const regex = new RegExp("^[A-Za-z0-9\u4e00-\u9fa5_-]+@[a-zA-Z0-9_-]+$");
  if (value && !regex.test(value)) {
    return Promise.reject("请输入正确账号格式");
  }
  return Promise.resolve();
};

//登录
const Login = ({ changeType }) => {
  const onFinish = async (values) => {
    if (values?.usePoint.split("@")[1]) {
      if (window?.versions) {
        await window?.versions?.setuserInfo({ DNS: values?.usePoint.split("@")[1], name: values?.usePoint.split("@")[0] });
      }
      window.location.href =
        // "http://192.168.50.120:8312/";
        'http://desktop.' + values?.usePoint.split('@')[1];
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
              // { validator: checkEmail },
            ]}
            label="账号"
          >
            <antd.Input placeholder="请输入账号" style={{ width: "100%" }} />
          </antd.Form.Item>
        </div>
        {/* <div className="account">
          <antd.Form.Item
            label="环境"
          >
            <antd.Select placeholder="请选择环境" style={{ width: "100%" }} onChange={async (e) => {
              if (window?.versions) {
                await window?.versions?.setuserInfo({ dnsValue: e });
              }
            }}>
              <antd.Select.Option value='easypay'>demo</antd.Select.Option>
              <antd.Select.Option value='org2'>testinner</antd.Select.Option>
            </antd.Select>
          </antd.Form.Item>
        </div> */}
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
  const [type, setType] = React.useState("login");
  const changeType = (res) => {
    setType(res);
  };

  return (<>
    <div className="login">
      <div className="panel">
        <div className="form">
          <Login changeType={(res) => changeType(res)} />
        </div>
      </div>

    </div>
  </>
  );
};

ReactDOM.render(<MessageBox />, document.getElementById("app"));
