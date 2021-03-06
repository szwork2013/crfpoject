import React, { Component } from 'react';
import { hashHistory } from 'react-router';
import { Nav } from 'app/components';
import { WhiteSpace } from 'antd-mobile';

export default class Success extends Component {
   constructor(props, context) {
    super(props);
    CONFIGS.userId = this.props.location.query.ssoId;
  }
  componentDidMount(){
    _paq.push(['trackEvent', 'C_Page', 'E_P_Success']);

    // if(Common.isWeChat()) {
    //   Common.customPopState(this.popUrlFn);
    // }
  }
  componentWillUnmount(){
    // if(Common.isWeChat()) {
    //   window.removeEventListener('popstate', this.popUrlFn);
    // }
  }
  popUrlFn(refUrl){
    location.href=refUrl;
  }
  handleClick(){
    _paq.push(['trackEvent', 'C_Success', 'E_Success_button', '成功页面按钮']);

    if (!CONFIGS.isFromCredit) {
      location.href = CONFIGS.referrerUrl;
    } else {
      let storge = window.localStorage;
      if (storge.getItem('crf-origin-url') !== '') {
        location.href = storge.getItem('crf-origin-url');
      } else {
        let path = 'index';
        hashHistory.push({
          pathname: path,
          query: {
            ssoId: CONFIGS.userId
          }
        });
      }
    }
  }
  render() {

    let props={ title:'绑定结果',stage: 'success' };
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
            <button onClick={this.handleClick.bind(this)}>确认</button>
        </div>
      </div>
    )
  }
}
