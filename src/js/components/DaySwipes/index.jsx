import React, { Component } from 'react';
import { Toast } from 'antd-mobile';
import { hashHistory } from 'react-router';

import '../../utils/common/monoevent';

export default class DaySwipes extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      rulerWidth:9,
      list: props.list,
      defaultDay: props.defaultDay,
    };
    /*this.touchEl = {
      startX: 0,
      prevX: 0,
      moveX: 0,
      defaultLeft: 0,
    }*/
  }

  componentWillReceiveProps(nextProps) {
    this.setState({list: nextProps.list, defaultDay: nextProps.defaultDay});
  }

  componentDidMount(){
    this.bindEvent();

    this.pubsub_token = PubSub.subscribe('daySwipes:day', function(topic, val) {
      console.log('day swipes detail ---------------',val);
      this.setListData(val);
    }.bind(this));
  }

  componentWillUnmount() {
    this.removeEvent();

    //销毁监听的事件
    PubSub.unsubscribe(this.pubsub_token);
  }

  async getInitDataFetch(defaultData) {
    let { defaultDay, remainLimit } = defaultData;
    CONFIGS.loanData.sendSwitch = false;

    let d = new Date();

    let period;
    let periodDay;
    if(CONFIGS.loanData.period > 1){
      period = 'M';
      periodDay = CONFIGS.loanData.period;
    }else{
      period = 'D';
      periodDay = defaultDay;
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

    let loanPath = `${CONFIGS.productPath}/loanClause?productNo=${params.productNo}&loanAmount=${params.loanAmount}&loanPeriod=${params.loanPeriod}&startTime=${params.startTime}&periodUnit=${params.periodUnit}&kissoId=${params.kissoId}`;

    try {
      let loanFetchPromise = CRFFetch.Get(loanPath);

      // 获取数据
      let loanResult = await loanFetchPromise;

      CONFIGS.loanData.sendSwitch = true;
      PubSub.publish('loading:hide');

      if (loanResult && !loanResult.response) {
        PubSub.publish('loanDetail:list', loanResult.detailList.LoanPlan);
      }

    } catch (error) {

      CONFIGS.loanData.sendSwitch = true;
      PubSub.publish('loading:hide');

      CRFFetch.handleError(error, Toast, () => {
        if (error.response.status === 400) {
          error.body.then(data => {
            //Toast.info(data.message);
            PubSub.publish('loanDetail:list', data.message);
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

  removeEvent(){
    const ne = MonoEvent;
    const refDaySwipes = ne('.day-swipes');
    refDaySwipes.un('touchstart');
    refDaySwipes.un('touchmove');
    refDaySwipes.un('touchend');
  }

  bindEvent(){
    const ne = MonoEvent;
    const refWrap = ne('.loan-ruler-day');

    const dayEl = doc.querySelector('.day-swipes');
    const touchDoc = ne(document);

    refWrap.on('touchstart',(e)=>{
      let touch = e.touches[0];
      let disX = touch.pageX - dayEl.offsetLeft;

      touchDoc.on('touchmove', (e)=>{
        let touch = e.touches[0];
        let swipeLeft = touch.pageX - disX;//计算
        this.setMoveFn(swipeLeft);//限定,使用
      });

      touchDoc.on('touchend', ()=>{
        touchDoc.un('touchend');
        touchDoc.un('touchmove');
        this.endFn();
      });

      return false;
    });
  }

  setMoveFn(swipeLeft){
    const refDaySwipes = doc.querySelector('.day-swipes');

    let clientWidth50 = parseFloat(doc.documentElement.clientWidth/2);
    let rulerWidth50 = this.state.rulerWidth/2;
    let leftMax = clientWidth50 - rulerWidth50;
    const refDaySwipes50 = parseFloat(refDaySwipes.style.width) - clientWidth50 - rulerWidth50;

    if(swipeLeft <= -refDaySwipes50){
      swipeLeft = -refDaySwipes50;
    }
    if(swipeLeft > leftMax){
      swipeLeft = leftMax;
    }

    refDaySwipes.style.left = swipeLeft + 'px';
  }

  maxDay(amount){
    //console.log(CONFIGS.loanPeriod.productions,amount,'------');  //设置期限，设置count
    console.log(CONFIGS.loanPeriod.productions[amount/100-1]);
    //{loanAmount: "1000", periodArray: null, dayArray: Array(30)}
    //{loanAmount: "1000", periodArray: [2], dayArray: Array(30)}

    let maxDay;

    let productData = CONFIGS.loanPeriod.productions[amount/100-1];

    if(productData.periodArray === null){
      if(productData.dayArray === null){
        //默认显示30天，天数不能拖动，  显示错误信息，不能提交
        maxDay = 30;
      }else{
        //一般情况，只有1期，拖动dayArray的天数
        CONFIGS.loanData.period = 1;
        maxDay = productData.dayArray.length;
      }
    }else{
      CONFIGS.loanData.period = productData.periodArray.length + 1;//数组为[2],表示2期；为[2,3]表示3期,问清楚以后是否为[2,3,4]
      maxDay = (productData.periodArray.length + 1) * 30;//2期为60天，3期90天
      if(productData.dayArray === null){
        //显示期数，只能拖动期数的范围，不能拖动天数

      }else{
        //有期数也有天数，拖动范围最大

      }
    }

    return maxDay;
  }

  setListData(val){
    let resetDay = this.maxDay(val);//resetDay是根据规则返回的最大日期期限 14 30 60 90

    let dayArray = CONFIGS.loanPeriod.productions[CONFIGS.currentAmount/100-1].dayArray;

    let resultObj = {
      defaultDay: resetDay,//14 30 60 90
      remainLimit: val,//100-无穷
    };

    //console.log(this.state.list.length , dayArray.length,'//////////************------------');

    this.setState({
      list: dayArray,//arr是计算出来的日期数组,dayArray是接口返回的日期数组
      defaultDay: resetDay,
    });

    //当最后拖拽结束的日期 大于 金额最大期限天数 则显示日期为最大期限天数
    if(CONFIGS.loanData.touchEndDay > dayArray.length){

      this.setRefDay(dayArray.length);
    }
    /*else{
      this.setRefDay(resetDay);
    }*/

    this.getInitDataFetch(resultObj);
  }

  endFn(){
    const refDaySwipes = this.refs.refDaySwipes;
    const clientWidth50 = doc.documentElement.clientWidth/2;
    const rulerWidth50 = this.state.rulerWidth/2;

    //this.touchEl.defaultLeft = 0;

    let total = clientWidth50 - rulerWidth50;
    let dayIndex = Math.round((total - parseFloat(refDaySwipes.style.left)) / this.state.rulerWidth + 1);
    let dayLeft = total - (dayIndex - 1) * 9;

    console.log(this.maxDay(CONFIGS.currentAmount),'maxDay------------------');
    let maxDay = this.maxDay(CONFIGS.currentAmount);
    if(dayIndex > maxDay){
      dayIndex = maxDay;
    }

    if(dayIndex === 1){
      doc.querySelector('.first-day').innerHTML='';
    }else{
      doc.querySelector('.first-day').innerHTML='1天';
    }
    refDaySwipes.style.left = dayLeft+'px';

    this.setRefDay(dayIndex);

    CONFIGS.loanData.touchEndDay = dayIndex;

    let resultObj = {
      remainLimit: CONFIGS.currentAmount,
      defaultDay: dayIndex,
    };

    this.getInitDataFetch(resultObj);
  }

  setRefDay(day){
    const refDay = doc.querySelector('.ref-day');
    if(day>30){
      refDay.innerHTML=`${CONFIGS.loanData.period}期`;
    }else{
      refDay.innerHTML=`${day}天`;
    }
  }

  render() {
    const {list, defaultDay, rulerWidth} = this.state;

    //console.log(list);
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

    //this.touchEl.defaultLeft = defaultLeft;

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
