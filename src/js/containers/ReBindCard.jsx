import React, { Component } from 'react';
import { Link } from 'react-router';

import { Nav } from 'app/components';
import { WhiteSpace } from 'antd-mobile';

export default class Rebind extends Component {
  constructor(props){
    super(props)
  }
  handleClick(){
    this.props.router.push('/');
  }
  render() {
    let props={ title:'绑卡结果'};
    return (
      <div className="bind-card-main">
        {CONFIGS.isWeChat?'':<Nav data={props} />}
        <WhiteSpace />
        <div className="bind-card-wrap">
          <div className="bind-card-status">
              <div className="img fail"></div>
              <p>对不起，绑卡失败了</p>
              <p>请稍后再试</p>
          </div>
        </div>
        <div className="next-page">
          <button onClick={this.handleClick.bind(this)}>重新绑定</button>
        </div>
      </div>
    )
  }
}
