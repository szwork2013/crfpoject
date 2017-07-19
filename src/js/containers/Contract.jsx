import React, { Component } from 'react';
import { Link } from 'react-router';

import { Nav } from 'app/components';
import { WhiteSpace } from 'antd-mobile';

export default class Success extends Component {
  constructor(props){
    super(props);
    this.state={
      height:'100%'
    }
  }
  componentDidMount(){
    _paq.push(['trackEvent', 'C_Page', 'E_P_Contract']);

    document.body.scrollTop=0;//屏幕下拉后点击跳转页面顶部也跟着下拉

    this.setFrameHeight();
  }
  setFrameHeight(){
    let getHeight = (obj) => {
      return parseFloat(getComputedStyle(obj,null)["height"]);
    };

    let frameHeight = document.documentElement.clientHeight - getHeight(document.querySelector('.am-whitespace')) - getHeight(document.querySelector('nav'));

    this.setState({
      height:frameHeight+'px'
    })
  }
  render() {
    let props={ title:'合同' };

    let frameStyle={
      width:'100%',
      height: this.state.height,
      backgroundColor:'#fff'
    };

    let url;
    if(CONFIGS.currentPath === '/'){
      url=CONFIGS.bindCard.contractUrl;
    }else if(CONFIGS.currentPath === '/loanconfirm'){
      url=CONFIGS.loanData.contractUrl;
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
