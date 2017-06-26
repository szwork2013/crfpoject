import React, { Component } from 'react';
import {Modal, Table} from 'antd-mobile';
import Numeral from 'numeral';
import styles from './index.scss';

export default class RepayDetail extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      amount: 0,
      data: {},
      modal: false
    };
  }

  showModal = key => (e) => {
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
  }

  convertTableData() {
    let jsonData = [
      {
        "complete_flag": "Y",
        "curr_bill_date": "06-01",
        "loan_amt": 0,
        "loan_no": "string",
        "loan_periods": 0,
        "loan_time": "string",
        "offset_amt": 101600,
        "offset_fee": 0,
        "offset_int": 6,
        "offset_over_int": 6,
        "offset_penalty": 5,
        "offset_principal": 100000,
        "plan_amt": 0,
        "plan_principal": 0,
        "term_no": 0,
        "unpaid_amt": 0
      },
      {
        "complete_flag": "N",
        "curr_bill_date": "06-01",
        "loan_amt": 0,
        "loan_no": "string",
        "loan_periods": 0,
        "loan_time": "string",
        "offset_amt": 101600,
        "offset_fee": 0,
        "offset_int": 6,
        "offset_over_int": 6,
        "offset_penalty": 5,
        "offset_principal": 100000,
        "plan_amt": 0,
        "plan_principal": 0,
        "term_no": 0,
        "unpaid_amt": 0
      },
      {
        "complete_flag": "N",
        "curr_bill_date": "06-01",
        "loan_amt": 0,
        "loan_no": "string",
        "loan_periods": 0,
        "loan_time": "string",
        "offset_amt": 101600,
        "offset_fee": 0,
        "offset_int": 6,
        "offset_over_int": 6,
        "offset_penalty": 0,
        "offset_principal": 100000,
        "plan_amt": 0,
        "plan_principal": 0,
        "term_no": 0,
        "unpaid_amt": 0
      },
      {
        "complete_flag": "N",
        "curr_bill_date": "06-02",
        "loan_amt": 0,
        "loan_no": "string",
        "loan_periods": 0,
        "loan_time": "string",
        "offset_amt": 101600,
        "offset_fee": 0,
        "offset_int": 6,
        "offset_over_int": 6,
        "offset_penalty": 5,
        "offset_principal": 100000,
        "plan_amt": 0,
        "plan_principal": 0,
        "term_no": 0,
        "unpaid_amt": 0
      },
      {
        "complete_flag": "N",
        "curr_bill_date": "06-02",
        "loan_amt": 0,
        "loan_no": "string",
        "loan_periods": 0,
        "loan_time": "string",
        "offset_amt": 101600,
        "offset_fee": 0,
        "offset_int": 6,
        "offset_over_int": 6,
        "offset_penalty": 0,
        "offset_principal": 100000,
        "plan_amt": 0,
        "plan_principal": 0,
        "term_no": 0,
        "unpaid_amt": 0
      }
    ];
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
    
    Object.values(data).map((main) => {
      jsonData.map((sub) => {
        if ((main.billDate === sub.curr_bill_date) && ( main.offsetPenalty === sub.offset_penalty)) {
          let currentData = {
            amt: sub.offset_amt,
            principal: sub.offset_principal,
            fees: sub.offset_over_int,
            interest: sub.offset_int,
            flag: sub.complete_flag
          };
          main.list.push(currentData);
        }
      });
    });

    // let data = {
    //   0: {
    //     billDate: '到期日 : 06-01',
    //     offsetPenalty: '延迟还款服务费 : 5.00元',
    //     list: [
    //       {
    //         amt: '1,016.00',
    //         principal: '1,000.00',
    //         fees: '5.00',
    //         interest: '6.00',
    //         flag: '可结清'
    //       }
    //     ]
    //   },
    //   1: {
    //     billDate: '到期日 : 06-03',
    //     offsetPenalty: '',
    //     list: [
    //       {
    //         amt: '1,016.00',
    //         principal: '1,000.00',
    //         fees: '5.00',
    //         interest: '6.00',
    //         flag: '可结清'
    //       },
    //       {
    //         amt: '1,016.00',
    //         principal: '1,000.00',
    //         fees: '5.00',
    //         interest: '6.00',
    //         flag: '部分结清'
    //       }
    //     ]
    //   }
    // }
    return data;
  }

  componentDidMount() {
    this.pubsub_token = PubSub.subscribe('repayDetail:show', function(topic, val) {
      // 更新组件
      this.setState({
        amount: val, modal: true, data: this.convertTableData()
      });
    }.bind(this));
  }

  componentWillUnmount() {
    //销毁监听的事件
    PubSub.unsubscribe(this.pubsub_token);
  }

  render() {
    const {amount, data} = this.state;
    const formatFees = Numeral(amount).format('0, 0.00');
    const modalStyle = {width: '90%'};
    const columns = [
      { title: '还款', dataIndex: 'amt', key: 'amt' },
      { title: '本金', dataIndex: 'principal', key: 'principal'},
      { title: '手续费', dataIndex: 'fees', key: 'fees'},
      { title: '利息', dataIndex: 'interest', key: 'interest'},
      { title: '状态', dataIndex: 'flag', key: 'flag', width: '1.5rem', className: 'status' }
    ];
    const content = (item, index) => {
      return (
        <div key={index} className={styles.repayContainer}>
          <div className={`${styles.repayTitle} hor`}>
            <div className={styles.repayTitleLeft}>{item.billDate}</div>
            <div className={styles.repayTitleRight}>{item.offsetPenalty}</div>
          </div>
          <Table
            className={styles.repayTable}
            columns={columns}
            dataSource={item.list}
          />
        </div>
      );
    };
    return (
      <Modal
        className="crf-repay-modal"
        transparent
        style={modalStyle}
        title={`还款金额${formatFees}元`}
        closable={true}
        maskClosable={false}
        visible={this.state.modal}
        onClose={this.onClose('modal')}
        platform="ios"
      >
        <div className={styles.root}>
          {Object.values(data).map(content)}
        </div>
      </Modal>
    );
  }
}
