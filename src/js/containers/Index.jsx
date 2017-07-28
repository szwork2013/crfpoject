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

    try {
      let fetchPromise = CRFFetch.Get(creditPath);
      // 获取数据
      let result = await fetchPromise;
      if (result && !result.response) {
        this.setState({
          isLoading: false,
          isShow: true,
          creditData: result
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

  handleBindCard() {
    let currentPath = window.location.href;
    let path = `/?${currentPath}`;
    let storge = window.localStorage;
    storge.setItem('crf-origin-url', currentPath);
    hashHistory.push(path);
  }

  handleLoan() {
    let currentPath = `index?ssoId=${CONFIGS.userId}`;
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
    let currentPath = `index?ssoId=${CONFIGS.userId}`;
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
    let currentPath = `index?ssoId=${CONFIGS.userId}`;
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
    let {isLoading, isShow, creditData} = this.state;
    return (
      <section className="full-wrap">
        <Nav data={props} />
        <Credit data={creditData} />
        {isShow &&
          <List className="crf-list crf-credit">
            <Item arrow="horizontal" className='crf-credit-item' extra="绑卡成功才可进行借款操作" onClick={this.handleBindCard.bind(this)}>立即绑卡</Item>
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
