import React, { Component } from 'react';
import { withRouter } from 'react-router';
import { Nav, Result, ResultSteps, Loading } from 'app/components';
import { Toast, WhiteSpace } from 'antd-mobile';
import { hashHistory } from 'react-router';

class ResultPage extends Component {
  constructor(props, context) {
    super(props, context);
    CONFIGS.userId = this.props.location.query.ssoId;
    this.timer = null;
    this.state = {
      status: 0,
      contractNo: this.props.location.query.contractNo,
      type: this.props.location.query.type || 's',
      from: this.props.location.query.source || '',
      cash: this.props.location.query.cash || 0,
      isLoading: true,
      dataList: []
    };
  }

  componentDidMount() {
    //_paq.push(['trackEvent', 'P_ConsumptionRecord', '借款记录']);
    this.getInitData();
    this.timer = setInterval(() => {
      this.getInitData();
    }, 10000);
  }

  async getInitData() {

    let path = `${CONFIGS.repayPath}/dynamics?kissoId=${CONFIGS.userId}&repayNo=${this.state.contractNo}`;

    if(this.props.location.state&&this.props.location.state.currentPath === 'loanconfirm'){
      path = `${CONFIGS.loanPath}/dynamics?kissoId=${CONFIGS.ssoId}&loanNo=CRF01884667554126655488`;
    }

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
      });
    }
  }

  setStatus(result) {
    this.setState({dataList: result});
    if (result[result.length - 1].process_status === 's') {
      this.setState({status: 2});
      clearInterval(this.timer);
      _paq.push(['trackEvent', 'C_RepayResult', 'E_P_Repay_Successed', '还款成功']);
    } else if(result[result.length - 1].process_status === 'f' || result[result.length - 1].process_status === 'p' || result[result.length - 1].process_status === 'n') {
      this.setState({status: 1});
      clearInterval(this.timer);
      _paq.push(['trackEvent', 'C_RepayResult', 'E_SubmitRepay_Failed', '还款失败']);
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
      <section className="result-content">
        <Nav data={props} />
        <WhiteSpace />
        <Result data={data} />
        <ResultSteps data={this.state} />
        <Loading show={isLoading} />
      </section>
    )
  }
}

export default withRouter(ResultPage);
