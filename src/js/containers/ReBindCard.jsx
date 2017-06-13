import React, { Component } from 'react';
import { Link } from 'react-router';

import { Nav } from 'app/components';

export default class Rebind extends Component {
  constructor(props){
    super(props)
  }
  handleClick(){
    
  }
  render() {
    let props={ title:'绑卡结果'};
    return (
      <div className="bindCardMain">
        <Nav data={props} />
        <div className="bindCardWrap">
          <div className="bindCardStatus">
              <div className="img fail"></div>
              <p>对不起，绑卡失败了</p>
              <p>请稍后再试</p>
          </div>
        </div>
        <div className="nextPage">
          <button onClick={this.handleClick.bind(this)}>重新绑定</button>
        </div>
      </div>
    )
  }
}
