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
    this.el={
      halfClientWidth: parseFloat(document.documentElement.clientWidth/2),
      halfRulerWidth: this.state.rulerWidth/2,
    };
  }

  componentWillReceiveProps(nextProps) {
    this.setState({list: nextProps.list, defaultDay: nextProps.defaultDay});
  }

  componentDidMount(){
    this.bindEvent();

    this.pubsub_token = PubSub.subscribe('daySwipes:day', function(topic, val) {
      //console.log('day swipes detail ---------------',val);
      this.setListData(val);
    }.bind(this));

  }

  componentWillUnmount() {
    this.removeEvent();

    //销毁监听的事件
    PubSub.unsubscribe(this.pubsub_token);
  }

  componentDidUpdate(){
    const refDaySwipes = document.querySelector('.day-swipes');
    const screenHalf = this.el.halfClientWidth + this.el.halfRulerWidth;

    //页面更新的时候确保left的值不会超出边界
    setTimeout(()=>{
      const refDayText = document.querySelector('.ref-day').innerText;

      let currentDay;
      if(refDayText.indexOf('期') > -1){
        currentDay = parseFloat(refDayText) * 30;
      }else{
        currentDay = parseFloat(refDayText);
      }

      let defaultLeft = parseFloat(screenHalf) - (currentDay * this.state.rulerWidth);

      if(parseInt(refDaySwipes.style.left) !== defaultLeft){
        refDaySwipes.style.left =  defaultLeft + 'px';
      }
    },0);
  }

  async getInitDataFetch(defaultData) {
    let { defaultDay, remainLimit } = defaultData;
    CONFIGS.loanData.sendSwitch = false;

    let d = new Date();

    let period;
    let periodDay;
    console.log(defaultDay,remainLimit,CONFIGS.loanData.period,'----000000000000----');
    if(CONFIGS.loanData.period > 1 && defaultDay > 30){
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
        //loanResult = {"code":"1004","message":"用户无权限使用借款产品"};
        PubSub.publish('loanDetail:list', loanResult.detailList.LoanPlan);
      }

    } catch (error) {

      CONFIGS.loanData.sendSwitch = true;
      PubSub.publish('loading:hide');

      CRFFetch.handleError(error, Toast, () => {
        if (error.response.status === 400) {
          error.body.then(data => {
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
    const refDaySwipes = ne('.loan-ruler-day');
    refDaySwipes.un('touchstart');
    refDaySwipes.un('touchmove');
    refDaySwipes.un('touchend');
  }

  bindEvent(){
    const ne = MonoEvent;
    const refWrap = ne('.loan-ruler-day');
    const touchDoc = ne(document);
    const dayEl = document.querySelector('.day-swipes');

    refWrap.on('touchstart',(e) => {
      let touch = e.touches[0];
      let disX = touch.pageX - dayEl.offsetLeft;

      touchDoc.on('touchmove', (e) => {
        let touch = e.touches[0];
        let swipeLeft = touch.pageX - disX;//计算
        this.setTouchMove(swipeLeft);//限定,使用
      });

      touchDoc.on('touchend', () => {
        touchDoc.un('touchend');
        touchDoc.un('touchmove');
        this.setTouchEnd();
      });

      return false;
    });
  }

  setTouchMove(swipeLeft){
    const refDaySwipes = document.querySelector('.day-swipes');
    const refDay = document.querySelector('.ref-day');

    let leftMax = this.el.halfClientWidth - this.el.halfRulerWidth;
    const refDaySwipes50 = parseFloat(refDaySwipes.style.width) - this.el.halfClientWidth - this.el.halfRulerWidth;

    if(swipeLeft <= -refDaySwipes50){
      swipeLeft = -refDaySwipes50;
    }
    if(swipeLeft > leftMax){
      swipeLeft = leftMax;
    }

    let total = this.el.halfClientWidth - this.el.halfRulerWidth;
    let dayIndex = Math.round((total - parseFloat(refDaySwipes.style.left)) / this.state.rulerWidth + 1);

    let resultDay;
    if(dayIndex <= 30){
      resultDay = `${dayIndex}天`;
    }else{
      resultDay = `${Math.ceil(dayIndex/30)}期`;
    }

    refDay.innerHTML = resultDay;
    refDaySwipes.style.left = swipeLeft + 'px';
  }

  setListData(val){//val是最后拖动金额

    let resetDay = this.maxDay(val);//resetDay是根据规则返回的最大日期期限 14 30 60 90
    let dayArray = CONFIGS.loanPeriod.productions[CONFIGS.currentAmount/100-1].dayArray || [];//如果为null则返回空数组
    let periodArray = CONFIGS.loanPeriod.productions[CONFIGS.currentAmount/100-1].periodArray;

    let defaultDay;
    let resetDefault = false;

    if(dayArray.length > CONFIGS.loanData.touchEndDay){
      defaultDay = CONFIGS.loanData.touchEndDay;
      resetDefault = true;
    }else{
      defaultDay = resetDay;
      CONFIGS.loanData.touchEndDay = resetDay;
    }

    if(Object.prototype.toString.call(periodArray) === '[object Array]'){
      let maxArray = [];
      let maxCount = Math.max.apply(Math,periodArray)*30;
      for(let i = 0; i < maxCount; i++){
        maxArray.push(i);
      }
      dayArray = maxArray;
      defaultDay = resetDay;
      CONFIGS.loanData.touchEndDay = resetDay;
      resetDefault = true;
    }

    console.log('default:'+defaultDay,'resetDay:'+resetDay,'dayArray.length:'+dayArray.length,'val:'+val);
    let resultObj = {
      defaultDay: defaultDay,//14 30 60 90
      remainLimit: val,//100-无穷
    };
    this.setState({
      list: dayArray,//arr是计算出来的日期数组,dayArray是接口返回的日期数组
      defaultDay: defaultDay,
    });

    //当最后拖拽结束的日期 大于 金额最大期限天数 则显示日期为最大期限天数
    //const refDay = document.querySelector('.ref-day');

    /*
    * 当滑动借款金额 由大变小
     最大期限没变，当前期限也不变。
     变了则变成最大金额
     当滑动借款金额 由小变大
     期限不变，不管最大期限是否有变
    * */
    let endDay;
    if(val > CONFIGS.loanData.amount){//由小变大
      endDay = '';
    }else{//由大变小；或者相等，不变

      if(dayArray.length < CONFIGS.loanData.dragDay || CONFIGS.loanData.dayArrayLength > dayArray.length){ //以前大于现在
        //金额对应最大期限，当前期限
        endDay = dayArray.length;
        CONFIGS.loanData.dayArrayLength = dayArray.length;

        //当CONFIGS.loanData.dragDay大于dayArray的时候
        CONFIGS.loanData.dragDay = dayArray.length;
      }else{
        //console.log('最大期限，当前期限',CONFIGS.loanData.dragDay,defaultDay);
        if(resetDefault){
          endDay = defaultDay;
        }else{
          endDay = CONFIGS.loanData.dragDay;
        }
      }

    }
    //console.log('val:'+val,'endDay:'+endDay,'*/*/*/*/*/*');

    this.setRefDay(endDay,dayArray,resetDay);

    this.getInitDataFetch(resultObj);
  }

  maxDay(amount){
    //console.log(CONFIGS.loanPeriod.productions,amount,'------');  //设置期限，设置count
    //console.log(CONFIGS.loanPeriod.productions[amount/100-1]);
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

      //CONFIGS.loanData.period = productData.periodArray.length + 1;//数组为[2],表示2期；为[2,3]表示3期,问清楚以后是否为[2,3,4]
      CONFIGS.loanData.period = Math.max.apply(Math,productData.periodArray);
      maxDay = CONFIGS.loanData.period * 30;//2期为60天，3期90天
      if(productData.dayArray === null){
        //显示期数，只能拖动期数的范围，(30-60] || (30-90]

      }else{
        //有期数也有天数，拖动范围最大,大于30天，显示期数

      }
    }

    return maxDay;
  }

  setTouchEnd(){
    const refDaySwipes = this.refs.refDaySwipes;

    //this.touchEl.defaultLeft = 0;

    let total = this.el.halfClientWidth - this.el.halfRulerWidth;
    let dayIndex = Math.round((total - parseFloat(refDaySwipes.style.left)) / this.state.rulerWidth + 1);
    let dayLeft = total - (dayIndex - 1) * 9;

    CONFIGS.loanData.dragDay = dayIndex;

    console.log(CONFIGS.currentAmount,'CONFIGS.currentAmount');
    let maxDay = this.maxDay(CONFIGS.currentAmount);
    if(dayIndex > maxDay){
      dayIndex = maxDay;
    }

    CONFIGS.loanData.touchEndDay = dayIndex;

    if(dayIndex === 1){
      document.querySelector('.first-day').innerHTML='';
    }else{
      document.querySelector('.first-day').innerHTML='1天';
    }
    refDaySwipes.style.left = dayLeft+'px';

    this.setRefDay(dayIndex);

    //console.log(dayIndex,CONFIGS.loanData.touchEndDay,'-----------dayIndex-------------');

    let resultObj = {
      remainLimit: CONFIGS.currentAmount,
      defaultDay: dayIndex,
    };

    this.getInitDataFetch(resultObj);
  }

  setRefDay(day,dayArray,defaultDay){
    const refDay = document.querySelector('.ref-day');

    //console.log(day,dayArray.length,defaultDay,'*******----this.setRefDay----******');
    if(day > 30){
      //console.log(Math.ceil(day/30));
      refDay.innerHTML = `${Math.ceil(day/30)}期`;
      CONFIGS.loanData.period = Math.ceil(day/30);
    }else{
      if(day){
        refDay.innerHTML = `${day}天`;
      }else{
        //console.log(dayArray,defaultDay,'*******************this.setState**************');
        //设置swipe的left的距离,  当只有2、3期的时候
        this.setState({
          list: dayArray,
          defaultDay: defaultDay,
        });
      }
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
    let defaultLeft = this.el.halfClientWidth - defaultWidth;

    //this.touchEl.defaultLeft = defaultLeft;

    console.log('defaultLeft:'+defaultLeft,'totalWidth:'+totalWidth,'length'+list.length,'defaultDay:'+defaultDay);
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
