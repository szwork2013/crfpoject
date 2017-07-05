import React, { Component } from 'react';
import { Link } from 'react-router';

import { Nav } from 'app/components';
import { WhiteSpace } from 'antd-mobile';

export default class Success extends Component {
  componentDidMount(){
    _paq.push(['trackEvent', 'C_Page', 'E_P_Success']);
    Common.customPopState();
  }
  handleClick(){
    _paq.push(['trackEvent', 'C_Success', 'E_Success_button', '成功页面按钮']);
    location.href=CONFIGS.referrerUrl;
  }
  render() {

    let props={ title:'绑定结果' };
    return (
      <div className="bind-card-main sub-page-wrap">
        <Nav data={props} />
        <WhiteSpace />
        <div className="bind-card-wrap">
          <div className="bind-card-status">
            <div className="img success"></div>
            <p>恭喜您成功绑定</p>
            <p>{CONFIGS.bindCard.bankName+"卡("+CONFIGS.bindCard.bankNum.slice(-4)+")"}</p>
          </div>
        </div>
        <div className="next-page">
            <button onClick={this.handleClick.bind(this)}>确定</button>
        </div>
      </div>
    )
  }
}
