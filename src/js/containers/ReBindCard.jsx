import React, { Component } from 'react';
import { Link } from 'react-router';

import { Nav } from 'app/components';
import { WhiteSpace } from 'antd-mobile';

export default class Rebind extends Component {
  constructor(props){
    super(props)
  }
  componentDidMount(){
    _paq.push(['trackEvent', 'C_Page', 'E_P_Fail']);
    Common.customPopState();
  }
  handleClick(){
    _paq.push(['trackEvent', 'C_Fail', 'E_Fail_button', '点击重新绑定按钮']);

    if(Common.isIos()){
      this.props.router.push('/');
    }else{
      let ln=location;
      
      location.href=ln.origin+ln.pathname+'#/';//自动加上了问号后面的参数
    }


  }
  render() {
    let props={ title:'绑卡结果'};
    console.log(this.props.location.state);
    let failReason='';//暂时不展示错误原因
    /*if(this.props.location.state){
      failReason = this.props.location.state.failReason;
    }else{
      failReason = '';
    }*/


    return (
      <div className="bind-card-main sub-page-wrap">
        <Nav data={props} />
        <WhiteSpace />
        <div className="bind-card-wrap">
          <div className="bind-card-status">
              <div className="img fail"></div>
              <p>对不起,绑卡失败了</p>
              <p>请稍后再试</p>
              {failReason?<p className="fail-msg">({failReason})</p>:""}
          </div>
        </div>
        <div className="next-page">
          <button onClick={this.handleClick.bind(this)}>重新绑定</button>
        </div>
      </div>
    )
  }
}
