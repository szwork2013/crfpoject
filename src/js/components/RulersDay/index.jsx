import React, { Component } from 'react';
//import ReactSwipes from 'react-swipes';
import { RepayDetail, DaySwipes } from 'app/components';
import {WhiteSpace,Toast} from 'antd-mobile';
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
    };
  }

  componentWillReceiveProps(nextProps) {
    this.setState({data: nextProps.list.data, day: nextProps.list.defaultDay, defaultDay: nextProps.list.defaultDay});
  }

  componentDidUpdate() {

    this.pubsub_token = PubSub.subscribe('ruleDay:set', (topic, val)=> {
      //console.log('--------------------rulersDay',window.length++);
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

      let resultObj = {
        remainLimit: val,
        defaultDay: resetDay,
      };

      if(CONFIGS.loanData.sendSwitch){
        //设置
        if(this.state.day !== resetDay){
          /*this.setState({
            data:arr,
            day:resetDay,
            //defaultDay:resetDay,
          });*/
        }

        //this.getInitDataFetch(resultObj);
      }

    });

    this.resetContainer();
  }

  componentWillUnmount() {
    //销毁监听的事件
    PubSub.unsubscribe(this.pubsub_token);
  }

  async getInitDataFetch(defaultData) {
    let { defaultDay, remainLimit } = defaultData;
    CONFIGS.loanData.sendSwitch = false;
    //console.log(defaultData,'default*******************');
    let d = new Date();

    let period = defaultDay>30 ? 'M' : 'D';
    let periodDay ;
    if(defaultDay<=30){
      periodDay = defaultDay;
    }else if(defaultDay<=60){
      periodDay = 2;
    }else if(defaultDay<=90){
      periodDay = 3;
    }

    CONFIGS.loanData.amount = remainLimit * 100;//分为单位
    CONFIGS.loanData.day = defaultDay;

    //console.log(remainLimit,'以分');

    const params={
      productNo: 'P2001002',//未动态传入
      loanAmount: remainLimit,
      loanPeriod: periodDay,
      startTime: `${d.getFullYear()}-${d.getMonth()+1}-${d.getDate()}`,
      periodUnit: period,//D是短期，M是分期
      kissoId: CONFIGS.ssoId,
    };

    let loanPath = `${CONFIGS.repayPath}/plan?productNo=${params.productNo}&loanAmount=${params.loanAmount}&loanPeriod=${params.loanPeriod}&startTime=${params.startTime}&periodUnit=${params.periodUnit}&kissoId=${params.kissoId}`;

    try {
      let loanFetchPromise = CRFFetch.Get(loanPath);

      // 获取数据
      let loanResult = await loanFetchPromise;

      CONFIGS.loanData.sendSwitch = true;
      PubSub.publish('loading:hide');

      if (loanResult && !loanResult.response) {
        //console.log('+++++++++++++++多次？',window.length++);
        PubSub.publish('loanDetail:list', loanResult.detailList.LoanPlan);
      }

    } catch (error) {

      CONFIGS.loanData.sendSwitch = true;
      PubSub.publish('loading:hide');

      CRFFetch.handleError(error, Toast, () => {
        if (error.response.status === 400) {
          error.body.then(data => {
            Toast.info(data.message);
          });
        }
      }, () => {
        let path = 'loan';
        hashHistory.push({
          pathname: path,
          query: {
            ssoId: CONFIGS.userId
          }
        });
      });

    }
  }

  resetContainer() {
    let totalWidth = this.state.data.length * this.state.rulerWidth;
    let currentPoint = this.getCurrentPoint();//默认值在哪个位置
    let rulerOffsetWidth = currentPoint * this.state.rulerWidth;//默认值乘以宽度
    let rulerContainer = document.getElementsByClassName('crf-rulersDay')[0];
    let offsetWidth = (screen.width / 2 - 3.5);
    CONFIGS.currentDay = this.state.defaultDay;

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
    if (this.state.data.length !== 0) {
      //let currentData = this.state.data;
      currentPoint = this.state.data.indexOf(this.state.defaultDay);
    }
    return currentPoint;
  }

  render() {
    /*const opt = {
      distance: this.state.rulerWidth, // 每次移动的距离，卡片的真实宽度，需要计算
      currentPoint: this.getCurrentPoint(),// 初始位置，默认从0即第一个元素开始
      swTouchend: (ev) => {

        let currentDay = this.state.data[ev.newPoint];
        this.refs.refDay.innerHTML = `${Numeral(currentDay).format('0, 0')}天`;//尺子使用setState会引起多次渲染

        CONFIGS.currentDay = currentDay;
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
    };*/

    const { day, data } = this.state;// defaultDay,

    let formatDay = Numeral(day).format('0, 0');

    return (
      <section className="crf-swipes">
        <div className="crf-swipes-title">
          <span className="crf-swipes-title-text">借款期限</span>
        </div>
        <div className="crf-swipes-amount">
          <span className="crf-swipes-amount-text ref-day" ref="refDay">{formatDay}天</span>
        </div>
        <div className="crf-swipes-content">
          <div className="crf-swipes-axis">
            <div className="crf-swipes-axis-inner"></div>
          </div>
          <div className="crf-swipes-rulers">
            {/*(this.state.data.length > 0) &&
              <ReactSwipes ref="rulers" className="crf-rulersDay" options={opt}>
                {this.state.data.map(ruler)}
              </ReactSwipes>
            */}
            <DaySwipes list={data} defaultDay={formatDay} />
          </div>
        </div>

        <RepayDetail />
      </section>
    )
  }
}
