const MyInput = ({
  form,
  name,
  title,
  placeholder,
  allowclear,
  onChange,
  style
}) => {
  const [error, setError] = React.useState(null);
  const [fieldValue, setFieldValue] = React.useState("");
  const [focus, setFocus] = React.useState(false);
  const [options, setOptions] = React.useState([]);
   const onSelect = (data) => {
    console.log('onSelect', data);
  };
  const mockVal = (str, repeat = 1) => ({
    value: str.repeat(repeat),
  });
  const onSearch = (searchText) => {
    setOptions(
      !searchText ? [] : [mockVal(searchText), mockVal(searchText, 2), mockVal(searchText, 3)],
    );
  };
  // 使用 useEffect 监听字段值的变化
  React.useEffect(() => {
    console.log(fieldValue, form.getFieldValue(name));
    if (fieldValue !== form.getFieldValue(name)) {

      setFieldValue(form.getFieldValue(name));
    }
  }, [form]);
  const handleInputChange = (e) => {
    console.log(e)
    onChange && onChange(e);
    const value = e;
    setFieldValue(value); // 更新子组件内部的值
    form.setFieldsValue({ [name]: value }); // 将值传递给 Antd Form
    form
      .validateFields([name])
      .then((res) => {
        setError(null);
      })
      .catch((errors) => {
        setError(errors);
      });
  };

  const handleBlur = () => {
    setFocus(false);
    form
      .validateFields([name])
      .then((res) => {
        setError(null);
      })
      .catch((errors) => {
        setError(errors);
      });
  };

  return (
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
          options={options}
          onSelect={onSelect}
          onSearch={onSearch}
          onFocus={() => setFocus(true)}
          onChange={handleInputChange}
          onBlur={handleBlur}
          style={
            allowclear && fieldValue
              ? { width: "calc( 100% - 16px )" }
              : {}
          }
          placeholder={placeholder}
        ></antd.AutoComplete >
        {allowclear && fieldValue && (
          <>
            <img
              src="/img/icon/allowClear.png"
              width={16}
              height={16}
              style={{ marginBottom: 3 }}
              onClick={() => handleInputChange(null)}
            ></img>
          </>
        )}
      </div>
    </div>
  );
};

