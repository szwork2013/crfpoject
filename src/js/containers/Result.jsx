import React, { Component } from 'react';
import { withRouter } from 'react-router';
import { Nav, Result, ResultSteps, Loading } from 'app/components';
import { Toast, WhiteSpace } from 'antd-mobile';
import { hashHistory } from 'react-router';

class ResultPage extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      status: 0,
      contractNo: this.props.location.query.contractNo,
      type: this.props.location.query.type || 's',
      from: this.props.location.query.source || '',
      cash: this.props.location.query.cash || 0,
      isLoading: false,
      dataList: [{
        'process_status': 'i',
        'trace_content': '充值申请成功',
        'trace_time': '-',
        'coupon_amt': 0,
        'coupon_flag': 'N'
      }]
    };
  }

  componentDidMount() {
    //_paq.push(['trackEvent', 'P_ConsumptionRecord', '借款记录']);
    // if (!CONFIGS.userId) {
    //   this.getUserData();
    // } else {
    //   if (this.state.contractNo) {
    //     this.getInitData();
    //   } else {
    //     Toast.info('合同号缺失！');
    //   }
    // }
  }

  async getUserData() {
    CONFIGS.userId = this.props.location.query.ssoId;
    let homePath = CONFIGS.basePath + 'home/' + CONFIGS.userId;

    try {
      let fetchHomePromise = CRFFetch.Get(homePath);
      // 获取数据
      let resultHome = await fetchHomePromise;
      if (resultHome && !resultHome.response) {
        Object.assign(CONFIGS.home, resultHome);
        this.getInitData();
      }
    } catch (error) {
      let msgs = error.body;
      msgs.then((data) => {
        Toast.info(data.message);
      });
    }
  }

  async getInitData() {
    let path = CONFIGS.basePath + 'order/' + this.state.contractNo + '/status?type=' + this.state.type;
    try {
      let fetchPromise = CRFFetch.Get(path);
      // 获取数据
      let result = await fetchPromise;
      if (result && !result.response) {
        this.setState({
          isLoading: false
        });
        this.setStatus(result);
      }
    } catch (error) {
      this.setState({
        isLoading: false
      });
      let msgs = error.body;
      msgs.then((data) => {
        Toast.info(data.message);
      });
    }
  }

  setStatus(result) {
    this.setState({dataList: result});
    if (result[result.length - 1].process_status === 's') {
      this.setState({status: 2});
    } else if(result[result.length - 1].process_status === 'f' || result[result.length - 1].process_status === 'p' || result[result.length - 1].process_status === 'n') {
      this.setState({status: 1});
    }
  }

  getStatus() {
    let data = {
      cash: this.state.cash,
      type: this.state.type
    };
    if (this.state.source === 'loan') {
      data.name = '交易';
    } else {
      if (this.state.type === 'r') {
        data.name = '还款';
      } else {
        data.name = '借款';
      }
    }
    if (this.state.status === 1) {
      data.status = 'failed';
    } else if (this.state.status === 2) {
      data.status = 'success';
    }
    return data;
  }

  render() {
    const data = this.getStatus();
    let props = {title: `${data.name}动态`, status: this.state.status, contractNo: this.state.contractNo, from: this.state.from, type: this.state.type};
    const {isLoading} = this.state;

    return (
      <section>
        <Nav data={props} />
        <WhiteSpace />
        <div className="result-content">
          <Result data={data} />
          <ResultSteps data={this.state} />
        </div>
        <Loading show={isLoading} />
      </section>
    )
  }
}

export default withRouter(ResultPage);
