import React, { Component } from 'react';
import { Nav, SendSms, Loading, SetContract } from 'app/components';
import { Toast, WhiteSpace, List } from 'antd-mobile';
import Numeral from 'numeral';
import ReactTooltip from 'react-tooltip';
import { hashHistory } from 'react-router';


const Item = List.Item;

class RepayConfirm extends Component {
  constructor(props) {
    super(props);
    CONFIGS.sendSmsType = props.location.query.type;
    if (!CONFIGS.userId) {
      CONFIGS.userId = props.location.query.ssoId || ''
    }
    this.state = {
      kissoId: CONFIGS.userId || '',
      title: '借款确认',
      way: '',
      amount: props.location.query.realAmount || '',
      fee: 0,
      details: '',
      isLoading: true
    };
  }

  componentDidMount() {
    this.getInitData();
  }

  async getInitData() {
    let currentAmount = Numeral(this.props.location.query.realAmount).multiply(100).value();
    let accountPath = `${CONFIGS.basePath}fts/{kissoId}/borrower_open_account?kissoId=${this.state.kissoId}`;
    let methodPath = `${CONFIGS.repayPath}/method?kissoId=${this.state.kissoId}&repayAmount=${currentAmount}`;
    try {
      let fetchAccountPromise = CRFFetch.Get(accountPath);
      let fetchMethodPromise = CRFFetch.Get(methodPath);
      // 获取数据
      let accountResult = await fetchAccountPromise;
      let methodResult = await fetchMethodPromise;
      if (accountResult && !accountResult.response && methodResult && !methodResult.response) {
        this.setData(accountResult, methodResult);
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

  setData(accountData, methodData) {
    Object.assign(CONFIGS.account, accountData);
    Object.assign(CONFIGS.method, methodData);
    let way = `${accountData.bankName}(${accountData.bankCardNo.slice(-4)})`;
    let currentAmount = Numeral(methodData.repayTotalAmt).divide(100).value();
    let currentFee = Numeral(methodData.channelFee).divide(100).value();
    this.setState({
      way: way,
      amount: currentAmount,
      fee: currentFee,
      details: methodData.channelFeeDesc,
      isLoading: false
    });
  }

  render() {
    let props = { title: this.state.title};
    let {way, amount, fee, isLoading, details} = this.state;
    let totalAmount = () => {
      let formatTotalAmount = Numeral(amount).format('0, 0.00');
      let formatCoupon = Numeral(fee).format('0, 0.00');
      return (
        <div className="crf-confirm-details">
          <div className="crf-confirm-amount">
            <span className="number">{`${formatTotalAmount}`}</span>
            <span>元</span>
          </div>
          <div className="crf-confirm-des">
            <span className="tooltip-icon" data-tip data-for="description"></span>
            <span className="crf-confirm-des-text">{`(含支付通道费${formatCoupon}元) `}</span>
          </div>
        </div>
      );
    };

    return (
      <div>
        <Nav data={props} />
        <WhiteSpace />
        <List className="crf-list crf-confirm">
          <Item extra={way}>借款金额</Item>
          <Item extra={totalAmount()}>到账银行卡</Item>
        </List>
        <WhiteSpace />
        <SendSms show={isLoading}/>
        <SetContract />
        <ReactTooltip id='description' place="bottom" className="crf-tooltips" effect='solid'>
          <span>{details}</span>
        </ReactTooltip>
        <Loading show={isLoading} />
      </div>
    )
  }
}

export default RepayConfirm;
