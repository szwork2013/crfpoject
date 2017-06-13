import React, { Component } from 'react';
import { List, Switch } from 'antd-mobile';
import { createForm } from 'rc-form';


let SwitchTab = (props) => {
    const { getFieldProps } = props.form;
    return (
        <Switch
            {...getFieldProps('Switch1', {
                initialValue: true,
                valuePropName: 'checked',
            })}
            onClick={(checked) => { console.log(checked); }}
        />
    );
};

const SwitchBtn = createForm()(SwitchTab);

export default SwitchBtn;