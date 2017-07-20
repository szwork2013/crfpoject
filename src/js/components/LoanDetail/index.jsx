import React, { Component } from 'react';
import { Table} from 'antd-mobile';
import { hashHistory } from 'react-router';
//import Numeral from 'numeral';
import styles from './index.scss';
const dateFormat = require('dateformat');

export default class RepayDetail extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      amount: 0,
      data: {},
      message: '',
    };
  }

  componentDidMount() {
    this.pubsub_token = PubSub.subscribe('loanDetail:list', function(topic, val) {
      this.setListData(val);
    }.bind(this));
  }

  componentWillUnmount() {
    //销毁监听的事件
    PubSub.unsubscribe(this.pubsub_token);
  }

  setListData(data){
    if(Object.prototype.toString.call(data) === '[object Array]'){
      let allData={
        '0':{
          list:[]
        }
      };

      data.forEach((value,index) => {
        allData['0'].list.push({
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
    }else{
      if(!this.state.data['0']){
        this.setState({
          data: [{}],
          message: data,
        });
        return;
      }
      this.setState({
        message: data,
      });
    }
  }

  render() {
    const { data, message} = this.state;
    const columns = [
      { title: '应还款日', dataIndex: 'day', key: 'day' },
      { title: '本金', dataIndex: 'principal', key: 'principal'},
      { title: '手续费', dataIndex: 'fees', key: 'fees'},
      { title: '利息', dataIndex: 'interest', key: 'interest'},
      { title: '到期应还', dataIndex: 'repay', key: 'repay', width: '1.5rem', className: 'result' }
    ];
    const content = (index) => {
      let item = data[index];

      let table;
      if(!message){
        table = <Table
          className={styles.loanTable}
          columns={columns}
          dataSource={item.list}
        />;
        document.querySelector('.loan-submit-btn').classList.remove('disabled');
      }else{
        table = <div className="error-message">{message}</div>;
        this.state.message = '';
        document.querySelector('.loan-submit-btn').classList.add('disabled');
      }

      return (
        <div key={index} className={styles.loanContainer}>
          <div className={`${styles.loanTitle}`}>
            <div className={styles.loanTitleLeft}>借款明细</div>
          </div>
          {table}
        </div>
      );
    };

    return (
      <div className="detail-list loan-detail-list">
        {Object.keys(data).map(content)}
      </div>
    );
  }
}
