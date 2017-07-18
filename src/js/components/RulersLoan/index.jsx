import React, { Component } from 'react';
import ReactSwipes from 'react-swipes';
//import {RepayDetail} from 'app/components';
import {WhiteSpace} from 'antd-mobile';
import Numeral from 'numeral';
import PubSub from 'pubsub-js';
import { hashHistory } from 'react-router';

export default class Rulers extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      title: '借款金额',
      amount: 0,
      defaultAmount: 0,
      data: [],
      rulerWidth: 18,
    };
  }

  componentWillReceiveProps(nextProps) {
    if(Object.keys(nextProps.list).length !== 0){
      this.setState({data: nextProps.list.data, amount: nextProps.list.currentAmount, defaultAmount: nextProps.list.currentAmount});
    }
  }

  componentDidUpdate() {
    //console.log(window.length++);
    this.resetContainer();
  }

  resetContainer() {
    let totalWidth = this.state.data.length * this.state.rulerWidth;
    let currentPoint = this.getCurrentPoint();
    let rulerOffsetWidth = currentPoint * this.state.rulerWidth;
    let rulerContainer = document.getElementsByClassName('crf-rulers')[0];
    let offsetWidth = (screen.width / 2 - 3.5);
    CONFIGS.currentAmount = this.state.defaultAmount;
    let storage = window.localStorage;
    storage.setItem('currentAmount', CONFIGS.currentAmount);
    CONFIGS.realAmount = CONFIGS.currentAmount;

    //console.log(totalWidth,currentPoint,rulerContainer,offsetWidth);
    if (rulerContainer) {
      rulerContainer.style.width = totalWidth + 'px';
      rulerContainer.style.marginLeft = offsetWidth + 'px';
      rulerContainer.style.marginRight = offsetWidth + 'px';
      //rulerContainer.style.transform = `translate3d(-${rulerOffsetWidth}px, 0, 0)`;
      //if (this.state.amount === this.state.defaultAmount) PubSub.publish('present:init', this.state.data[currentPoint]);
    }
  }

  getCurrentPoint() {
    let currentPoint = 0;
    if (this.state.data.length !== 0) {
      //let currentData = this.state.data;
      currentPoint = this.state.data.indexOf(this.state.defaultAmount);
    }
    return currentPoint;
  }

  /*showModal() {
    PubSub.publish('repayDetail:show', this.state.amount);
  }*/

  render() {
    const opt = {
      distance: this.state.rulerWidth, // 每次移动的距离，卡片的真实宽度，需要计算
      currentPoint: this.getCurrentPoint(),// 初始位置，默认从0即第一个元素开始
      swTouchend: (ev) => {

        let currentAmount = this.state.data[ev.newPoint];
        let currentAmountCount = currentAmount/100-1;
        let crfRulerEle = doc.querySelectorAll('.loan-rulers .crf-ruler');

        console.log(CONFIGS.loanData.currentAmountCount,'CONFIGS.loanData.currentAmountCount-------------');
        if(CONFIGS.loanData.currentAmountCount < 5){
          crfRulerEle[CONFIGS.loanData.currentAmountCount].innerHTML = `<span>&nbsp;${(CONFIGS.loanData.currentAmountCount+1)*100}</span>`;
        }else{
          crfRulerEle[CONFIGS.loanData.currentAmountCount].innerHTML = `<span>${(CONFIGS.loanData.currentAmountCount+1)*100}</span>`;
        }

        if(currentAmountCount===0 || currentAmountCount%5===4){
          CONFIGS.loanData.currentAmountCount = currentAmountCount;
          doc.querySelectorAll('.loan-rulers .crf-ruler')[currentAmountCount].innerHTML='';
        }

        this.refs.refAmount.innerHTML = `${Numeral(currentAmount).format('0, 0')}元`;//尺子使用setState可能会引起多次渲染

        if(CONFIGS.currentAmount !== currentAmount){
          CONFIGS.loanData.sendSwitch = true;
          console.log(currentAmount,'拖动完成的金额');
          PubSub.publish('daySwipes:day',currentAmount);

          CONFIGS.currentAmount = currentAmount;
        }

        CONFIGS.realAmount = CONFIGS.currentAmount;

      }
    };

    const ruler = (item, index) => {
      let span = '';

      if( index===0 || index%5===4 ){
        if(index <= 8){
          span = <span>&nbsp;{(index+1)*100}</span>;
        }else{
          span = <span>{(index+1)*100}</span>;
        }
        if(index === CONFIGS.loanData.currentAmountCount){
          span = <span></span>;
        }
      }

      return (
        <div key={index} className="crf-ruler">
          {span}
        </div>
      );
    };

    const {title, amount} = this.state;
    const formatAmount = Numeral(amount).format('0, 0');

    return (
      <section className="crf-swipes">
        <div className="crf-swipes-title">
          <span className="crf-swipes-title-text">{title}</span>
        </div>
        <div className="crf-swipes-amount">
          <span className="crf-swipes-amount-text" ref="refAmount">{formatAmount}元</span>
        </div>
        <div className="crf-swipes-content">
          <div className="crf-swipes-axis">
            <div className="crf-swipes-axis-inner"></div>
          </div>
          <div className="crf-swipes-rulers">
            {(this.state.data.length > 0) &&
              <ReactSwipes ref="rulers" className="crf-rulers loan-rulers" options={opt}>
                {this.state.data.map(ruler)}
              </ReactSwipes>
            }
          </div>
        </div>

        {/*<RepayDetail />*/}
      </section>
    )
  }
}
