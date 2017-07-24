import React, { Component } from 'react';
import { Link } from 'react-router';

import { Nav } from 'app/components';
import { WhiteSpace, Toast } from 'antd-mobile';

export default class Success extends Component {
  constructor(props){
    super(props);
    this.state={
      height:'100%',
      isZJ: props.location.state && props.location.state.isZJ,
      id: props.location.state && props.location.state.id,
      userName: props.location.state && props.location.state.userName,
      idNo: props.location.state && props.location.state.idNo,
    };
  }

  componentDidMount(){
    _paq.push(['trackEvent', 'C_Page', 'E_P_Contract']);

    document.body.scrollTop=0;//屏幕下拉后点击跳转页面顶部也跟着下拉

    this.setFrameHeight();

    if(this.state.isZJ){
      this.getContractContent(this.state.id);
    }
  }

  async getContractContent(protocolId){
    //https://m-ci.crfchina.com/h5_dubbo/contract/agreement/content?kissoId=5e886c9c0baf4954965b38c81c99a1c0&protocolId=30&loanNo=342221199202044516
    let getContractUrl=`${CONFIGS.contractPath}/agreement/content?kissoId=${CONFIGS.ssoId}&protocolId=${protocolId}&loanNo=${CONFIGS.method.loanNo}`;

    try {
      let fetchPromise = CRFFetch.Get(getContractUrl, {}, (response) => { return response.text() });
      // 获取数据
      let result = await fetchPromise;
      if (result && !result.response) {
        this.refs.refZJ.innerHTML=result;
      }
    } catch (err) {

      CRFFetch.handleError(err,Toast,()=>{
        if(err.response.status === 400){
          err.body.then(data => {
            if(CONFIGS.chineseCharRegx.test(data.message)){
              Toast.info(data.message);
            }else{
              Toast.info('系统繁忙，请稍后再试！');
            }
          });
        }
      });
    }
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
      url = CONFIGS.bindCard.contractUrl;
    }else if(CONFIGS.currentPath === '/loanconfirm'){
      url = CONFIGS.loanData.contractUrl;
    }

    if(this.state.id === 'digital'){
      let idType = '身份证';
      let userName = this.state.userName;
      let idNo = this.state.idNo;
      url = `/contract/digitalCertificate_agreement.html?${userName}&idNo=${idNo}&idType=${idType}`;
    }

    return (
      <div className="bind-card-main sub-page-wrap">
        <Nav data={props} />
        <WhiteSpace />
        {this.state.isZJ ? <div className="ZJContent" style={frameStyle} ref="refZJ"></div> : <iframe src={url} style={frameStyle}></iframe>}
      </div>
    )
  }
}
