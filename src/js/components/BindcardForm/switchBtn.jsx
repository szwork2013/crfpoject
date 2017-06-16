import React, {Component} from 'react';
import {Switch} from 'antd-mobile';
import {createForm} from 'rc-form';


let SwitchTab = (props) => {
  const {getFieldProps} = props.form;
  return (
    <Switch
      {...getFieldProps('Switch1', {
        initialValue: true,
        valuePropName: 'checked',
      })}
      onClick={(checked) => {
        props.getSwitchVal(checked);
      }}
    />
  );
};

const SwitchBtn = createForm()(SwitchTab);

export default SwitchBtn;