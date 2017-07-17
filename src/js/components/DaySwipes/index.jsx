import React, { Component } from 'react';
import { Toast } from 'antd-mobile';

import '../../utils/common/monoevent';

export default class DaySwipes extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      rulerWidth:9,
      list: props.list,
      defaultDay: props.defaultDay
    };
    this.touchEl = {
      startX: 0,
      prevX: 0,
      moveX: 0,
      aboveX: 0,
      defaultLeft: 0,
    }
  }

  componentWillReceiveProps(nextProps) {
    this.setState({list: nextProps.list, defaultDay: nextProps.defaultDay});
  }

  componentDidMount(){
    this.bindEvent();

    this.pubsub_token = PubSub.subscribe('daySwipes:day', function(topic, val) {
      console.log('day swipes detail ---------------');
      this.setListData(val);
    }.bind(this));
  }

  componentWillUnmount() {
    this.removeEvent();

    //销毁监听的事件
    PubSub.unsubscribe(this.pubsub_token);
  }

  removeEvent(){
    const ne = MonoEvent;
    const refDaySwipes = ne('.day-swipes');
    refDaySwipes.un('touchstart');
    refDaySwipes.un('touchmove');
    refDaySwipes.un('touchend');
  }

  bindEvent(){
    const ne = MonoEvent;
    const refDaySwipes = ne('.day-swipes');
    refDaySwipes.on('touchstart', (e)=>{
      this.startFn.bind(this,e)();
    });
    refDaySwipes.on('touchmove', (e)=>{
      this.moveFn.bind(this,e)();
    });
    refDaySwipes.on('touchend', (e)=>{
      this.endFn.bind(this,e)();
    });
  }

  setListData(val){
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

    this.setState({
      list: arr,
      defaultDay: resetDay,
    });
    this.getInitDataFetch(resultObj);

    doc.querySelector('.ref-day').innerHTML=`${resetDay}天`;
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


  startFn(e){
    const touch = e.touches[0];
    this.touchEl.startX = touch.pageX;
  }

  moveFn(e){
    const refDaySwipes = doc.querySelector('.day-swipes');
    const touch = e.touches[0];

    let clientWidth50 = parseFloat(doc.documentElement.clientWidth/2);
    let rulerWidth50 = this.state.rulerWidth/2;
    let leftMax = clientWidth50 - rulerWidth50;
    const refDaySwipes50 = parseFloat(refDaySwipes.style.width) - clientWidth50 - rulerWidth50;

    this.touchEl.moveX = touch.pageX - this.touchEl.startX;//滑动的距离
    let leftPx = this.touchEl.aboveX + this.touchEl.moveX + this.touchEl.defaultLeft;

    if(parseFloat(refDaySwipes.style.left) >= leftMax){
      if(touch.pageX > this.touchEl.startX){
        leftPx = leftMax;
      }
    }

    if(parseFloat(refDaySwipes.style.left) <= -refDaySwipes50){
      if(touch.pageX < this.touchEl.startX){
        leftPx = -refDaySwipes50;
      }
    }

    refDaySwipes.style.left=leftPx+"px";
  }

  endFn(e){
    //e.preventDefault();
    const refDaySwipes = this.refs.refDaySwipes;
    const clientWidth50 = doc.documentElement.clientWidth/2;
    const rulerWidth50 = this.state.rulerWidth/2;

    this.touchEl.aboveX = parseFloat(refDaySwipes.style.left);
    this.touchEl.defaultLeft = 0;

    let total = clientWidth50 - rulerWidth50;
    let dayIndex = Math.round((total-this.touchEl.aboveX) / this.state.rulerWidth + 1);
    let dayLeft = total - (dayIndex - 1) * 9;

    if(dayIndex === 1){
      doc.querySelector('.first-day').innerHTML='';
    }else{
      doc.querySelector('.first-day').innerHTML='1天';
    }
    refDaySwipes.style.left = dayLeft+'px';
    doc.querySelector('.ref-day').innerHTML=`${dayIndex}天`;

    let resultObj = {
      remainLimit: CONFIGS.currentAmount,
      defaultDay: dayIndex,
    };
    this.getInitDataFetch(resultObj);
  }

  render() {
    const {list, defaultDay, rulerWidth} = this.state;

    console.log(list);
    const ruler = (item, index) => {
      if(index === 0){
        return (
          <div key={index} className="crf-ruler"><span className="first-day">{index+1}天</span><span className="under-line"></span></div>
        );
      }else{
        /*if(index%5==4){
          return (
            <div key={index} className="crf-ruler"><span className="first-day">{index+1}</span></div>
          );
        }*/
        return (
          <div key={index} className="crf-ruler"></div>
        );
      }
    };

    let totalWidth = list.length * rulerWidth;
    let defaultWidth = defaultDay * rulerWidth - rulerWidth / 2;
    const clientWidth50 = parseFloat(doc.documentElement.clientWidth/2);
    let defaultLeft = clientWidth50 - defaultWidth;

    this.touchEl.defaultLeft = defaultLeft;

    let daySwipesStyle={
      width: totalWidth,
      height: '100%',
      left: defaultLeft,
    };

    return (
      <div className="day-swipes" style={daySwipesStyle} ref="refDaySwipes">
        {(list.length > 0) && list.map(ruler)}
      </div>
    )
  }
}
