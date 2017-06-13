import React, { Component } from 'react';
import { Link } from 'react-router';

import { Nav } from 'app/components';

export default class Success extends Component {
  handleClick(){

  }
  render() {
    let bankcard="交通银行储蓄卡(1234)";
    let props={ title:'成功' };
    return (
      <div className="bindCardMain">
          <Nav data={props} />
          <div className="bindCardWrap">
              <div className="bindCardStatus">
                <div className="img success"></div>
                <p>恭喜您成功绑定</p>
                <p>{bankcard}</p>
              </div>
          </div>
          <div className="nextPage">
              <button onClick={this.handleClick.bind(this)}>下一步</button>
          </div>
      </div>
    )
  }
}
