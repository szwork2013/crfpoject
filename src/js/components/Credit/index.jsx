import React, { Component } from 'react';
import Numeral from 'numeral';
import styles from './index.scss'

export default class Credit extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      remainLimit: '-',
      totalLimit: '-'
    }
  }

  componentWillReceiveProps(nextProps) {
    this.setState({remainLimit: nextProps.data.remainLimit, totalLimit: nextProps.data.totalLimit});
  }

  render() {
    let {remainLimit, totalLimit} = this.state;
    let remainAmount = '-',
        totalAmount = '-';
    if (remainLimit !== '-') {
      remainAmount = `¥${Numeral(remainLimit).divide(100).format('0, 0.00')}`;
    }
    if (totalLimit !== '-') {
      totalAmount = `¥${Numeral(totalLimit).divide(100).format('0, 0.00')}`;
    }
    return (
      <div className={styles.root}>
        <div className={styles.remain}>
          <div className={styles.title}>可用额度</div>
          <div className={styles.amount}>{remainAmount}</div>
        </div>
        <div className={styles.total}>
          <div className={styles.amount}>当前信用额度：{totalAmount}</div>
        </div>
      </div>
    )
  }
}
