const MyInput = ({
  form,
  name,
  title,
  placeholder,
  allowclear,
  onChange,
  style,
  spinning,
  rules
}) => {
  const customStyle = {
    border: 'none', // 去掉边框
    boxShadow: 'none', // 去掉阴影
    // 其他自定义样式
  };
  const [error, setError] = React.useState(null);
  const [fieldValue, setFieldValue] = React.useState("");
  const [focus, setFocus] = React.useState(false);
  const [options, setOptions] = React.useState([]);
  const [searchText, setSearchText] = React.useState('');
  const onSelect = (data) => {
    console.log('onSelect', data);
  };
  const onSearch = (searchText) => {
    setSearchText(searchText || '');
  };
  const getList = async () => {
    if (window?.versions) {
      let values = await window?.versions?.invokMethod('getOrgList')
      setOptions(values)
    }
  }
  // 使用 useEffect 监听字段值的变化
  React.useEffect(() => {
    if (fieldValue !== form.getFieldValue(name)) {
      setFieldValue(form.getFieldValue(name));
    }
  }, [form]);
  React.useEffect(() => {
    getList()
  }, [spinning])
  const handleInputChange = (e) => {
    onChange && onChange(e);
    const value = e;
    setFieldValue(value); // 更新子组件内部的值
    form.setFieldsValue({ [name]: value }); // 将值传递给 Antd Form
    setError(!e)
  };

  const handleBlur = () => {
    setFocus(false);
    setError(!e)
  };

  return (<>
    <div
      className={`myInput ${error ? "errBorder" : ""} 
      ${focus ? "focusBorder" : ""}
      ${fieldValue && "valuePadding"}
      `}
      style={style ? { ...style } : {}}
    >
      {title && (
        <div
          className={`myInputTitle ${error ? "errColor" : ""} ${focus || fieldValue ? "inputTitleHeight" : ""
            }`}
        >
          {title}
        </div>
      )}
      <div>
        <antd.AutoComplete
          className={`myInputContent  ${focus ? "inputContentHeight" : ""}`}
          value={fieldValue}
          options={options.filter(item => item?.value.indexOf(searchText) !== -1)}
          onSelect={onSelect}
          onSearch={onSearch}
          onFocus={() => setFocus(true)}
          onChange={handleInputChange}
          onBlur={handleBlur}
          style={
            allowclear && fieldValue
              ? { width: "calc( 100% - 16px )", ...customStyle }
              : { ...customStyle }
          }
          placeholder={focus?'':placeholder}
        ></antd.AutoComplete >
        {allowclear && fieldValue && (
          <>
            <img
              src="./img/allowClear.png"
              width={16}
              height={16}
              style={{ marginBottom: 3 }}
              onClick={() => handleInputChange(null)}
            ></img>
          </>
        )}
      </div>
    </div>
    <div className="errorMessage">{rules?.required && error ? (rules?.message || '请填写' + name) : ''}</div>
  </>
  );
};

