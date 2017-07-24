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
      type: this.props.location.query.type || 'p',
      from: this.props.location.query.source || '',
      cash: this.props.location.query.cash || 0,
      isLoading: true,
      dataList: [],
      title: ''
    };
  }

  componentDidMount() {
    if(this.props.location.state && this.props.location.state.currentPath === 'loanconfirm'){
      _paq.push(['trackEvent', 'C_Page', 'E_P_ResultLoan']);
    }else{
      _paq.push(['trackEvent', 'C_Page', 'E_P_ResultRepay']);
    }
    //_paq.push(['trackEvent', 'P_ConsumptionRecord', '借款记录']);
    this.getInitData();
    this.timer = setInterval(() => {
      this.getInitData();
    }, 10000);
  }

  async getInitData() {

    let path = `${CONFIGS.repayPath}/dynamics?kissoId=${CONFIGS.userId}&repayNo=${this.state.contractNo}`;

    if(this.props.location.state && this.props.location.state.currentPath === 'loanconfirm'){
      path = `${CONFIGS.loanPath}/dynamics?kissoId=${CONFIGS.ssoId}&loanNo=${this.state.contractNo}`;
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
        let hashPath;
        if(path.indexOf(CONFIGS.loanPath)>-1){
          hashPath = 'loan';
        }else{
          hashPath = 'repay';
        }
        hashHistory.push({
          pathname: hashPath,
          query: {
            ssoId: CONFIGS.userId
          }
        });
      });
    }
  }

  setStatus(result) {
    if(result.length !== 0) {
      if (result[result.length - 1].process_status === 's') {
        this.setState({dataList: result, status: 2, title: result[result.length - 1].trace_content});
        clearInterval(this.timer);
        _paq.push(['trackEvent', 'C_RepayResult', 'E_P_Repay_Successed', '还款成功']);
      } else if (result[result.length - 1].process_status === 'f' || result[result.length - 1].process_status === 'p' || result[result.length - 1].process_status === 'n') {
        this.setState({dataList: result, status: 1, title: result[result.length - 1].trace_content});
        clearInterval(this.timer);
        _paq.push(['trackEvent', 'C_RepayResult', 'E_SubmitRepay_Failed', '还款失败']);
      } else {
        this.setState({dataList: result, title: result[result.length - 1].trace_content});
      }
    }
  }

  getStatus() {
    let data = {
      cash: this.state.cash,
      type: this.state.type,
      title: this.state.title
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

    if(this.props.location.state&&this.props.location.state.currentPath === 'loanconfirm'){
      data.isLoanConfirm = true;
    }
    return data;
  }

  render() {
    const data = this.getStatus();
    let props = {title: `${data.name}动态`, status: this.state.status, contractNo: this.state.contractNo, from: this.state.from, type: this.state.type};

    let loanClassName = '';
    if(this.props.location.state&&this.props.location.state.currentPath === 'loanconfirm'){
      props.status = 3;//借款暂不显示
      loanClassName = 'loan-text-color';
    }

    const {isLoading} = this.state;

    return (
      <section className="result-content">
        <Nav data={props} />
        <WhiteSpace />
        <Result data={data} />
        <ResultSteps data={this.state} loanClassName={loanClassName} />
        <Loading show={isLoading} />
      </section>
    )
  }
}

export default withRouter(ResultPage);
