import React, { Component } from 'react';
import { Nav, RulersLoan, RulersDay, Present, Coupons, Loading, LoanDetail } from 'app/components';
import { Toast, WhiteSpace } from 'antd-mobile';
import { hashHistory } from 'react-router';
import Numeral from 'numeral';
import PubSub from 'pubsub-js';

class Repay extends Component {
  constructor(props){
    super(props);
    CONFIGS.userId = this.props.location.query.ssoId;
    this.state = {
      title: '借款申请',
      data: [],
      couponsData: [],
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
    let quotaPath = `${CONFIGS.loanPath}/quota?kissoId=${CONFIGS.ssoId}`;

    try {
      let fetchPromise = CRFFetch.Get(quotaPath);
      // 获取数据
      let result = await fetchPromise;

      this.setState({
        isLoading: false
      });

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
        const defaultData = this.defaultData(result.remainLimit/100);//设置标尺

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
      this.setState({
        isLoading: false
      });
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
    let d = new Date();

    let period = defaultData.defaultDay>30 ? 'M' : 'D';

    CONFIGS.loanData.amount = defaultData.remainLimit * 100;//分为单位
    CONFIGS.loanData.day = defaultData.defaultDay;

    console.log(defaultData.remainLimit,'以分');
    const params={
      productNo: 'P2001002',//未动态传入
      loanAmount: defaultData.remainLimit,
      loanPeriod: defaultData.defaultDay,
      startTime: `${d.getFullYear()}-${d.getMonth()+1}-${d.getDate()}`,
      periodUnit: period,//D是短期，M是分期
      kissoId: CONFIGS.ssoId,
    };

    let loanPath = `${CONFIGS.repayPath}/plan?productNo=${params.productNo}&loanAmount=${params.loanAmount}&loanPeriod=${params.loanPeriod}&startTime=${params.startTime}&periodUnit=${params.periodUnit}&kissoId=${params.kissoId}`;

    try {
      let loanFetchPromise = CRFFetch.Get(loanPath);

      // 获取数据
      let loanResult = await loanFetchPromise;

      this.setState({
        isLoading: false
      });

      if (loanResult && !loanResult.response) {
        //console.log(loanResult);
        PubSub.publish('loanDetail:list', loanResult.detailList.LoanPlan);
      }

    } catch (error) {

      this.setState({
        isLoading: false
      });

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

  setData(repayData) {
    Object.assign(CONFIGS.repayData, repayData);
    let repay = this.convertRepayData(repayData);
    Object.assign(CONFIGS.rulerData, repay);

    this.setState({
      isLoading: false,
      data: repay
    });
  }

  defaultData(remainLimit){
    let maxAmount = remainLimit/100;

    //生成借款数组
    let loanData=[];
    for(let i=1;i<=maxAmount;i++){
      loanData.push(i*100);
    }
    let curAmount = maxAmount<16 ? maxAmount : 15;
    let loanList = {
      data: loanData,
      currentAmount: curAmount*100
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
      remainLimit: curAmount*100,
      defaultDay: defaultDay,
    };
  }

  convertRepayData(repayData) {
    let currentAmount = repayData.curr_amt;
    let totalAmount = repayData.total_amt;
    CONFIGS.currentAmount = Numeral(currentAmount).divide(100).value();

    //mock
    //CONFIGS.currentAmount=1200;

    let leftData = [], rightData = [];
    // 构造大于currentAmount的数组
    while (currentAmount < totalAmount) {
      let amount = Numeral(currentAmount).divide(100);
      rightData.push(amount.value());
      currentAmount = currentAmount + CONFIGS.defaultScale;
    }
    rightData.push(Numeral(totalAmount).divide(100).value());
    // 构造小于currentAmount的数组
    currentAmount = currentAmount - CONFIGS.defaultScale;
    while (currentAmount > CONFIGS.defaultScale) {
      let amount = Numeral(currentAmount).divide(100);
      leftData.push(amount.value());
      currentAmount = currentAmount - CONFIGS.defaultScale;
    }
    if (leftData.length > 0) {
      leftData.push(Numeral(CONFIGS.defaultScale).divide(100).value());
      leftData.sort(function(a, b) {
        return a - b;
      });
    }
    if(currentAmount > 0 && leftData.length === 0) {
      leftData.push(CONFIGS.defaultScale);
    }
    let finalData = leftData.concat(rightData);
    return finalData;
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
    let {isLoading, couponsData, loanData, dayData} = this.state;

    return (
      <div className="loan-content gray-bg">
        <Nav data={props} />
        <WhiteSpace />
        <RulersLoan list={loanData} />
        <WhiteSpace />
        <RulersDay list={dayData} getInitDataFetch={this.getInitDataFetch.bind(this)} />
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
