import React, { Component } from 'react';
import ReactSwipes from 'react-swipes';
import {RepayDetail} from 'app/components';
import {WhiteSpace} from 'antd-mobile';
import Numeral from 'numeral';
import PubSub from 'pubsub-js';

import '../../utils/common/monoevent';

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
    this.refs.rulers && (this.refs.rulers.swipes.transitionDuration = 0);
  }

  componentDidMount() {
    this.bindEvent();
  }

  bindEvent() {
    let ne = MonoEvent;
    let refWrap = ne('.crf-swipes-rulers');
    let startPoint = 0;
    let endPoint = 0;
    let originPoint = 0;
    refWrap.on('swipeLeft swipeRight', () => {
      refWrap.on('touchstart',(e) => {
        let touch = e.touches[0];
        let disX = touch.pageX;
        startPoint = disX;
        originPoint = this.state.data.indexOf(CONFIGS.currentAmount);

        refWrap.on('touchmove', (e) => {
          let touch = e.touches[0];
          let disX = touch.pageX;
          endPoint = disX;
          let distance = parseInt((startPoint - endPoint) / this.state.rulerWidth);
          if (distance !== 0) {
            let currentPoint = originPoint + distance;
            if (currentPoint > (this.state.data.length - 1) || currentPoint < 0) {
              if (currentPoint > this.state.data.length) {
                currentPoint = (this.state.data.length - 1);
              } else if (currentPoint < 0) {
                currentPoint = 0;
              }
            }
            if (currentPoint !== originPoint) {
              this.setRulerState(currentPoint, 'move');
              this.refs.rulers.swipes.moveToPoint(currentPoint);
            }
          }
        });

        refWrap.on('touchend', (e) => {
          refWrap.un('touchend touchmove');
          let distance = parseInt((startPoint - endPoint) / this.state.rulerWidth);
          if (distance !== 0) {
            let currentPoint = originPoint + distance;
            if (currentPoint > (this.state.data.length - 1) || currentPoint < 0) {
              if (currentPoint > this.state.data.length) {
                currentPoint = (this.state.data.length - 1);
              } else if (currentPoint < 0) {
                currentPoint = 0;
              }
            }
            if (currentPoint !== originPoint) {
              this.setRulerState(currentPoint);
              this.refs.rulers.swipes.moveToPoint(currentPoint);
            }
          }
        });

        return false;
      });
    });
    refWrap.on('tap doubleTap', () => {
      refWrap.un('touchstart touchmove touchend');
    });
  }

  resetContainer() {
    let totalWidth = this.state.data.length * this.state.rulerWidth;
    let currentPoint = this.getCurrentPoint();
    let rulerOffsetWidth = currentPoint * this.state.rulerWidth;
    let rulerContainer = document.querySelector('.crf-rulers');
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
    this.refs.rulers.swipes.moveToPoint(currentPoint);
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

  setRulerState(point, type) {
    let defaultValue = false;
    if (this.state.data[point] === this.state.defaultAmount) {
      defaultValue = true;
    }
    this.setState({
      amount: this.state.data[point],
      title: CONFIGS.repayChangedTitle,
      isDefault: defaultValue
    });
    CONFIGS.currentAmount = this.state.data[point];
    CONFIGS.realAmount = CONFIGS.currentAmount;
    if (type !== 'move') {
      let storage = window.localStorage;
      storage.setItem('currentAmount', CONFIGS.currentAmount);
      PubSub.publish('present:init', this.state.data[point]);
    }
    this.setTextPosition();
  }

  render() {
    const opt = {
      distance: this.state.rulerWidth, // 每次移动的距离，卡片的真实宽度，需要计算
      currentPoint: this.getCurrentPoint(),// 初始位置，默认从0即第一个元素开始
      swTouchend: (ev) => {
        //this.setRulerState(ev.newPoint);
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
