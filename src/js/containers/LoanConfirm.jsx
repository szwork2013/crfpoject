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

    let amount = props.location.state && Numeral(props.location.state.realAmount).divide(100).format('0, 0.00');

    this.state = {
      kissoId: CONFIGS.userId || '',
      title: '借款确认',
      way: '',
      amount: amount || '',
      fee: 0,
      details: '',
      isLoading: true,
    };
  }

  componentDidMount() {
    //this.getInitData();
    console.log(this.props);

    //this.getBankInfo();
    this.getInitData();

    this.getActivityFetch();
  }

  async getActivityFetch(){
    //https://m-ci.crfchina.com/h5_dubbo/loan/activity?kissoId=370486f0d16742b38138f3dc1839efcb
    let activityPath=`${CONFIGS.loanPath}/activity?kissoId=${CONFIGS.ssoId}`;
    try {
      let fetchAccountPromise = CRFFetch.Get(activityPath);
      // 获取数据
      let accountResult = await fetchAccountPromise;
      if (accountResult && !accountResult.response) {
        //this.setData(accountResult);活动，暂不显示
      }
    } catch (error) {
      this.setState({
        isLoading: false
      });
    }
  }

  async getInitData() {
    let accountPath = `${CONFIGS.ftsPath}/${CONFIGS.ssoId}/borrower_open_account`;

    try {
      let fetchAccountPromise = CRFFetch.Get(accountPath);

      // 获取数据
      let accountResult = await fetchAccountPromise;

      if (accountResult && !accountResult.response) {
        this.setData(accountResult);
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

  setData(accountData) {
    Object.assign(CONFIGS.account, accountData);
    let way = `${accountData.bankName}(${accountData.bankCardNo.slice(-4)})`;

    this.setState({
      way: way,
      isLoading: false
    });
  }

  render() {
    let props = { title: this.state.title};
    let {way, amount, fee, isLoading, details} = this.state;

    let totalAmount = () => {
      let formatTotalAmount = Numeral(amount).format('0, 0.00');
      return (
        <div className="crf-confirm-details">
          <div className="crf-confirm-amount">
            <span className="number">{`${formatTotalAmount}`}</span>
            <span>元</span>
          </div>
        </div>
      );
    };

    return (
      <div>
        <Nav data={props} />
        <WhiteSpace />
        <List className="crf-list crf-confirm">
          <Item extra={totalAmount()}>借款金额</Item>
          <Item extra={way}>到账银行卡</Item>
        </List>
        <WhiteSpace />
        <SendSms show={isLoading} pathname="loanconfirm"/>
        <SetContract className="loan-contract" curPath="loanconfirm" />
        <ReactTooltip id='description' place="bottom" className="crf-tooltips" effect='solid'>
          <span>{details}</span>
        </ReactTooltip>
        <Loading show={isLoading} />
      </div>
    )
  }
}

export default RepayConfirm;
