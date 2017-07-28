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
      cash: '-',
      isLoading: true,
      dataList: [],
      title: '',
      creditType: null,
      fromRemote: false
    };
  }

  componentDidMount() {
    if (this.state.type !== 'r') {
      _paq.push(['trackEvent', 'C_Page', 'E_P_ResultLoan']);
    } else {
      _paq.push(['trackEvent', 'C_Page', 'E_P_ResultRepay']);
    }
    this.getInitData();
    this.timer = setInterval(() => {
      this.getInitData();
    }, 10000);
  }

  async getInitData() {
    this.setState({
      fromRemote: false
    });
    let path = `${CONFIGS.repayPath}/dynamics?kissoId=${CONFIGS.userId}&repayNo=${this.state.contractNo}`;
    if (this.state.type !== 'r') {
      path = `${CONFIGS.loanPath}/dynamics?kissoId=${CONFIGS.ssoId}&loanNo=${this.state.contractNo}&trxnType=${this.state.type}`;
    }

    try {
      let fetchPromise = CRFFetch.Get(path);
      // 获取数据
      let result = await fetchPromise;
      if (result && !result.response) {
        this.setState({
          isLoading: false, fromRemote: true
        });
        this.setStatus(result);
      }
    } catch (error) {
      this.setState({
        isLoading: false, fromRemote: true
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

  setStatus(data) {
    let result = data.trace_list;
    if(result.length !== 0) {
      if (result[result.length - 1].process_status === 's') {
        this.setState({dataList: result, status: 2, title: result[result.length - 1].trace_content, cash: data.loan_pay_amt, creditType: data.credit_type});
        clearInterval(this.timer);
        _paq.push(['trackEvent', 'C_RepayResult', 'E_P_Repay_Successed', '还款成功']);
      } else if (result[result.length - 1].process_status === 'f' || result[result.length - 1].process_status === 'p' || result[result.length - 1].process_status === 'n') {
        this.setState({dataList: result, status: 1, title: result[result.length - 1].trace_content, cash: data.loan_pay_amt, creditType: data.credit_type});
        clearInterval(this.timer);
        _paq.push(['trackEvent', 'C_RepayResult', 'E_SubmitRepay_Failed', '还款失败']);
      } else {
        this.setState({dataList: result, title: result[result.length - 1].trace_content, cash: data.loan_pay_amt, creditType: data.credit_type});
      }
    }
  }

  getStatus() {
    let data = {
      cash: this.state.cash,
      type: this.state.type,
      title: this.state.title,
      creditType: this.state.creditType
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

    if (this.state.type !== 'r') {
      data.isLoanConfirm = true;
    }
    return data;
  }

  render() {
    const data = this.getStatus();
    let props = {title: `${data.name}动态`, status: this.state.status, contractNo: this.state.contractNo, from: this.state.from, type: this.state.type};

    let loanClassName = '';
    if (this.state.type !== 'r') {
      //props.status = 3; //借款暂不显示
      loanClassName = 'loan-text-color';
    }

    const {isLoading, fromRemote} = this.state;
    let resultContent = null;
    if (fromRemote) {
      resultContent = (
        <div>
          <Result data={data} />
          <ResultSteps data={this.state} loanClassName={loanClassName} />
        </div>
      );
    } else {
      resultContent = <div></div>
    }
    return (
      <section className="result-content">
        <Nav data={props} />
        <WhiteSpace />
        {resultContent}
        <Loading show={isLoading} />
      </section>

    )
  }
}

export default withRouter(ResultPage);
