import React, {Component} from 'react';

import {withRouter} from 'react-router';
import {Toast} from 'antd-mobile';

class Contract extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      contractData:this.contractList(props),
    };
  }

  componentWillMount() {
    console.log(this.props.location);
    if(this.props.location.pathname==='/'){
      this.getContractFetch();
    }

  }

  componentDidMount() {

    if(this.props.location.pathname==='/'){
      //勾选协议
      const refAgree=this.refs.refAgree;
      refAgree.onclick=()=>{
        refAgree.classList.toggle('un-agree');
        CONFIGS.bindCard.isAgree=!CONFIGS.bindCard.isAgree;
        this.props.removeDisabled();
      };

      //向父组件传递
      this.props.getContractEle(this.refs.refAgree);
    }

  }

  async getContractFetch(){
    let type='OPEN_ACCOUNT';
    let getContractUrl=CONFIGS.basePath+'contract/?contractEnum='+type;

    try {
      let fetchPromise = CRFFetch.Get(getContractUrl);
      // 获取数据
      let result = await fetchPromise;
      if (result && !result.response) {
        /*
         {contractName:"网络交易资金账户第三方协议",contractUrl:"https://m-ci.crfchina.com/tripartite_agreement.html"}
         {contractName:"用户授权协议",contractUrl:"https://m-ci.crfchina.com/userLicense_agreement.html"}
         * */
        this.setState({
          contractData:result
        });
      }
    } catch (err) {
      CRFFetch.handleError(err,Toast,()=>{

        if(err.response.status==400){
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

  contractList(props){
    let contractList=[];
    if(props.location.pathname==='/'){
      contractList=[
        {contractName:'网络交易资金账号三方协议',contractUrl:location.origin+'contract/tripartite_agreement.html'},
        {contractName:'第三方协议',contractUrl:location.origin+'contract/userLicense_agreement.html'}
      ]
    }
    return contractList;
  }

  handleContractClick(item){

    if(this.props.location.pathname === '/') {
      CONFIGS.bindCard.contractName = item.contractName;
      CONFIGS.bindCard.contractUrl = item.contractUrl;
      CONFIGS.currentPath = '/';

      _paq.push(['trackEvent', 'C_BindCard', 'E_BindCard_contract', item.contractName]);

      this.props.router.push('contract');
    }

    if(this.props.location.pathname === '/loanconfirm'){
      CONFIGS.currentPath = '/loanconfirm';
      console.log('loanconfirm');
    }
  }

  render() {
    const isAgree=CONFIGS.bindCard.isAgree;

    return (
      <div className="authorize">
        <span className={"agree "+(isAgree?"":"un-agree")} ref="refAgree">勾选</span>
        <span className="text">我已阅读并同意</span>
        <p className="protocol">
          {
            this.state.contractData.map((item,index)=>{
              return (
                <a href="javascript:void(0)" key={index} onClick={this.handleContractClick.bind(this,item)}>《{item.contractName}》</a>
              )
            })
          }
        </p>
      </div>
    );
  }
}


export default withRouter(Contract);