import React, { Component } from 'react';
import { Link } from 'react-router';

import { Nav } from 'app/components';
import { WhiteSpace } from 'antd-mobile';

export default class Success extends Component {
  constructor(props){
    super(props);
  }
  componentDidMount(){
    _paq.push(['trackEvent', 'P_Contract', '合同页面']);
  }
  render() {
    let props={ title:'合同' };
    let frameStyle={
      width:'100%',
      height:'100%',
      backgroundColor:'#fff'
    };
    return (
      <div className="bind-card-main sub-page-wrap">
        <Nav data={props} />
        <WhiteSpace />
        <iframe src={CONFIGS.bindCard.contractUrl} style={frameStyle}></iframe>
      </div>
    )
  }
}
