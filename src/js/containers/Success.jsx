import React, { Component } from 'react';
import { Link } from 'react-router';

import { Nav } from 'app/components';
import { WhiteSpace } from 'antd-mobile';

export default class Success extends Component {
  componentDidMount(){
    this.customPopState();
    _paq.push(['trackEvent', 'C_Page', 'E_P_Success']);
  }
  handleClick(){
    _paq.push(['trackEvent', 'C_Success', 'E_Success_button', '成功页面按钮']);
    location.href=CONFIGS.referrerUrl;
  }
  customPopState(){
    let refUrl=CONFIGS.referrerUrl;//首页点击绑卡过来返回首页 产品页过来返回产品页面（点击确认跳转支付页面）
    //console.log(refUrl);
    if(refUrl.indexOf('#/loan?')>-1){
      refUrl=CONFIGS.referrerUrl.replace('#/loan?','#/recharge?');
    }

    //回退
    window.addEventListener("popstate", function() {
      location.href=refUrl;
    }, false);
    !function() {
      var state = {
        title: "title",
        url: ""
      };
      window.history.pushState(state, "title", "");
    }();
  }
  render() {

    let props={ title:'成功' };
    return (
      <div className="bind-card-main sub-page-wrap">
        <Nav data={props} />
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
