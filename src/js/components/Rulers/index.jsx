import React, { Component } from 'react';
import ReactSwipes from 'react-swipes';
import {RepayDetail} from 'app/components';
import {WhiteSpace} from 'antd-mobile';
import Numeral from 'numeral';
import PubSub from 'pubsub-js';

export default class Rulers extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      title: CONFIGS.repayDefaultTitle,
      amount: 0,
      defaultAmount: 0,
      data: [],
      rulerWidth: 9,
      isDefault: true,
      disable: true
    };
  }

  componentWillReceiveProps(nextProps) {
    this.setState({data: nextProps.list.data, amount: nextProps.list.currentAmount, defaultAmount: nextProps.list.currentAmount, disable: nextProps.list.disable});
  }

  componentDidUpdate() {
    this.setTextPosition();
    this.resetContainer();
  }

  resetContainer() {
    let totalWidth = this.state.data.length * this.state.rulerWidth;
    let currentPoint = this.getCurrentPoint();
    let rulerOffsetWidth = currentPoint * this.state.rulerWidth;
    let rulerContainer = document.querySelector('crf-rulers');
    let offsetWidth = (document.body.offsetWidth / 2 - this.state.rulerWidth / 2);
    CONFIGS.currentAmount = this.state.defaultAmount;
    let storage = window.localStorage;
    storage.setItem('currentAmount', CONFIGS.currentAmount);
    CONFIGS.realAmount = CONFIGS.currentAmount;

    if (rulerContainer) {
      rulerContainer.style.width = totalWidth + 'px';
      rulerContainer.style.marginLeft = offsetWidth + 'px';
      rulerContainer.style.marginRight = offsetWidth + 'px';
      rulerContainer.style.transform = `translate3d(-${rulerOffsetWidth}px, 0, 0)`;
      if (this.state.amount === this.state.defaultAmount) PubSub.publish('present:init', this.state.data[currentPoint]);
    }
  }

  getCurrentPoint() {
    let currentPoint = 0;
    if (this.state.data.length === 0) {

    } else {
      let currentData = this.state.data;
      currentPoint = this.state.data.indexOf(this.state.defaultAmount);
    }
    return currentPoint;
  }

  handleReset() {
    let currentPoint = this.getCurrentPoint();
    this.setState({
      amount: this.state.data[currentPoint],
      title: CONFIGS.repayDefaultTitle,
      isDefault: true
    });
    this.setTextPosition();
  }

  showModal() {
    PubSub.publish('repayDetail:show', this.state.amount);
  }

  setTextPosition() {
    let textContainer = document.getElementsByClassName('crf-swipes-amount-text')[0];
    let marginLeft = -(textContainer.clientWidth / 2) + 'px';
    let container = document.getElementsByClassName('crf-swipes-amount')[0];
    container.style.marginLeft = marginLeft;
  }

  render() {
    const opt = {
      distance: this.state.rulerWidth, // 每次移动的距离，卡片的真实宽度，需要计算
      currentPoint: this.getCurrentPoint(),// 初始位置，默认从0即第一个元素开始
      swTouchend: (ev) => {
        let data = {
          moved: ev.moved,
          originalPoint: ev.originalPoint,
          newPoint: ev.newPoint,
          cancelled: ev.cancelled
        }
        let defaultValue = false;
        if (this.state.data[ev.newPoint] === this.state.defaultAmount) {
          defaultValue = true;
        }
        this.setState({
          amount: this.state.data[ev.newPoint],
          title: CONFIGS.repayChangedTitle,
          isDefault: defaultValue
        });
        CONFIGS.currentAmount = this.state.data[ev.newPoint];
        let storage = window.localStorage;
        storage.setItem('currentAmount', CONFIGS.currentAmount);
        CONFIGS.realAmount = CONFIGS.currentAmount;
        PubSub.publish('present:init', this.state.data[ev.newPoint]);
        this.setTextPosition();
      }
    };

    const ruler = (item, index) => {
      return (
        <div key={index} className="crf-ruler"></div>
      );
    };

    const {title, amount, isDefault, disable} = this.state;
    const formatAmount = Numeral(amount).format('0, 0.00');

    return (
      <section className="crf-swipes">
        <div className="crf-swipes-title">
          <span className="crf-swipes-title-text">{title}</span>
          {!isDefault &&
            <span className="crf-swipes-title-link">
              <a onClick={this.handleReset.bind(this)}></a>
            </span>
          }
        </div>
        <div ref="swipes" className="crf-swipes-amount">
          <span className="crf-swipes-amount-text">{formatAmount}</span>
          <span className="crf-swipes-amount-link">
            {!disable &&
              <a onClick={this.showModal.bind(this)}>明细</a>
            }
          </span>
        </div>
        <div className="crf-swipes-content">
          <div className="crf-swipes-axis">
            <div className="crf-swipes-axis-inner"></div>
          </div>
          <div className="crf-swipes-rulers">
            {(this.state.data.length > 0) &&
              <ReactSwipes ref="rulers" className="crf-rulers" options={opt}>
                {this.state.data.map(ruler)}
              </ReactSwipes>
            }
          </div>
        </div>
        <div className="crf-swipes-description">左右滑动调整还款金额, 调整以50为单位</div>
        <RepayDetail />
      </section>
    )
  }
}
