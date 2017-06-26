import React, { Component } from 'react';
import { Nav } from 'app/components';
import { Toast, WhiteSpace, Modal } from 'antd-mobile';
import { hashHistory } from 'react-router';
import Numeral from 'numeral';
import ReactTooltip from 'react-tooltip';

class Channel extends Component {
  constructor(props){
    super(props);
    this.state = {
      title: '还款方式',
      amount: 1203.6,
      fees: 3.6,
      details: '单笔还款金额的0.3%, 最低1.5元, 最高10元',
      onlyWeixin: false,
      modalPhone: false
    };
  }

  componentDidMount() {

  }

  handleClick() {
    let path = 'repayconfirm';
    hashHistory.push({
      pathname: path,
      query: {
        ssoId: CONFIGS.userId
      }
    });
  }

  showCall = key => (e) => {
    e.preventDefault(); // 修复 Android 上点击穿透
    let u = navigator.userAgent;
    let isiOS = !!u.match(CONFIGS.iosRegx); //ios终端
    if (isiOS) {
      window.location = `tel:${CONFIGS.csPhone}`;
    } else {
      this.setState({
        [key]: true,
      });
    }
  }

  onClose = key => () => {
    this.setState({
      [key]: false,
    });
  }

  onCall() {
    window.location = `tel:${CONFIGS.csPhone}`;
    this.setState({
      modalPhone: false,
    });
  }

  render() {
    const props = { title: this.state.title};
    const {amount, fees, details} = this.state;
    const formatAmount = Numeral(amount).format('0, 0.00');
    const formatFees = Numeral(fees).format('0, 0.00');
    const formatPhone = HandleRegex.formatPhone(CONFIGS.csPhone, '-');

    return (
      <div>
        <Nav data={props} />
        <WhiteSpace />
        <section className="main-content gray-bg">
          <section className="crf-common-container">
            <div className="crf-common-title">
              <span className="crf-common-title-text">还款金额(元)</span>
            </div>
            <div className="crf-common-amount">
              <span className="crf-common-amount-text">{formatAmount}</span>
            </div>
            <div className="crf-confirm-des">
              <span className="tooltip-icon" data-tip data-for="description"></span>
              <span className="crf-confirm-des-text">{`(含支付通道费${formatFees}元) `}</span>
            </div>
          </section>
        </section>
        <footer className="crf-channel-footer">
          <button className="channel-btn" onClick={this.handleClick.bind(this)}><span className="weixin-icon"></span><span>微信还款</span></button>
          <button className="normal-btn" onClick={this.handleClick.bind(this)}>快捷还款</button>
          <div className="crf-channel-details">如您还款遇到问题, 可拨打客服电话<a onClick={this.showCall('modalPhone')}>{formatPhone}</a>咨询哦</div>
          <Modal
            title={formatPhone}
            transparent
            maskClosable={false}
            visible={this.state.modalPhone}
            onClose={this.onClose('modalPhone')}
            footer={[
              { text: '取消', onPress: () => {this.onClose('modalPhone')()} },
              { text: '呼叫', onPress: () => {this.onCall()} }
            ]}
            platform="ios"
          >
          </Modal>
        </footer>
        <ReactTooltip id='description' place="bottom" className="crf-tooltips" effect='solid'>
          <span>{details}</span>
        </ReactTooltip>
      </div>
    )
  }
}

export default Channel;
