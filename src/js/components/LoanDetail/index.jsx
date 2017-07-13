import React, { Component } from 'react';
import {Modal, Table} from 'antd-mobile';
import Numeral from 'numeral';
import styles from './index.scss';
const dateFormat = require('dateformat');

export default class RepayDetail extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      amount: 0,
      data: {},
      modal: false
    };
  }

  componentDidMount() {
    this.pubsub_token = PubSub.subscribe('loanDetail:list', function(topic, val) {
      //this.getInitData(val);
      this.setListData(val);
    }.bind(this));
  }

  componentWillUnmount() {
    //销毁监听的事件
    PubSub.unsubscribe(this.pubsub_token);
  }

  /*showModal = key => (e) => {
    // 现象：如果弹出的弹框上的 x 按钮的位置、和手指点击 button 时所在的位置「重叠」起来，
    // 会触发 x 按钮的点击事件而导致关闭弹框 (注：弹框上的取消/确定等按钮遇到同样情况也会如此)
    e.preventDefault(); // 修复 Android 上点击穿透
    this.setState({
      [key]: true,
    });
  }

  onClose = key => () => {
    this.setState({
      [key]: false,
    });
  }*/

  convertTableData(jsonData) {
    let data = {};
    let i = 0;
    jsonData.map((item, index) => {
      if (!data[i]) {
        data[i] = {};
        data[i].billDate = item.curr_bill_date;
        data[i].offsetPenalty = item.offset_penalty;
        data[i].list = [];
      } else {
        if ((data[i].billDate === item.curr_bill_date) && (data[i].offsetPenalty !== item.offset_penalty)) {
          i++;
          data[i] = {};
          data[i].billDate = item.curr_bill_date;
          data[i].offsetPenalty = item.offset_penalty;
          data[i].list = [];
        } else if (data[i].billDate !== item.curr_bill_date) {
          i++;
          data[i] = {};
          data[i].billDate = item.curr_bill_date;
          data[i].offsetPenalty = item.offset_penalty;
          data[i].list = [];
        }
      }
    });

    Object.keys(data).map((key) => {
      let main = data[key];
      jsonData.map((sub) => {
        if ((main.billDate === sub.curr_bill_date) && ( main.offsetPenalty === sub.offset_penalty)) {
          let currentData = {
            amt: Numeral(sub.offset_amt).divide(100).format('0, 0.00'),
            principal: Numeral(sub.offset_principal).divide(100).format('0, 0.00'),
            fees: Numeral(sub.offset_over_int).divide(100).format('0, 0.00'),
            interest: Numeral(sub.offset_int).divide(100).format('0, 0.00'),
            flag: CONFIGS.repayStatus[sub.complete_flag]
          };
          main.list.push(currentData);
        }
      });
    });
    return data;
  }

  setListData(data){
    let allData={
      "0":{
        list:[]
      }
    };

    data.forEach(function(value,index) {
      allData["0"].list.push({
        "day": value.currBillDate,
        "principal": value.currStartMstAtm,
        "fees": value.handleFee,
        "interest": value.currInterest,
        "repay": value.currCountMstAtm,
        "key": index,//需要一个key
      });
    });

    this.setState({
      data:allData
    });

  }

  /*async getInitData(amount) {
    this.setState({
      amount: amount,
      modal: true
    });
    let currentAmount = Numeral(amount).multiply(100).value();
    let date = new Date();
    let formatDate = dateFormat(date, 'yyyymmdd');
    let repayPath = `${CONFIGS.repayPath}/detail?kissoId=${CONFIGS.userId}&repayamt=${currentAmount}&offsetDate=${formatDate}`;

    try {
      let fetchPromise = CRFFetch.Get(repayPath);
      // 获取数据
      let result = await fetchPromise;
      if (result && !result.response) {
        this.setState({
          data: this.convertTableData(result.repay_plan_list)
        });
      }
    } catch (error) {
      CRFFetch.handleError(error, Toast, () => {
        if (error.response.status === 400) {
          error.body.then(data => {
            Toast.info(data.message);
          });
        }
      });
    }
  }*/

  render() {
    const {amount, data} = this.state;
    console.log(data);
    const columns = [
      { title: '应还款日', dataIndex: 'day', key: 'day' },
      { title: '本金', dataIndex: 'principal', key: 'principal'},
      { title: '手续费', dataIndex: 'fees', key: 'fees'},
      { title: '利息', dataIndex: 'interest', key: 'interest'},
      { title: '到期应还', dataIndex: 'repay', key: 'repay', width: '1.5rem', className: 'result' }
    ];
    const content = (index) => {
      let item = data[index];
      return (
        <div key={index} className={styles.loanContainer}>
          <div className={`${styles.loanTitle}`}>
            <div className={styles.loanTitleLeft}>借款明细</div>
          </div>
          <Table
            className={styles.loanTable}
            columns={columns}
            dataSource={item.list}
          />
        </div>
      );
    };

    return (
      <div className="detail-list">
          {Object.keys(data).map(content)}
      </div>
    );
  }
}
