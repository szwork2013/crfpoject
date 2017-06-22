import React, { Component } from 'react';
import { Nav, SendSms } from 'app/components';
import { Toast, WhiteSpace, List } from 'antd-mobile';
import { hashHistory } from 'react-router';
import Numeral from 'numeral';
import ReactTooltip from 'react-tooltip';
const Item = List.Item;

class RepayConfirm extends Component {
  constructor(props){
    super(props);
    this.state = {
      title: '还款确认',
      way: '',
      amount: 0,
      coupon: 0
    };
  }

  componentDidMount() {
    setTimeout(() => {
      this.setState({
        way: '交通银行储蓄卡(8841)',
        amount: 1000,
        coupon: 3
      });
    }, 1000);
  }

  render() {
    let props = { title: this.state.title};
    let {way, amount, coupon} = this.state;
    let totalAmount = () => {
      let formatTotalAmount = Numeral(coupon + amount).format('0, 0.00');
      let formatCoupon = Numeral(coupon).format('0, 0.00');
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
          <Item extra={way}>还款方式</Item>
          <Item extra={totalAmount()}>还款金额</Item>
        </List>
        <WhiteSpace />
        <SendSms />
        <ReactTooltip id='description' place="bottom" className="crf-tooltips" effect='solid'>
          <span>单笔还款金额的0.3%, 最低1.5元, 最高10元</span>
        </ReactTooltip>
      </div>
    )
  }
}

export default RepayConfirm;
