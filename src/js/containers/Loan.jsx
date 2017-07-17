import React, { Component } from 'react';
import { Nav, RulersLoan, RulersDay, Loading, LoanDetail } from 'app/components';//Present, Coupons,
import { Toast, WhiteSpace } from 'antd-mobile';
import { hashHistory } from 'react-router';
//import Numeral from 'numeral';
import PubSub from 'pubsub-js';

class Repay extends Component {
  constructor(props){
    super(props);
    CONFIGS.userId = this.props.location.query.ssoId;
    this.state = {
      title: '借款申请',
      isLoading: true,
      loanData: {},
      dayData: {},
    };
  }

  componentDidMount() {
    _paq.push(['trackEvent', 'C_Page', 'E_P_Repay']);
    this.getQuotaFetch();//获取额度
  }

  async getQuotaFetch() {
    //https://m-ci.crfchina.com/h5_dubbo/loan/quota?kissoId=f9c36b0f4c034c0bb723fd67019dfdd0
    const quotaPath = `${CONFIGS.loanPath}/quota?kissoId=${CONFIGS.ssoId}`;

    try {
      let fetchPromise = CRFFetch.Get(quotaPath);
      // 获取数据
      let result = await fetchPromise;

      /*this.setState({
        isLoading: false
      });*/

      if (result && !result.response) {
        //console.log(result);
        /*
        * {
         "code": "000000",
         "errorMsg": null,
         "crfuid": "7358fea6fd4d1eea975536423c1f3fb5",
         "vipLevel": "14",
         "totalLimit": 140000,
         "remainLimit": 140000,
         "usedLimit": 0
         }
        * */
        console.log('重新拖动的时候不能触发这里');
        let defaultData = this.defaultData(result.remainLimit/100);//设置标尺

        if(defaultData.defaultDay<=30){
          CONFIGS.loanData.period = 1;
        }else if(defaultData.defaultDay<=60){
          CONFIGS.loanData.period = 2;
        }else if(defaultData.defaultDay<=90){
          CONFIGS.loanData.period = 3;
        }

        this.getInitDataFetch(defaultData);//获取额度列表
      }
    } catch (error) {
      /*this.setState({
        isLoading: false
      });*/
      this.refs.loading.hide();

      CRFFetch.handleError(error, Toast, () => {
        if (error.response.status === 400) {
          error.body.then(data => {
            Toast.info(data.message);
          });
        }
      });
    }
  }

  async getInitDataFetch(defaultData) {
    let { defaultDay, remainLimit } = defaultData;
    let d = new Date();

    let period = defaultDay>30 ? 'M' : 'D';
    let periodDay ;
    if(defaultDay<=30){
      periodDay = defaultDay;
    }else if(defaultDay<=60){
      periodDay = 2;
    }else if(defaultDay<=90){
      periodDay = 3;
    }

    CONFIGS.loanData.amount = remainLimit * 100;//分为单位
    CONFIGS.loanData.day = defaultDay;

    //console.log(remainLimit,'以分');
    const params={
      productNo: 'P2001002',//未动态传入
      loanAmount: remainLimit,
      loanPeriod: periodDay,
      startTime: `${d.getFullYear()}-${d.getMonth()+1}-${d.getDate()}`,
      periodUnit: period,//D是短期，M是分期
      kissoId: CONFIGS.ssoId,
    };

    let loanPath = `${CONFIGS.repayPath}/plan?productNo=${params.productNo}&loanAmount=${params.loanAmount}&loanPeriod=${params.loanPeriod}&startTime=${params.startTime}&periodUnit=${params.periodUnit}&kissoId=${params.kissoId}`;

    try {
      let loanFetchPromise = CRFFetch.Get(loanPath);

      // 获取数据
      let loanResult = await loanFetchPromise;

      this.refs.loading.hide();

      if (loanResult && !loanResult.response) {
        //console.log(loanResult,'+++++++++++++++1次');
        PubSub.publish('loanDetail:list', loanResult.detailList.LoanPlan);
      }

    } catch (error) {

      this.refs.loading.hide();

      CRFFetch.handleError(error, Toast, () => {
        if (error.response.status === 400) {
          error.body.then(data => {
            Toast.info(data.message);
          });
        }
      }, () => {
        let path = 'loan';
        hashHistory.push({
          pathname: path,
          query: {
            ssoId: CONFIGS.userId
          }
        });
      });

    }
  }

  async loanSubmitFetch(){
    console.log(CONFIGS.loanData.amount,'以分');
    const params={
      loanAmount: CONFIGS.loanData.amount,//金额
      loanDays: CONFIGS.loanData.day,//借款天数
      loanProductNo: 'P2001002',//产品
      kissoId: CONFIGS.ssoId,
    };

    let loanSubmitPath = `${CONFIGS.loanPath}/fundsSource?loanAmount=${params.loanAmount}&loanDays=${params.loanDays}&loanProductNo=${params.loanProductNo}&kissoId=${params.kissoId}`;

    try {
      let fetchMethodPromise = CRFFetch.Get(loanSubmitPath);
      // 获取数据
      let result = await fetchMethodPromise;
      if (result && !result.response) {
        this.refs.loading.hide();
        this.setMethodData(result);
      }
    } catch (error) {
      this.refs.loading.hide();

      //mock
      //this.setMethodData({});
      CRFFetch.handleError(error, Toast, () => {
        if (error.response.status === 400) {
          error.body.then(data => {
            Toast.info(data.message);
          });
        }
      }, () => {
        let path = 'loan';
        hashHistory.push({
          pathname: path,
          query: {
            ssoId: CONFIGS.userId
          }
        });
      });
    }
  }

  handleClick() {
    this.refs.loading.show();
    this.loanSubmitFetch();
  }

  /*setData(repayData) {
    Object.assign(CONFIGS.repayData, repayData);
    //let repay = this.convertRepayData(repayData);
    Object.assign(CONFIGS.rulerData, repay);

    this.setState({
      isLoading: false,
      data: repay
    });
  }*/

  defaultData(remainLimit){
    let maxAmount = remainLimit/100;

    //生成借款数组
    let loanData=[];
    for(let i=1;i<=maxAmount;i++){
      loanData.push(i*100);
    }
    let curAmount = maxAmount<16 ? maxAmount : 15;

    CONFIGS.loanData.currentAmountCount = curAmount-1;

    curAmount = curAmount*100;
    let loanList = {
      data: loanData,
      currentAmount: curAmount
    };

    //生成借款期限数组
    let dayData=[];
    let maxDay=30;
    if(maxAmount<=5){
      maxDay=14;
    }else if(maxAmount<=15){
      maxDay=30;
    }else if(maxAmount<=25){
      maxDay=60;
    }else{
      maxDay=90;
    }
    for(let i=1;i<=maxDay;i++){
      dayData.push(i);
    }

    let defaultDay = maxAmount<=5 ? 14 : 30;
    //CONFIGS.loanData.defaultDay = defaultDay;
    let dayList = {
      data: dayData,
      currentDay: maxDay,
      defaultDay: defaultDay,
    };

    this.setState({
      loanData: loanList,
      dayData: dayList,
    });

    return {
      remainLimit: curAmount,
      defaultDay: defaultDay,
    };
  }

  setMethodData(methodData) {
    Object.assign(CONFIGS.method, methodData);
    console.log(CONFIGS.method,'CONFIGS.method');
    this.refs.loading.hide();
    let path = 'loanconfirm';
    hashHistory.push({
      pathname: path,
      query: {
        ssoId: CONFIGS.userId,
        type: 'p'
      },
      state: {
        realAmount:CONFIGS.loanData.amount,
        b:2
      }
    });
  }

  render() {
    let props = { title: this.state.title};
    let {isLoading, loanData, dayData} = this.state;
    console.log(window.length++,'------------------------detail');

    return (
      <div className="loan-content gray-bg">
        <Nav data={props} />
        <WhiteSpace />
        <RulersLoan list={loanData} />
        <WhiteSpace />
        <RulersDay list={dayData} />
        <WhiteSpace />
        <LoanDetail />
        <footer>
          <button onClick={this.handleClick.bind(this)}>提交申请</button>
        </footer>
        <Loading ref="loading" show={isLoading} />
      </div>
    )
  }
}

export default Repay;
