import React, { Component } from 'react';
import { Link } from 'react-router';

import { Nav } from 'app/components';
import { WhiteSpace } from 'antd-mobile';

export default class Success extends Component {
  constructor(props){
    super(props);
  }
  componentDidMount(){
    _paq.push(['trackEvent', 'C_Page', 'E_P_Contract']);

    doc.body.scrollTop=0;//屏幕下拉后点击跳转页面顶部也跟着下拉
  }
  render() {
    console.log(this.props);
    let props={ title:'合同' };
    let frameStyle={
      width:'100%',
      height:'100%',
      backgroundColor:'#fff'
    };

    let url;
    if(CONFIGS.currentPath === '/'){
      url=CONFIGS.bindCard.contractUrl;
    }else if(CONFIGS.currentPath === '/loanconfirm'){
      url='';
    }

    return (
      <div className="bind-card-main sub-page-wrap">
        <Nav data={props} />
        <WhiteSpace />
        <iframe src={url} style={frameStyle}></iframe>
      </div>
    )
  }
}
