import React from "react";
import { Button, Form, Input, Select, Space } from "antd";

import useDBSearchParamStore from "@/showDB/stores/useDBSearchParamStore";

const layout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 },
};
const tailLayout = {
  wrapperCol: { offset: 8, span: 16 },
};

const DBSearchForm = () => {
  const setForm = useDBSearchParamStore((store) => store.setForm);

  const [form] = Form.useForm();

  const handleOnClickSearch = () => {
    const table = useDBSearchParamStore((state) => state.table);
    let obj = unitData;
    if (table == "book") obj = bookData;
    let keyword = searchKey;
    //TODO yslee 검색 key+value로 수정

    let rst = searchByKey(obj, keyword);
    if (UTIL.isEmpty(rst)) setCurrentData("empty");
  };

  const onFinish = (values) => {
    setForm(values);
    handleOnClickSearch();
  };
  const onReset = () => {
    form.resetFields();
  };
  return (
    <Form
      {...layout}
      form={form}
      name="control-hooks"
      onFinish={onFinish}
      style={{ maxWidth: 600 }}
    >
      <Form.Item name="table" label="Table" rules={[{ required: true }]}>
        <Select
          allowClear
          placeholder="Select a option and change input text above"
          options={[
            { label: "unit", value: "unit" },
            { label: "book", value: "book" },
            { label: "order", value: "order" },
          ]}
        />
      </Form.Item>
      <Form.Item name="key" label="Keyword">
        <Input />
      </Form.Item>
      <Form.Item name="value" label="Search Word">
        <Input />
      </Form.Item>
      <Form.Item {...tailLayout}>
        <Space>
          <Button type="primary" htmlType="submit">
            Submit
          </Button>
          <Button htmlType="button" onClick={onReset}>
            Reset
          </Button>
        </Space>
      </Form.Item>
    </Form>
  );
};
export default DBSearchForm;
