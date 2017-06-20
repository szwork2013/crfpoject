import React, { Component } from 'react';
import { Toast, ListView, Flex } from 'antd-mobile';
import Numeral from 'numeral';
import PubSub from 'pubsub-js';

export default class Coupons extends Component {
  constructor(props, context) {
    super(props, context);

    this.dataSource = new ListView.DataSource({
      rowHasChanged: (row1, row2) => row1 !== row2
    });
    this.dataList = [];
    this.createDs = (province) => {
      this.dataList = this.dataList.concat(province);
      return this.dataSource.cloneWithRows(this.dataList);
    };

    this.state = {
      dataSource: this.createDs(this.dataList),
      title: '使用红包',
      fromRemote: false,
      isLoading: true
    };
  }

  componentDidMount() {
    // this.pubsub_token = PubSub.subscribe('coupons:show', function() {
    //   // 更新组件
    //   let data = [1,2];
    //   this.setState({
    //     data: 2
    //   });
    // }.bind(this));

    // simulate initial Ajax
    let data = [
      {
        id: 0,
        amount: 5,
        loanDate: '2017-05-01',
        repayDate: '2017-06-29'
      },
      {
        id: 1,
        amount: 10,
        loanDate: '2017-05-01',
        repayDate: '2017-06-29'
      }
    ];
    setTimeout(() => {
      this.setState({
        dataSource: this.createDs(data), fromRemote: true
      });
    }, 1000);
  }

  componentWillUnmount() {
    //销毁监听的事件
    PubSub.unsubscribe(this.pubsub_token);
  }

  render() {
    console.log(this.dataList)
    const row = (rowData) => {
      return (
        <div key={rowData.id} className="coupon-row">
          <div className="coupon-left">
            <div className="coupon-middle">
              <span>￥</span>
              <span>{rowData.amount}</span>
            </div>
          </div>
          <div className="coupon-right">
            <div className="triangle-border-right">
              <em className="circular-top"></em>
              <em className="circular-bottom"></em>
              <i className="border"></i>
            </div>
          </div>
        </div>
      );
    };

    let data = this.state.dataSource.rowIdentities;
    let { fromRemote, isLoading } = this.state;
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
      <section className="coupons-container">
        <div className="coupons-list">
          {couponsContent}
        </div>
      </section>
    );
  }
}
