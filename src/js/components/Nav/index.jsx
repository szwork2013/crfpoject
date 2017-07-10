import React, { Component } from 'react';
import { hashHistory } from 'react-router';
import styles from './index.scss';

export default class Nav extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      title: this.props.data.title,
      stage: this.props.data.stage,
      status: this.props.data.status,
      contractNo: this.props.data.contractNo,
      from: this.props.data.from,
      type: this.props.data.type,
      isApp: this.props.data.isApp
    };
    this.handleBack = this.handleBack.bind(this);
    this.handleGoHome = this.handleGoHome.bind(this);
    this.handleDetail = this.handleDetail.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    this.setState(nextProps.data);
  }

  componentDidMount() {
    /*console.log(CONFIGS.referrerUrl,'referrer');
    console.log(location.hash);*/
    Common.setDocTitle(this.state.title);
  }

  handleBack() {
    let couponsContainer = document.getElementsByClassName('coupons-container')[0];

    if (couponsContainer && couponsContainer.classList.contains('show')) {
      couponsContainer.classList.remove('show');
      couponsContainer.classList.add('hide');
    } else {

      let refUrl=CONFIGS.referrerUrl;
      let lnHash=location.hash;

      if(refUrl.indexOf('#/loan?')>-1 ){  //话费页
        if(lnHash.indexOf('supportcard')>-1||lnHash.indexOf('contract')>-1){

          /*let path = '/?' + CONFIGS.referrerUrl;

          hashHistory.push(path);*/
          hashHistory.goBack();
          return;
        }
        if(lnHash.indexOf('#/?')>-1 || lnHash.indexOf('#/rebindcard?')>-1){
          // /credit_loan/#/?https://m-ci.crfchina.com/consumption/#/recharge?ssoId=f9c36b0f4c034c0bb723fd67019dfdd0
          refUrl=CONFIGS.referrerUrl.replace('#/loan?','#/recharge?');
        }
        location.href=refUrl;
      } else { //首页
        if(lnHash.indexOf('#/?')>-1 || lnHash.indexOf('#/rebindcard?')>-1 || lnHash.indexOf('#/success?')>-1){
          location.href=refUrl;
        }else{
          hashHistory.goBack();
        }
      }


    }
  }

  handleGoHome() {
    let path = '/?ssoId=' + CONFIGS.userId;
    hashHistory.push(path);
  }

  handleDetail() {
    // let category = 'C_ConsumptionRecord';
    // let eventName = 'E_ConsumptionRecord';
    // _paq.push(['trackEvent', category, eventName, '借款记录']);
    let path = 'detail';
    hashHistory.push({
      pathname: path,
      query: {
        contractNo: this.state.contractNo
      }
    });
  }

  render() {
    let { stage, title, status, from, contractNo, type } = this.state;
    /*let rootClass = '';
    if (stage === 'home') {
      rootClass = styles.root;
    } else {
      rootClass = styles.child;
    }*/
    let rightEle = null;
    if (status === 2) { //2 show
      rightEle = <span className={styles.dark} onClick={this.handleDetail}>明细</span>
    }
    let leftEle = null;
    if (from === 'loan') { //from loan show finish
      leftEle = <span className={styles.dark} onClick={this.handleGoHome}>完成</span>
    } else {
      leftEle = <span className={styles.navbarLeftIcon} onTouchTap={this.handleBack}></span>;
      //if(contractNo) title = CONFIGS.billType[type] + '动态';
    }
    return (
      CONFIGS.isWeChat
      ?
      (<div></div>)
      :
      (<nav className={styles.root}>
        <div className={styles.navbarLeft}>
          {leftEle}
        </div>
        <div className={styles.navbarTitle}>{title}</div>
        <div className={styles.navbarRight}>
          {rightEle}
        </div>
      </nav>)
    )
  }
}
