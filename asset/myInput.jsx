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
  const [open, setOpen] = React.useState(false);
  const onSelect = (data) => {
    handleInputChange(data)
    setOpen(false)
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
    onSearch(e)
    setError(!e)
  };

  const handleBlur = () => {
    setTimeout(() => {
      setFocus(false);
    }, 100)
  };

  return (<div style={{ height: '80px', padding: focus && !error ? '0px' : '1px' }}>
    <div className={`
  coverInput
  ${error ? "errBorder" : ""}
  ${focus ? "focusBorder" : ""}`}>
      <div
        className={`myInput 
      ${focus || fieldValue ? "valuePadding" : ''}
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
          <input
            placeholder={focus ? '' : placeholder}
            style={
              allowclear && fieldValue
                ? { width: "calc( 100% - 16px )", }
                : { ...customStyle }
            }

            onFocus={() => setFocus(true)}
            onBlur={handleBlur}
            className={`myInputContent  ${focus ? "inputContentHeight" : ""}`}
            value={fieldValue} onChange={(e) => handleInputChange(e?.target?.value || '')}></input>

          {allowclear && fieldValue && (
            <>
              <img
                src="./img/allowClear.png"
                width={16}
                height={16}
                style={{ marginBottom: 3 }}
                onClick={() => handleInputChange('')}
              ></img>
            </>
          )}
        </div>
      </div>

    </div>
    <div className="errorMessage">{rules?.required && error ? (rules?.message || '请填写' + name) : ''}</div>
    <antd.AutoComplete
      value={fieldValue}
      options={options.filter(item => item?.value.indexOf(searchText) !== -1)}
      onSelect={onSelect}
      onSearch={onSearch}
      onChange={handleInputChange}
      open={(options.filter(item => item?.value.indexOf(searchText) !== -1)).length > 0 && focus}
      style={{ height: '0px', overflow: 'hidden' }}
      placeholder={focus ? '' : placeholder}
    >
    </antd.AutoComplete >
  </div>
  );
};

