import React, { Component } from 'react';
import { Toast, WhiteSpace, List } from 'antd-mobile';
import {LoadingIcon} from 'app/components';
import Numeral from 'numeral';
import PubSub from 'pubsub-js';
const Item = List.Item;

export default class Present extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      presentNum: 0,
      getPresent: false,
      coupon: 0
    };
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      presentNum: nextProps.list.presentNum
    });
  }

  componentDidMount() {
    this.pubsub_token = PubSub.subscribe('present:init', function(topic, val) {
      // 更新组件
      this.setState({
        presentNum: 2, coupon: 0
      });
    }.bind(this));
    this.pubsub_token = PubSub.subscribe('coupons:value', function(topic, val) {
      // 更新组件
      this.setState({
        coupon: val
      });
    }.bind(this));
    // setTimeout(() => {
    //   let currentPoint = this.getCurrentPoint();
    //   this.refs.rulers.swipes.moveToPoint(currentPoint);
    // }, 3000);
  }

  componentWillUnmount() {
    //销毁监听的事件
    PubSub.unsubscribe(this.pubsub_token);
  }

  handlePresent() {
    PubSub.publish('coupons:show');
  }

  render() {
    let item = null;
    let loadingItem = <LoadingIcon />;
    let {presentNum, getPresent, coupon} = this.state;
    if (coupon !== 0) {
      let formatCoupon = Numeral(coupon).format('0, 0.00');
      item = <Item arrow="horizontal" extra={`-${formatCoupon}元`} onClick={this.handlePresent.bind(this)}>抵扣红包</Item>;
    } else {
      if (getPresent) {
        item = <Item extra={loadingItem}>抵扣红包</Item>;
      } else {
        if (presentNum > 0) {
          item = <Item arrow="horizontal" className='crf-present' extra={`${presentNum}个红包`} onClick={this.handlePresent.bind(this)}>抵扣红包</Item>;
        } else {
          item = <Item extra={`${presentNum}个红包`}>抵扣红包</Item>;
        }
      }
    }

    return (
      <List className="crf-list">
        {item}
      </List>
    )
  }
}
