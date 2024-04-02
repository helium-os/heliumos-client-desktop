import { useState, useEffect } from 'react';
import Image from 'next/image';
import { AutoComplete } from 'antd';

function getUserAgent() {
    var userAgent = window.navigator.userAgent.toLowerCase();
    // 判断操作系统
    if (userAgent.indexOf('win') !== -1) {
        return 'win';
    } else if (userAgent.indexOf('mac') !== -1) {
        return 'mac';
    } else if (userAgent.indexOf('linux') !== -1) {
        return 'linux';
    } else if (userAgent.indexOf('android') !== -1) {
        return 'android';
    } else if (userAgent.indexOf('iphone') !== -1 || userAgent.indexOf('ipad') !== -1) {
        return 'mac';
    } else {
        return '';
    }
}
const MyInput = ({ form, name, title, placeholder, allowclear, onChange, style = {}, spinning, rules }) => {
    const customStyle = {
        border: 'none', // 去掉边框
        boxShadow: 'none', // 去掉阴影
        // 其他自定义样式
    };
    const [agent, setAgent] = useState('');
    const [error, setError] = useState(null);
    const [fieldValue, setFieldValue] = useState('');
    const [focus, setFocus] = useState(false);
    const [options, setOptions] = useState([]);
    const [searchText, setSearchText] = useState('');
    const [open, setOpen] = useState(false);

    useEffect(() => {
        const agent = getUserAgent();
        setAgent(agent);
    }, []);

    const onSearch = (searchText) => {
        setSearchText(searchText || '');
    };
    const getList = async () => {
        if (window?.versions) {
            let values = await window?.versions?.invokMethod('getOrgList');
            setOptions(values);
        }
    };
    // 使用 useEffect 监听字段值的变化
    useEffect(() => {
        if (fieldValue !== form.getFieldValue(name)) {
            setFieldValue(form.getFieldValue(name));
        }
    }, [form]);
    useEffect(() => {
        getList();
    }, [spinning]);
    const handleInputChange = (e) => {
        onChange && onChange(e);
        const value = e;
        setFieldValue(value); // 更新子组件内部的值
        form.setFieldsValue({ [name]: value }); // 将值传递给 Antd Form
        onSearch(e);
        setError(!e);
    };

    const onSelect = (data) => {
        handleInputChange(data);
        setOpen(false);
    };

    const handleBlur = () => {
        setFocus(false);
        setTimeout(() => setOpen(false), 500);
    };

    return (
        <div className="cover">
            <div
                className="cover"
                style={
                    style
                        ? {
                              height: style?.height ? style?.height + 4 : 60,
                              width: style?.width ? style?.width + 4 : 299,
                          }
                        : {
                              height: 60,
                              width: 299,
                          }
                }
            >
                <div
                    className={`
        coverInput
        ${!error && focus ? 'focusBorder' : ''}
        ${error ? 'errBorder' : ''}
        `}
                    style={
                        style
                            ? {
                                  ...style,
                                  width: style?.width
                                      ? !error && focus
                                          ? style?.width + 4
                                          : style?.width + (agent == 'mac' ? 1 : 2)
                                      : !error && focus
                                        ? 299
                                        : agent == 'mac'
                                          ? 296
                                          : 297,
                                  height: style?.height
                                      ? !error && focus
                                          ? style?.height + 4
                                          : style?.height + (agent == 'mac' ? 1 : 2)
                                      : !error && focus
                                        ? 56
                                        : agent == 'mac'
                                          ? 53
                                          : 54,
                              }
                            : {
                                  width: !error && focus ? 299 : agent == 'mac' ? 296 : 297,
                                  height: !error && focus ? 56 : agent == 'mac' ? 53 : 54,
                              }
                    }
                >
                    <div
                        className={`myInput 
            ${focus || fieldValue ? 'valuePadding' : ''}
            `}
                        style={style ? { ...style } : {}}
                    >
                        {title && (
                            <div
                                className={`myInputTitle ${error ? 'errColor' : ''} ${
                                    focus || fieldValue ? 'inputTitleHeight' : ''
                                }`}
                            >
                                {title}
                            </div>
                        )}
                        <div>
                            <input
                                placeholder={focus ? '' : placeholder}
                                style={allowclear && fieldValue ? { width: 'calc( 100% - 16px )' } : { ...customStyle }}
                                onFocus={() => {
                                    setFocus(true);
                                    setOpen(true);
                                }}
                                onBlur={() => handleBlur()}
                                className={`myInputContent  ${focus ? 'inputContentHeight' : ''}`}
                                value={fieldValue}
                                onChange={(e) => handleInputChange(e?.target?.value || '')}
                            ></input>

                            {allowclear && fieldValue && (
                                <>
                                    <Image
                                        width={16}
                                        height={16}
                                        alt=""
                                        src="/allowClear.png"
                                        style={{ marginBottom: 3, cursor: 'pointer' }}
                                        onClick={() => handleInputChange('')}
                                    />
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            <div className="errorMessage">{rules?.required && error ? rules?.message || '请填写' + name : ''}</div>
            <AutoComplete
                value={fieldValue}
                options={options
                    .filter((item) => item?.value.indexOf(searchText) !== -1)
                    .map((item) => ({ value: item.value, label: <div>{item.value}</div> }))}
                onSelect={onSelect}
                onSearch={onSearch}
                onChange={handleInputChange}
                open={options.filter((item) => item?.value.indexOf(searchText) !== -1).length > 0 && open}
                style={{ height: '0px', overflow: 'hidden', marginTop: 17 }}
                placeholder={focus ? '' : placeholder}
            ></AutoComplete>
        </div>
    );
};

export default MyInput;
