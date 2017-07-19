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
    const productNo = 'P2001002';
    const periodPath = `${CONFIGS.productPath}/params?kissoId=${CONFIGS.ssoId}&productNo=${productNo}`;

    try {
      let periodFetchPromise = CRFFetch.Get(periodPath);
      // 获取数据
      let periodResult = await periodFetchPromise;

      if (periodResult && !periodResult.response) {
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

        Object.assign(CONFIGS.loanPeriod,periodResult);//借款金额对应的数组

        //console.log(periodResult.productions.length,quotaResult.remainLimit,'************************************');
        //let defaultData = this.defaultData(quotaResult.remainLimit/100);//设置标尺，传入可用额度
        let defaultData = this.defaultData(periodResult);//考虑2期3期

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
      },() => {
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

  async getInitDataFetch(defaultData) {
    let { defaultDay, remainLimit } = defaultData;
    let d = new Date();

    CONFIGS.loanData.amount = remainLimit * 100;//分为单位
    CONFIGS.loanData.day = defaultDay;

    const params={
      productNo: 'P2001002',//未动态传入
      loanAmount: remainLimit,//金额只能是100-1500
      loanPeriod: defaultDay,//日期只能是14 or 30 or null
      startTime: `${d.getFullYear()}-${d.getMonth()+1}-${d.getDate()}`,
      periodUnit: 'D',//D是短期，M是分期，因为默认值是14跟30天，所以一定是短期
      kissoId: CONFIGS.ssoId,
    };

    //https://m-ci.crfchina.com/h5_dubbo/product/loanClause?productNo=P2001002&loanAmount=1500&loanPeriod=30&startTime=2017-07-10&periodUnit=D&kissoId=370486f0d16742b38138f3dc1839efcb
    let loanPath = `${CONFIGS.productPath}/loanClause?productNo=${params.productNo}&loanAmount=${params.loanAmount}&loanPeriod=${params.loanPeriod}&startTime=${params.startTime}&periodUnit=${params.periodUnit}&kissoId=${params.kissoId}`;

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
            //Toast.info(data.message);
            PubSub.publish('loanDetail:list', data.message);
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
    if(!this.refs.refLoanSubmit.classList.contains('disabled')){
      this.refs.loading.show();
      this.loanSubmitFetch();
    }
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

  defaultData(periodResult){
    //let maxAmount = remainLimit/100;
    let maxAmount = periodResult.productions.length;

    //生成借款数组
    let loanData = [];
    for(let i=1;i<=maxAmount;i++){
      loanData.push(i*100);
    }
    let curAmount = maxAmount<16 ? maxAmount : 15;

    CONFIGS.loanData.currentAmountCount = curAmount-1;


    curAmount = curAmount*100;
    let loanList = {
      data: loanData,//根据最大金额生成金额的数组
      currentAmount: curAmount,//默认金额，大于15默认显示15
    };//当max大于15时，data跟currentAmount不会对应，data.length大于currentAmount

    let maxDay;
    let defaultDay = maxAmount<=5 ? 14 : 30;//还有可能是null，金额是一定有的

    let productData = periodResult.productions[curAmount/100-1];

    if(productData.periodArray === null){
      if(productData.dayArray === null){
        //默认显示30天，天数不能拖动，显示错误信息，不能提交
        maxDay = 30;
      }else{
        //一般情况，只有1期，拖动dayArray的天数
        CONFIGS.loanData.period = 1;
        maxDay = productData.dayArray.length;
      }
    }else{
      CONFIGS.loanData.period = productData.periodArray.length + 1;//数组为[2],表示2期；为[2,3]表示3期,问清楚以后是否为[2,3,4]
      maxDay = (productData.periodArray.length + 1) * 30;
      if(productData.dayArray === null){
        //显示期数，只能拖动期数的范围，不能拖动天数

      }else{
        //有期数也有天数，拖动范围最大

      }
    }

    CONFIGS.loanData.dragDay = productData.dayArray.length;
    CONFIGS.loanData.dayArrayLength = productData.dayArray.length;
    CONFIGS.loanData.touchEndDay = productData.dayArray.length;

    let dayList = {
      data: productData.dayArray,//接口返回的天数
      currentDay: maxDay,//根据最大金额生成最大的天数
      defaultDay: defaultDay,//默认日期，按照规则只有14跟30天
    };

    this.setState({
      loanData: loanList,
      dayData: dayList,
    });

    return {
      remainLimit: curAmount,//默认金额，大于15默认显示15，只有100-1500
      defaultDay: defaultDay,//默认日期，按照规则只有14跟30天
    };
  }

  setMethodData(methodData) {
    Object.assign(CONFIGS.method, methodData);
    //console.log(CONFIGS.method,'CONFIGS.method');
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
          <button className="loan-submit-btn" onClick={this.handleClick.bind(this)} ref="refLoanSubmit">提交申请</button>
        </footer>
        <Loading ref="loading" show={isLoading} />
      </div>
    )
  }
}

export default Repay;
