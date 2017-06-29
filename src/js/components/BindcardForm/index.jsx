import React, {Component} from 'react';
import {withRouter} from 'react-router';
import styles from './index.scss';

import {Toast} from 'antd-mobile';

import SwitchBtn from '../switchBtn/index.jsx';
import Contract from '../setContract/index.jsx';
import WritePhone from './writePhone.jsx';
import FormWrap from './formWrap.jsx';

import PubSub from 'pubsub-js';


class Form extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      userName:'',
      telNumber:'',
      refAgree:{},
      refTelInput:{},
      refBankCard:{},
    };
    this.timer = null;
  }

  componentWillMount() {
    this.getUserInfo();
  }

  componentWillUnmount() {
    //销毁监听的事件
    PubSub.unsubscribe(this.pubsub_token);
  }

  componentDidMount() {
    _paq.push(['trackEvent', 'C_Page', 'E_P_BindCard']);

      //绑定事件
    this.bindEvent();

    //开户所在地
    const amListExtra=doc.querySelector('.am-list-extra');
    if (amListExtra.innerHTML!=='开户行所在地') {
      amListExtra.classList.add('color-323232');
    }

    //发布
    const refFormNextBtn=this.refs.refFormNextBtn;
    PubSub.publish('bindCard:ele', refFormNextBtn);
  }

  async getUserInfo(){
    let getContractUrl=CONFIGS.basePath+'api/user?kissoId='+CONFIGS.ssoId;
    let userPhone='';

    //显示loading图片
    this.props.setLoading(true);

    try {
      let fetchPromise = CRFFetch.Get(getContractUrl);
      // 获取数据
      let result = await fetchPromise;
      if (result && !result.response) {

        CONFIGS.userId=result.crfUid;
        CONFIGS.userName=result.userName;
        CONFIGS.idNo=result.idNo;
        console.log(result.randomNumber);
        if(result.randomNumber>=50000){
          userPhone=result.phone;
        }

        console.log(result);
        this.setState({
          userName:result.userName,
          telNumber:userPhone,
        });

        //隐藏loading图片
        this.props.setLoading(false);

        /*{
          "ctUserId": "3717add06dfd401e906359956b3f2a6f",
          "channel": null,
          "crfUid": "5a9c1868bb25df317b1c956db419deec",
          "idNo": "610426199205259690",
          "phone": "15292180003",
          "userName": "齐金亮2号",
          "headImg": null,
          "screenName": null,
          "qq": null,
          "address": null,
          "degree": null,
          "post": null,
          "purpose": null,
          "isSpecial": null,
          "preLimit": null,
          "status": 1,
          "createTime": 1490794924000,
          "updateTime": 1496712264000,
          "type": 2,
          "optId": null,
          "appChannel": "open",
          "kissoId": "d49be79470b6477aaab1304113cb0cfc",
          "visitRecordId": null
        }*/
      }
    } catch (err) {
      //隐藏loading图片
      this.props.setLoading(false);

      if(err.toString().indexOf('Unexpected')>-1){

        Toast.info('获取用户信息异常，请稍后再试');//
        return;
      }
      CRFFetch.handleError(err,Toast,()=>{
        try{
          if(err.response.status==400){
            err.body.then(data => {
              if(CONFIGS.chineseCharRegx.test(data.message)){
                Toast.info(data.message);
              }else{
                Toast.info('系统繁忙，请稍后再试！');
              }
            });
          }
        }catch(e){
          Toast.info('系统繁忙，请稍后再试！');
        }

      });
    }
  }

  async sendBindCardFetch() {
    const word32=Common.random32word();

    let submitFetchUrl=CONFIGS.basePath+'fts/borrower_open_account?kissoId='+CONFIGS.ssoId;
    let bankNumber=this.state.refBankCard.value.replace(/\s/g,'');
    CONFIGS.bindCard.bankNum=bankNumber;
    let params = {
      'autoDeduct': CONFIGS.bindCard.switchStatus,//代扣
      'bankCardNo': bankNumber,//银行卡号
      'bankCode': CONFIGS.bindCard.bankCode,
      'businessType': 'rcs',//业务类型
      'cityId': CONFIGS.bindCard.areaCode,//城市代码
      'crfUserId': CONFIGS.userId,//信而富用户id
      'email': null,//邮箱 可不传
      'idNo': CONFIGS.idNo,//证件号码 身份证
      'idType': "0",//证件类型
      'mobile': this.state.refTelInput.value,//手机号
      'realName': CONFIGS.userName,//用户姓名
      'requestRefNo': word32,
      'systemNo': "rcs"//系统编号 未定
    };

    let headers = {
      'Content-Type': 'application/json'
    };

    try {

      let fetchPromise = CRFFetch.Put(submitFetchUrl, JSON.stringify(params), headers);

      //显示loading图片
      this.props.setLoading(true);

      // 获取数据
      let result = await fetchPromise;

      result=result.json();
      //没有.json
      result.then((data)=>{
        if (data && !data.response) {
          switch (data.result){
            case 'ACCEPTED':
              setTimeout(()=>{
                this.reSendBindCardFetch(word32);
              },500);
              break;
            case 'SUCCESS':
              this.props.setLoading(false);//隐藏loading图片
              this.props.router.push('success');//绑卡成功
              break;
            case 'FAIL':
              this.props.setLoading(false);//隐藏loading图片
              this.props.router.push('rebindcard');
              break;
          }
        }
      });
        /*.then((err)=>{
        //隐藏loading图片
        this.props.setLoading(false);

        CRFFetch.handleError(err,()=>{
          if(!err){
            Toast.info('未知错误，请重新登录');
            return;
          }
          if(err.response.status==400){
            err.body.then(data => {
              if(/[\u0391-\uFFE5]+/.test(data.message)){
                Toast.info(data.message);
              }else{
                Toast.info('系统繁忙，请稍后再试！');
              }
            });
          }

        });
      });*/
    } catch (err) {
      //隐藏loading图片
      this.props.setLoading(false);

      CRFFetch.handleError(err,Toast,()=>{

        if(err.response.status==400){
          err.body.then(data => {
            if(CONFIGS.chineseCharRegx.test(data.message)){
              Toast.info(data.message);
            }else{
              Toast.info('系统繁忙，请稍后再试！');
            }
          });
        }

      });

    }
  }

  async reSendBindCardFetch(word32){

    let reCheckFetchUrl=CONFIGS.basePath+'fts/borrower_open_account?kissoId='+CONFIGS.ssoId+'&requestRefNo='+word32;

    try {

      let fetchPromise = CRFFetch.Get(reCheckFetchUrl);
      // 获取数据
      let result = await fetchPromise;

      if (result && !result.response) {

        switch (result.result){
          case 'ACCEPTED':
          case 'UNKNOWN':
            setTimeout(()=>{
              this.reSendBindCardFetch(word32);
            },1000);
            break;
          case 'SUCCESS':
            this.props.setLoading(false);//隐藏loading图片
            this.props.router.push('success');//绑卡成功
            break;
          case 'FAIL':
            this.props.setLoading(false);//隐藏loading图片
            const nextLocation = {
              pathname:'rebindcard',
              state:{
                failReason:result.failReason
              }
            };
            this.props.router.push(nextLocation);
            break;
        }
      }
    } catch (err) {
      //隐藏loading图片
      this.props.setLoading(false);

      CRFFetch.handleError(err,Toast,()=>{

        if(err.response.status==400){
          err.body.then(data => {
            if(CONFIGS.chineseCharRegx.test(data.message)){
              Toast.info(data.message);
            }else{
              Toast.info('系统繁忙，请稍后再试！');
            }
          });
        }

      });

    }
  }

  bindEvent(){
    //select city
    const amListExtra=doc.querySelector('.am-list-extra');
    doc.onclick = function (e) {
      if (e.target.classList.contains('am-picker-popup-header-right')) {
        amListExtra.classList.add('color-323232');
        amListExtra.innerHTML=amListExtra.innerHTML.replace(/,/g,'&nbsp;');
        if(CONFIGS.bindCard.cityCode===''||CONFIGS.bindCard.areaCode===''){
          CONFIGS.bindCard.cityCode='500';
          CONFIGS.bindCard.areaCode='6530';
        }
        this.removeDisabled();
      }
    }.bind(this);

  }

  handleSubmit(e) {//this.props.router.push('success');//绑卡成功 mock

    _paq.push(['trackEvent', 'C_BindCard', 'E_BindCard_submit', '确认提交按钮']);

    if (e.target.classList.contains(styles.btnDisabled)) {
      this.checkSubmitStatus();
      return;
    }

    this.sendBindCardFetch();
  }

  checkSubmitStatus(){

    if(this.state.refBankCard.value === ''){
      Toast.info('银行卡号不能为空');
      return;
    }
    if(!CONFIGS.bindCard.bankCardNumStatus){
      Toast.info('请输入正确的银行卡号');
      return;
    }

    if(this.state.refTelInput.value === ''){
      Toast.info('手机号码不能为空');
      return;
    }
    if(!CONFIGS.bindCard.phoneNumStatus){
      Toast.info('请输入正确的手机号码');
      return;
    }

    if(doc.querySelector('.am-list-extra').innerHTML === '开户行所在地'){
      Toast.info('请选择开户城市');
      return;
    }

    if(this.state.refAgree.classList.contains('un-agree')){
      Toast.info('请勾选合同协议');
    }
  }

  removeDisabled() {
    if (CONFIGS.bindCard.bankCardNumStatus && CONFIGS.bindCard.phoneNumStatus && doc.querySelector('.am-list-extra').innerHTML !== '开户行所在地'&&(!this.state.refAgree.classList.contains('un-agree'))) {
      this.refs.refFormNextBtn.classList.remove(styles.btnDisabled);
      CONFIGS.bindCard.notSubmit=false;
    }else{
      this.refs.refFormNextBtn.classList.add(styles.btnDisabled);
      CONFIGS.bindCard.notSubmit=true;
    }
  }

  setContractEle(el){
    this.setState({
      refAgree:el
    });
  }

  setWritePhoneEle(el){
    this.setState({
      refTelInput:el,
    });
  }

  setFormEle(el){
    this.setState({
      refBankCard:el
    });
  }

  render() {
    let userName = this.state.userName;
    let userTelNumber = this.state.telNumber;
    console.log('userName  '+this.state.userName);
    console.log('telNumber '+this.state.telNumber);
    return (
      <section className={CONFIGS.adapt?'adapt':''}>
        <FormWrap setLoading={this.props.setLoading} setUserName={userName} getFormEle={this.setFormEle.bind(this)} removeDisabled={this.removeDisabled.bind(this)} />

        <WritePhone setUserTelNumber={userTelNumber} getWritePhoneEle={this.setWritePhoneEle.bind(this)} removeDisabled={this.removeDisabled.bind(this)} />

        <SwitchBtn />

        <div className={styles.submitBtn+' submitBtn'}>
          <button className={styles.formNextButton + " " + (CONFIGS.bindCard.notSubmit?styles.btnDisabled:'')}
                  onClick={this.handleSubmit.bind(this)} ref="refFormNextBtn">确认提交
          </button>
          <Contract getContractEle={this.setContractEle.bind(this)} removeDisabled={this.removeDisabled.bind(this)}/>
        </div>

      </section>
    )
  }
}


export default withRouter(Form);
