import React, { Component } from 'react';
import { NoRecord } from 'app/components';
import { Toast, ListView, Popover } from 'antd-mobile';
import { hashHistory } from 'react-router';
import Numeral from 'numeral';
const dateFormat = require('dateformat');
import PubSub from 'pubsub-js';
const Item = Popover.Item;

export default class BillList extends Component {
  constructor(props, context) {
    super(props, context);
    this.dataSource = new ListView.DataSource({
      rowHasChanged: (row1, row2) => row1 !== row2
    });
    this.dataList = [];
    this.selected = '';
    this.state = {
      dataSource: this.dataSource.cloneWithRows(this.dataList),
      visible: false,
      fromRemote: false,
      dateList: [],
      type: props.type
    };
  }

  componentWillReceiveProps(nextProps) {
    console.log(nextProps);
  }

  handleVisibleChange = (visible) => {
    setTimeout(() => {
      this.setState({
        visible,
      });
    }, 300);
  };

  onSelect = (opt) => {
    this.selected = opt.props.value;
    this.setState({
      visible: false
    });
    this.getInitData(opt.props.value);
  };

  componentDidMount() {
    this.getMonth();
    this.pubsub_token = PubSub.subscribe('loan:show', function(topic, type) {
      this.setHeight(type);
    }.bind(this));
  }

  async getMonth() {
    let path = `${CONFIGS.repayPath}/month?kissoId=${CONFIGS.ssoId}`;
    try {
      let fetchPromise = CRFFetch.Post(path);
      // 获取数据
      let result = await fetchPromise;
      if (result && !result.response) {
        let date = new Date(result[0]);
        let mounth = dateFormat(date, 'yyyy/mm');
        this.selected = mounth;
        this.setState({
          dateList: result
        });
        this.getInitData(mounth);
      }
    } catch (error) {
      let msgs = error.body;
    }
  }

  async getInitData(mounth) {
    this.setState({
      fromRemote: false
    });
    PubSub.publish('loading:show');
    let date = new Date(mounth);
    let currentMounth = dateFormat(date, 'yyyymm');
    let type = '';
    if (this.state.type === 'loan') {
      type = 'c';
    } else {
      type = 'r';
    }
    let path = `${CONFIGS.repayPath}/record?kissoId=${CONFIGS.ssoId}&pageNo=-1&pageSize=-1&queryYearMonth=${currentMounth}&orderType=${type}`;
    try {
      let fetchPromise = CRFFetch.Get(path);
      // 获取数据
      let result = await fetchPromise;
      if (result && !result.response) {
        this.setState({
          fromRemote: true
        });
        PubSub.publish('loading:hide');
        this.setData(result.loan_repay_list);
      }
    } catch (error) {
      this.setState({
        fromRemote: true
      });
      PubSub.publish('loading:hide');
      let msgs = error.body;
    }
  }

  setData(list) {
    let data = [];
    if (list && list.length > 0) {
      data = list.map((item, index) => {
        let obj = {
          orderNo: item.order_no,
          orderType: item.order_type,
          amount: item.trxn_amt,
          date: item.trxn_date.substring(5),
          repayDate: item.repay_date.substring(5),
          creditType: item.credit_type || '',
          repayType: CONFIGS.repayType[item.repay_type],
          status: item.status
        };
        return obj;
      });
    }
    this.setState({
      dataSource: this.dataSource.cloneWithRows(data), fromRemote: true
    });
    this.setHeight();
  }

  setHeight(type) {
    document.body.scrollTop = 0;
    let topHeight = document.querySelector('nav').offsetHeight;
    let tabHeight = document.getElementsByClassName('am-tabs-bar')[0].offsetHeight;
    let headerHeight = this.refs.billListHeader.offsetHeight;
    let noticeHeight = 0;
    if (type === 'loan') {
      noticeHeight = document.getElementsByClassName('bill-notice')[0].offsetHeight + 10;
    }
    let containerHeight = (document.documentElement.clientHeight - topHeight - tabHeight - noticeHeight - 20) + 'px';
    this.refs.billList && (this.refs.billList.style.height = containerHeight);
    let contentHeight = (document.documentElement.clientHeight - topHeight - tabHeight - headerHeight - noticeHeight - 20) + 'px';
    let billContainer = document.getElementsByClassName('bill-list-content')[0];
    billContainer && (billContainer.style.height = contentHeight);
  }

  componentWillUnmount() {
    //销毁监听的事件
    PubSub.unsubscribe(this.pubsub_token);
  }

  handleClick(e) {
    e.stopPropagation();
    let ele = e.currentTarget;
    let contractNo = ele.dataset.no;
    let cash = ele.dataset.amount;
    let type = ele.dataset.type;
    // let category = 'C_ConsumptionBorrowResult';
    // let eventName = 'E_ConsumptionBorrowResult';
    // _paq.push(['trackEvent', category, eventName, '借款结果页']);
    let path = 'result';
    hashHistory.push({
      pathname: path,
      query: {
        ssoId: CONFIGS.ssoId,
        contractNo: contractNo,
        cash: cash,
        type: type
      }
    });
  }

  render() {
    const row = (item) => {
      let status = CONFIGS.billStatus[item.status];
      let currentAmount = Numeral(item.amount).divide(100).format('0, 0.00');
      return (
        <div key={item.orderNo} onClick={this.handleClick} className={`am-flexbox bill-list-row ${item.orderType}`} data-type={item.orderType} data-no={item.orderNo} data-amount={item.amount}>
          <div className="am-flexbox-item bill-list-row-left">
            <div className={`row-cash ${item.creditType}`}>{currentAmount}</div>
            <div className="row-detail">{item.repayType}</div>
          </div>
          <div className="am-flexbox-item bill-list-row-right">
            <div className="row-status">{status}</div>
            {item.loanDate &&
              <div className="row-loan-date">借款日期：{item.loanDate}</div>
            }
            {item.date &&
              <div className="row-loan-date">还款日期：{item.date}</div>
            }
            {item.repayDate &&
              <div className="row-repay-date">应还款日：{item.repayDate}</div>
            }
          </div>
        </div>
      )
    };

    const dateList = (item, i) => {
      let date = new Date(item);
      let mouthVaule = dateFormat(date, 'yyyy/mm');
      let year = dateFormat(date, 'yyyy');
      let mounth = dateFormat(date, 'mm');
      return (
        <Item key={i} value={mouthVaule}>{`${year}年${mounth}月`}</Item>
      );
    };

    const header = () => {
      return (
        <div ref="billListHeader" className="am-list-item am-list-item-middle">
          <div className="am-list-line">
            <div className="am-list-content">
              <div className="bill-header hor">
                <div className="bill-title">
                  {this.selected}
                </div>
                <div className="bill-icon">
                  <Popover mask
                    visible={this.state.visible}
                    overlay={this.state.dateList.map(dateList)}
                    onVisibleChange={this.handleVisibleChange}
                    onSelect={this.onSelect}
                  >
                    <a className="bill-list-date"></a>
                  </Popover>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    };

    let data = this.state.dataSource.rowIdentities[0];
    let {fromRemote} = this.state;
    let billContent = null;
    if (fromRemote) {
      if (data && data.length > 0) {
        billContent = (
          <ListView
            dataSource={this.state.dataSource}
            renderRow={row}
            className="bill-list-content"
          />
        );
      } else {
        billContent = <NoRecord />;
      }
    }

    return (
      <section ref="billList" className="bill-list">
        {header()}
        {billContent}
      </section>
    );
  }
}
