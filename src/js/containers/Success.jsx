import React, { Component } from 'react';
import { Link } from 'react-router';

import { Nav } from 'app/components';
import { WhiteSpace } from 'antd-mobile';

export default class Success extends Component {
  componentDidMount(){
    //_paq.push(['trackEvent', 'P_Success', '绑卡成功页面']);
  }
  handleClick(){
    //_paq.push(['trackEvent', 'C_Success', 'E_Success_button', '成功页面按钮']);
    location.href=CONFIGS.referrerUrl;
  }
  render() {
    //let bankcard="交通银行储蓄卡(1234)";
    let props={ title:'成功' };
    return (
      <div className="bind-card-main sub-page-wrap">
        {CONFIGS.isWeChat?'':<Nav data={props} />}
        <WhiteSpace />
        <div className="bind-card-wrap">
          <div className="bind-card-status">
            <div className="img success"></div>
            <p>恭喜您成功绑定</p>
            <p>{CONFIGS.bindCard.bankName+"("+CONFIGS.bindCard.bankNum.slice(-4)+")"}</p>
          </div>
        </div>
        <div className="next-page">
            <button onClick={this.handleClick.bind(this)}>确定</button>
        </div>
      </div>
    )
  }
}
