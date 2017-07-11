import React, { Component } from 'react';
import { WhiteSpace } from 'antd-mobile';
import { hashHistory } from 'react-router';
import PubSub from 'pubsub-js';
import styles from './index.scss';

export default class BillNotice extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      showNotice: false
    };
  }

  componentDidMount() {
    this.getInitData();
  }

  async getInitData() {
    let path = `${CONFIGS.loanPath}/creditLimit?kissoId=${CONFIGS.ssoId}`;
    try {
      let fetchPromise = CRFFetch.Get(path);
      // 获取数据
      let result = await fetchPromise;
      if (result && result.repaying_flag !== 0 && !result.response) {
        this.setState({
          showNotice: true
        });
        PubSub.publish('loan:show', 'loan');
      }
    } catch (error) {
      let msgs = error.body;
    }
  }

  handleClick(e) {
    e.stopPropagation();
    let path = 'repay';
    hashHistory.push({
      pathname: path,
      query: {
        ssoId: CONFIGS.ssoId
      }
    });
  }

  render() {
    if (this.state.showNotice) {
      return (
        <div className="bill-notice">
          <div className={styles.root}>
            <div className={styles.noticeBarLeft}>
              您有1笔借款待还清
            </div>
            <div className={styles.noticeBarRight}>
              <button className="normal-btn" onClick={this.handleClick.bind(this)}>立即还款</button>
            </div>
          </div>
          <WhiteSpace />
        </div>
      )
    } else {
      return (
        <div></div>
      )
    }
  }
}
