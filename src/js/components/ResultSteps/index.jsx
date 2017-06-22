import React, { Component } from 'react';
import {Steps} from 'antd-mobile';
import {Phone} from 'app/components';
import Numeral from 'numeral';
const Step = Steps.Step;

export default class Result extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      status: props.data.status,
      dataList: props.data.dataList
    }
  }

  componentWillReceiveProps(nextProps) {
    this.setState(nextProps.data);
  }

  render() {
    let {status, dataList} = this.state;
    let realSteps = null;
    let lastStep = null;
    if (dataList.length === 3) {
      if (status === 1) {
        lastStep = <Step className="error" title={dataList[2].trace_content} description={dataList[2].trace_time} />;
      } else if(status === 2) {
        lastStep = <Step className="finish" title={dataList[2].trace_content} description={dataList[2].trace_time} />;
      }
      realSteps = (
        <Steps current={2}>
          <Step title="充值申请成功" description={dataList[0].trace_time} />
          <Step title="系统处理中" description={dataList[1].trace_time} />
          {lastStep}
        </Steps>
      );
    } else {
      if (status === 1) {
        lastStep = <Step className="error" title={dataList[dataList.length - 1].trace_content} description={dataList[dataList.length - 1].trace_time} />;
      } else if(status === 2) {
        lastStep = <Step className="finish" title={dataList[dataList.length - 1].trace_content} description={dataList[dataList.length - 1].trace_time} />;
      }
      realSteps = (
        <Steps current={2}>
          <Step title="充值申请成功" description={dataList[0].trace_time} />
          <Step title="系统处理中" description={dataList[0].trace_time} />
          {lastStep}
        </Steps>
      );
    }
    return (
      <div>
        {realSteps}
      </div>
    )
  }
}
