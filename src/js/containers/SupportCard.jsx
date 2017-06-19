import React, {Component} from 'react';
import {Link} from 'react-router';

import {Nav} from 'app/components';

import { WhiteSpace } from 'antd-mobile';

export default class Rebind extends Component {
  constructor(props) {
    super(props);
    this.state = {
      bankJson: null
    };
  }

  componentWillMount() {
    this.getBankJson();
  }

  getBankJson() {
    let allData = JSON.parse(localStorage.getItem('CRF_bankData'));

    if ((!allData) || VERSION.bankDataVERSION != localStorage.getItem('CRF_bankDataVersion')) {
      require.ensure([], (require)=> {
        let data = require('../../json/bank.json');
        localStorage.setItem('CRF_bankData', JSON.stringify(data));
        this.setState({
          bankJson: data
        });
      });
      localStorage.setItem('CRF_bankDataVersion', VERSION.bankDataVERSION);
    } else {
      this.setState({
        bankJson: allData
      });
    }

  }

  liClick(e) {
    //console.log(e.currentTarget.classList);
    e.currentTarget.classList.toggle('hide-support-card-num');
  }

  render() {
    let props = {title: '选择开户行'};
    let allData = this.state.bankJson;
    let bankObj = {
      'ICBC': '工商银行',
      'CEB': '光大银行',
      'GDB': '广发银行',
      'ABC': '农业银行',
      'PAB': '平安银行',
      'CIB': '兴业银行',
      'PSBC': '邮储银行',
      'CMB': '招商银行',
      'BOC': '中国银行',
      'CITIC': '中信银行',
      'CCB': '建设银行',
      'HXB': '华夏银行',
      'CMBC': '民生银行',
      'BCM': '交通银行',
    };

    return (
      <section className="bind-card-main">
        {CONFIGS.isWeChat?'':<Nav data={props} />}
        <WhiteSpace />
        <div className="bind-card-wrap">
          <ul>
            {
              allData && allData.map((item, index)=> {
                //console.log(item);
                let str = '';
                for (let i = 0; i < item[1].length; i++) {
                  str += item[1][i][0] + '; ';
                }
                return (<li key={index} className="hide-support-card-num" onClick={this.liClick.bind(this)}>
                  <div className="map-wrap">
                    <div className={"bank-icon " + item[0]}>{bankObj[item[0]]}<span></span></div>
                    {str ? <div className="check-bank-card">查看不支持卡种<span className="arrow-down"></span></div> : ''}
                  </div>
                  {str ? <div className="support-bank-card-num"><p>暂不支持以下数字开头的卡种 :</p>{str}</div> : ''}
                </li>);
              })
            }
          </ul>
        </div>
      </section>
    )
  }
}
