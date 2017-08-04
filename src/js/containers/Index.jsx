import React, { Component } from 'react';
import { withRouter } from 'react-router';
import { Nav, Credit, Loading } from 'app/components';
import { Toast, List } from 'antd-mobile';
import { hashHistory } from 'react-router';
const Item = List.Item;

class Index extends Component {
  constructor(props, context) {
    super(props);
    CONFIGS.userId = this.props.location.query.ssoId;
    this.state = {
      isLoading: true,
      isBindCard: false,
      isShow: false,
      creditData: {
        remainLimit: '-',
        totalLimit: '-'
      }
    };
  }

  componentDidMount() {
    _paq.push(['trackEvent', 'C_Page', 'E_P_Credit_Home']);
    this.getInitData();
  }

  async getInitData() {
    let creditPath = `${CONFIGS.loanPath}/quota?kissoId=${CONFIGS.userId}`;
    let creditLoanPath = `${CONFIGS.ftsPath}/${CONFIGS.ssoId}/borrower_open_account`;
    
    try {
      let fetchPromise = CRFFetch.Get(creditPath);
      let fetchCreditLoanPromise = CRFFetch.Get(creditLoanPath);
    
      // 获取数据并确定是否已经绑卡
      let result = await fetchPromise;
      let resultCreditLoan = await fetchCreditLoanPromise; 
      if (result && !result.response) {
        this.setState({
          isLoading: false,
          isShow: true,
          creditData: result
        });
        if (resultCreditLoan && !resultCreditLoan.response) {
          this.setState({
            isBindCard:true,
            creditData:resultCreditLoan
          });
        }
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

  handleBindCard() {
    _paq.push(['trackEvent', 'C_H5_homepage', 'E_H5_homepage_tie']);
    CONFIGS.isFromCredit = true;
    let currentPath = window.location.href;
    let path = `/?${currentPath}`;
    let storge = window.localStorage;
    storge.setItem('crf-origin-url', currentPath);
    hashHistory.push(path);
  }

  handleLoan() {
    _paq.push(['trackEvent', 'C_H5_homepage', 'E_H5_homepage_loan']);
    CONFIGS.isFromCredit = true;
    let currentPath = window.location.href;
    let path = 'loan';
    let storge = window.localStorage;
    storge.setItem('crf-origin-url', currentPath);
    hashHistory.push({
      pathname: path,
      query: {
        ssoId: CONFIGS.userId
      }
    });
  }

  handleRepay() {
    _paq.push(['trackEvent', 'C_H5_homepage', 'E_H5_homepage_repayment']);
    CONFIGS.isFromCredit = true;
    let currentPath = window.location.href;
    let path = 'repay';
    let storge = window.localStorage;
    storge.setItem('crf-origin-url', currentPath);
    hashHistory.push({
      pathname: path,
      query: {
        ssoId: CONFIGS.userId
      }
    });
  }

  handleBill() {
    _paq.push(['trackEvent', 'C_H5_homepage', 'E_H5_homepage_bill']);
    CONFIGS.isFromCredit = true;
    let currentPath = window.location.href;
    let path = 'bill';
    let storge = window.localStorage;
    storge.setItem('crf-origin-url', currentPath);
    hashHistory.push({
      pathname: path,
      query: {
        ssoId: CONFIGS.userId
      }
    });
  }

  handleDownload() {
    _paq.push(['trackEvent', 'C_H5_homepage', 'E_H5_homepage_download']);
    CONFIGS.isFromCredit = true;
    if (/(Android)/i.test(navigator.userAgent)) {
      // 判断是否是腾讯浏览器中打开
      if (/MQQBrowser/i.test(navigator.userAgent)) {
      	window.location.href = 'http://a.app.qq.com/o/simple.jsp?pkgname=com.crfchina.market';
      } else {
        window.location.href = 'http://app-dw.crfchina.com/android/crf_app_last.apk';
      }
    } else {
      window.location.href = 'http://a.app.qq.com/o/simple.jsp?pkgname=com.crfchina.market';
    }
  }

  render() {
    let props = {title: '信而富', stage: 'index'};
    let {isLoading, isShow, creditData, isBindCard} = this.state;
    return (
      <section className="full-wrap">
        <Nav data={props} />
        <Credit data={creditData} />
        {isShow &&
          <List className="crf-list crf-credit">
            {
              isBindCard && <Item arrow="horizontal" className='crf-credit-item' extra="绑卡成功才可进行借款操作" onClick={this.handleBindCard.bind(this)}>立即绑卡</Item>
            }
            <Item arrow="horizontal" className='crf-credit-item' onClick={this.handleLoan.bind(this)}>我要借款</Item>
            <Item arrow="horizontal" className='crf-credit-item' onClick={this.handleRepay.bind(this)}>我要还款</Item>
            <Item arrow="horizontal" className='crf-credit-item' onClick={this.handleBill.bind(this)}>查看账单</Item>
            <Item arrow="horizontal" className='crf-credit-item' extra="立即下载" onClick={this.handleDownload.bind(this)}>下载信而富APP</Item>
          </List>
        }
        <Loading  show={isLoading} />
      </section>
    )
  }
}

export default withRouter(Index);
