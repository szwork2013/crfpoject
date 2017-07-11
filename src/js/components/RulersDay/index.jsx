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
      //title: CONFIGS.repayDefaultTitle,
      day: 0,
      defaultDay: 0,
      data: [],
      rulerWidth: 9,
      isDefault: true,
    };
  }

  componentWillReceiveProps(nextProps) {
    this.setState({data: nextProps.list.data, day: nextProps.list.currentDay, defaultDay: nextProps.list.currentDay});
  }

  componentDidUpdate() {

    this.pubsub_token = PubSub.subscribe('ruleDay:set', (topic, val)=> {
      let resetDay;

      if(val<=500){
        resetDay=14;
      }else if(val<=1500){
        resetDay=30;
      }else if(val<=2500){
        resetDay=60;
      }else{
        resetDay=90;
      }

      let arr=[];
      for(let i=1;i<=resetDay;i++){
        arr.push(i);
      }
      //设置
      console.log(this.state.day,resetDay);
      if(this.state.day!==resetDay){
        console.log('change');
        this.setState({
          data:arr,
          day:resetDay,
          defaultDay:resetDay,
        });
      }
      //console.log(window.length++);
      //console.log(val);

    });
    console.log(this.state.day,'day');
    this.resetContainer();
  }

  componentWillUnmount() {
    //销毁监听的事件
    PubSub.unsubscribe(this.pubsub_token);
  }

  resetContainer() {
    let totalWidth = this.state.data.length * this.state.rulerWidth;
    let currentPoint = this.getCurrentPoint();//默认值在哪个位置
    let rulerOffsetWidth = currentPoint * this.state.rulerWidth;//默认值乘以宽度
    let rulerContainer = document.getElementsByClassName('crf-rulersDay')[0];
    let offsetWidth = (screen.width / 2 - 3.5);
    CONFIGS.currentDay = this.state.defaultDay;
    let storage = window.localStorage;
    storage.setItem('currentDay', CONFIGS.currentDay);
    CONFIGS.realDay = CONFIGS.currentDay;

    //console.log(rulerOffsetWidth,'rulerOffsetWidth');
    //console.log(totalWidth,currentPoint,offsetWidth,rulerOffsetWidth);
    if (rulerContainer) {
      rulerContainer.style.width = totalWidth + 'px';
      rulerContainer.style.marginLeft = offsetWidth + 'px';
      rulerContainer.style.marginRight = offsetWidth + 'px';
      rulerContainer.style.transform = `translate3d(-${rulerOffsetWidth}px, 0, 0)`;
      //if (this.state.day === this.state.defaultDay) PubSub.publish('present:init', this.state.data[currentPoint]);
    }
  }

  getCurrentPoint() {
    let currentPoint = 0;
    if (this.state.data.length === 0) {

    } else {
      let currentData = this.state.data;
      currentPoint = this.state.data.indexOf(this.state.defaultDay);
    }
    return currentPoint;
  }

  handleReset() {
    let currentPoint = this.getCurrentPoint();
    this.setState({
      day: this.state.data[currentPoint],
      //title: CONFIGS.repayDefaultTitle,
      isDefault: true
    });
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
        };
        let defaultValue = false;
        if (this.state.data[ev.newPoint] === this.state.defaultDay) {
          defaultValue = true;
        }
        //console.log(ev.newPoint,'ev.newPoint');
        this.setState({
          day: this.state.data[ev.newPoint],
          //title: CONFIGS.repayChangedTitle,
          isDefault: defaultValue
        });
        CONFIGS.currentDay = this.state.data[ev.newPoint];
        let storage = window.localStorage;
        storage.setItem('currentDay', CONFIGS.currentDay);
        CONFIGS.realDay = CONFIGS.currentDay;
        //console.log(CONFIGS.realDay);
        //PubSub.publish('present:init', this.state.data[ev.newPoint]);
      }
    };

    const ruler = (item, index) => {
      return (
        <div key={index} className="crf-ruler"></div>
      );
    };

    const {day, isDefault} = this.state;

    const formatDay = Numeral(day).format('0, 0');

    return (
      <section className="crf-swipes">
        <div className="crf-swipes-title">
          <span className="crf-swipes-title-text">借款金额</span>
        </div>
        <div className="crf-swipes-amount">
          <span className="crf-swipes-amount-text">{formatDay}天</span>
        </div>
        <div className="crf-swipes-content">
          <div className="crf-swipes-axis">
            <div className="crf-swipes-axis-inner"></div>
          </div>
          <div className="crf-swipes-rulers">
            {(this.state.data.length > 0) &&
              <ReactSwipes ref="rulers" className="crf-rulersDay" options={opt}>
                {this.state.data.map(ruler)}
              </ReactSwipes>
            }
          </div>
        </div>

        <RepayDetail />
      </section>
    )
  }
}
