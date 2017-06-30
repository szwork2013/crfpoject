import React, { Component } from 'react';
import { Toast, ListView, Accordion } from 'antd-mobile';
import PubSub from 'pubsub-js';
import Numeral from 'numeral';

export default class Coupons extends Component {
  constructor(props, context) {
    super(props, context);

    this.dataSource = new ListView.DataSource({
      rowHasChanged: (row1, row2) => row1 !== row2
    });
    this.dataList = [];
    this.createDs = (province) => {
      this.dataList = province;
      return this.dataSource.cloneWithRows(this.dataList);
    };

    this.state = {
      dataSource: this.createDs(this.dataList),
      title: '使用红包',
      fromRemote: false
    };
  }

  componentDidMount() {
    this.pubsub_token = PubSub.subscribe('coupons:show', function(topic, list) {
      this.setData(list);
      this.showCoupons();
    }.bind(this));
  }

  setData(list) {
    let data = list.map((item) => {
      let obj = {
        id: item.id,
        amount: Numeral(item.awardValue).divide(100).value(),
        loanDate: item.effectiveDate,
        repayDate: item.expiredTime,
        note: item.note.split('</br> ')
      };
      return obj;
    });
    this.dataList = [];
    this.setState({
      dataSource: this.createDs(data), fromRemote: true
    });
  }

  componentWillUnmount() {
    //销毁监听的事件
    PubSub.unsubscribe(this.pubsub_token);
  }

  showCoupons() {
    this.refs.couponsSection.classList.remove('hide');
    this.refs.couponsSection.classList.add('show');
  }

  closeCoupons() {
    this.refs.couponsSection.classList.remove('show');
    this.refs.couponsSection.classList.add('hide');
    this.setState({
      dataSource: this.createDs([])
    });
  }

  handleClick(e) {
    this.closeCoupons();
    let val = e.currentTarget.getAttribute('data-value');
    let coupos = {
      real: parseInt(5),
      total: 10
    };
    PubSub.publish('coupons:value', coupos);
  }

  handleToggle(e) {
    let id = e.currentTarget.getAttribute('data-id');
    let flag = e.currentTarget.lastChild;
    let menu = document.getElementById(`row_${id}`).lastChild;
    if (!menu.classList.contains('show')) {
      menu.classList.add('show');
      menu.classList.remove('hide');
      flag.classList.add('show');
      e.preventDefault();
    } else {
      menu.classList.remove('show');
      menu.classList.add('hide');
      flag.classList.remove('show');
      e.preventDefault();
    }
  }

  render() {
    const header = () => {
      let nums = this.state.dataSource.rowIdentities[0].length;
      return (
        <div className="coupon-can-use">可使用({nums})</div>
      );
    };

    const rule = (item) => {
      return (
        <p>{item}</p>
      );
    };

    const row = (rowData) => {
      return (
        <div key={rowData.id} id={`row_${rowData.id}`}>
          <div className="coupon-row">
            <div className="coupon-left">
              <div className="coupon-middle">
                <span>￥</span>
                <span className="amount">{rowData.amount}</span>
              </div>
            </div>
            <div className="coupon-right">
              <div className="triangle-border-right">
                <em className="circular-top"></em>
                <em className="circular-bottom"></em>
                <i className="border"></i>
              </div>
              <div className="coupon-inner">
                <div className="coupon-text">{rowData.amount}元抵扣券</div>
                <div className="coupon-date">{rowData.loanDate} ~ {rowData.repayDate}有效</div>
                <div className="coupon-accordion">
                  <a className="accordion" data-id={rowData.id} onClick={this.handleToggle.bind(this)}>
                    <span className="accordion-text">使用规则</span>
                    <span className="accordion-inner"></span>
                  </a>
                </div>
                <div className="coupon-button">
                  <button className="normal-btn" data-value={rowData.amount} onClick={this.handleClick.bind(this)}>立即使用</button>
                </div>
              </div>
            </div>
          </div>
          <div className="accordion-row hide">
            {rowData.note.map(rule)}
          </div>
        </div>
      );
    };

    let data = this.state.dataSource.rowIdentities;
    let { fromRemote } = this.state;
    let couponsContent = null;

    if (fromRemote) {
      if (data && data.length > 0) {
        couponsContent = (
          <ListView ref="couponsListView"
            dataSource={this.state.dataSource}
            renderRow={row}
            className="coupons-list-content"
          />
        );
      } else {
        couponsContent = null;
      }
    }

    return (
      <section ref="couponsSection" className="coupons-container">
        <div className="coupons-list">
          {header()}
          {couponsContent}
        </div>
      </section>
    );
  }
}
