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
      initQuota: '',
      maxQuota: '',
    };
  }

  componentDidMount() {
    _paq.push(['trackEvent', 'C_Page', 'E_P_Repay']);

    this.getQuota();//获取额度

    this.getInitData();//获取
  }

  async getQuota() {
    //https://m-ci.crfchina.com/h5_dubbo/loan/quota?kissoId=f9c36b0f4c034c0bb723fd67019dfdd0
    let quotaPath = `${CONFIGS.loanPath}/quota?kissoId=${CONFIGS.ssoId}`;

    try {
      let fetchPromise = CRFFetch.Get(quotaPath);
      // 获取数据
      let result = await fetchPromise;
      if (result && !result.response) {
        console.log(result);
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
        this.setState({
          initQuota: result.remainLimit,
          maxQuota: result.totalLimit,
        });

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

  async getInitData() {

    //https://m-ci.crfchina.com/h5_dubbo/repayment/plan?productNo=P2001002&loanAmount=50000&loanPeriod=12&startTime=2017-07-10&periodUnit=1&kissoId=f9c36b0f4c034c0bb723fd67019dfdd0
    const params={
      productNo: 'P2001002',
      loanAmount: '50000',
      loanPeriod: '12',
      startTime: '2017-07-10',
      periodUnit: '1',
      kissoId: CONFIGS.ssoId,
    };

    let loanPath = `${CONFIGS.repayPath}/plan?productNo=${params.productNo}&loanAmount=${params.loanAmount}&loanPeriod=${params.loanPeriod}&startTime=${params.startTime}&periodUnit=${params.periodUnit}&kissoId=${params.kissoId}`;

    try {
      let fetchPromise = CRFFetch.Get(loanPath);
      // 获取数据
      let result = await fetchPromise;
      if (result && !result.response) {
        console.log(result);

        this.setData(result);
      }
    } catch (error) {
      this.setState({
        isLoading: false
      });
      console.log('error--mock');
      //mock
      const result={
        "channel": "xhd",
        "detailList": {
          "loanScale": {
            "contract_name": "信而富现金贷借款服务协议",
            "contract_version": "0.01",
            "day_scale": "1|2|3|4|5|6|7|8|9|10|11|12|13|14|15|16|17|18|19|20|21|22|23|24|25|26|27|28|29|30|",
            "errorMessag": "",
            "loan_amount_max": "3300.0",
            "loan_amount_min": "100.0",
            "loan_amount_step": "100.0",
            "period_amount_min": "50.0",
            "period_limit": "1600",
            "period_scale": "",
            "result": "0",
            "return_ability": "700.00",
            "used_limit": "0.0"
          },
          "LoanPlan": [
            {
              "currBillDate": "2017-08-09",//账单日期
              "currCountMstAtm": "1602.00",//本期总额
              "currEndMstAtm": "0.00",//期末本金
              "currInterest": "27.00",//本期还息
              "currMstAtm": "1500.00",//本期还本
              "currStartMstAtm": "1500.00",//期初本金
              "handleFee": "75.00",//手续费
              "period": "1"//期号
            },
            {
              "currBillDate": "2017-08-10",//账单日期
              "currCountMstAtm": "1610.00",//本期总额
              "currEndMstAtm": "0.00",//期末本金
              "currInterest": "35.00",//本期还息
              "currMstAtm": "1500.00",//本期还本
              "currStartMstAtm": "1500.00",//期初本金
              "handleFee": "75.00",//手续费
              "period": "1"//期号
            }
          ],
          "LoanClause": {
            "billDate": "2017-08-09",
            "channelFee": "",
            "countMstAtm": "1602.00",
            "dInterestRate": "0.0006",
            "dOverDueRate": "3.0000",
            "dailyFreeHandFeeTimes": "3",
            "handingFeeFix": "75.00",
            "interestFreeDays": "3",
            "loanAmount": "1500.00",
            "loanPeriod": "30",
            "mInterestRate": "0.0180",
            "mOverDueRate": "90.0000",
            "monthFreeHandFeeTimes": "30",
            "overDueFreeDays": "3",
            "periodYN": "A",
            "productVersion": "1",
            "startTime": "2017-07-10",
            "totalInterestFee": "27.00",
            "totalRtnAmount": "1500.00",
            "yInterestRate": ""
          }
        },
        "result": "0",
        "errMsg": ""
      };

      PubSub.publish('loanDetail:list', result.detailList.LoanPlan);

      /*
      CRFFetch.handleError(error, Toast, () => {
        if (error.response.status === 400) {
          error.body.then(data => {
            Toast.info(data.message);
          });
        }
      }, () => {
        let path = 'repay';
        hashHistory.push({
          pathname: path,
          query: {
            ssoId: CONFIGS.userId
          }
        });
      });*/
    }
  }

  async loanSubmitFetch(){
    const params={
      loanAmount: '',//金额
      loanDays: '',//借款天数
      loanProductNo: '',//产品
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
      this.setMethodData({});
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
    this.refs.loading.hide();
    let path = 'loanconfirm';
    hashHistory.push({
      pathname: path,
      query: {
        ssoId: CONFIGS.userId,
        type: 'l'
      },
      state: {
        realAmount:1000,
        b:2
      }
    });
  }

  render() {
    let props = { title: this.state.title};
    let {isLoading, couponsData} = this.state;

    //mock
    let maxAmount=this.state.maxQuota/10000;
    let arr=[];
    for(let i=1;i<=maxAmount;i++){
      arr.push(i*100);
    }

    let curAmount=0;
    if(maxAmount<=12){
      curAmount=maxAmount;
    }else{
      curAmount=Math.ceil(maxAmount/2);
    }

    let data = {
      data:arr,//mock this.state.data
      currentAmount: curAmount*100
    };
    console.log(data,'data');


    //mock
    let arr2=[];
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
      arr2.push(i);
    }

    let data2 = {
      data:arr2,
      currentDay:maxDay,
    };
    return (
      <div className="loan-content gray-bg">
        <Nav data={props} />
        <WhiteSpace />
        <RulersLoan list={data} />
        <WhiteSpace />
        <RulersDay list={data2} />
        <WhiteSpace />
        {/*<Present list={couponsData} />
        <Coupons />*/}
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
