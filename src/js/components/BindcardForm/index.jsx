import React, {Component} from 'react';
import {withRouter} from 'react-router';
import styles from './index.scss';

import {Toast,InputItem} from 'antd-mobile';

import CityWrapper from '../selectCity/index.jsx';
import SwitchBtn from '../switchBtn/index.jsx';
import Contract from '../setContract/index.jsx';
import WritePhone from './writePhone.jsx';


class Form extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      cardBinData:null,
      userName:'',
      refAgree:{},
      refTelInput:{},
    };
    this.timer = null;
  }

  componentWillMount() {
    this.getUserInfo();
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
  }

  async sendLocationFetch(storageName,version){
    //let getContractUrl='../../../json/cardBin.json';
    let getJsonUrl=location.origin+'/credit_loan/json/cardBin.json';

    try {

      let fetchPromise = CRFFetch.Get(getJsonUrl);

      // 获取数据
      let result = await fetchPromise;
      console.log(result);
      if (result && !result.response) {
        localStorage.setItem('CRF_' + storageName, JSON.stringify(result));

        this.setState({
          cardBinData: result
        });

        localStorage.setItem('CRF_' + version, VERSION.cardBinVERSION);
      }
    } catch (err) {
      CRFFetch.handleError(err,Toast);
    }
  }

  async getUserInfo(){
    let getContractUrl=CONFIGS.basePath+'api/user?kissoId='+CONFIGS.ssoId;

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

        this.setState({
          //userId:result.crfUid,
          userName:result.userName,
          //idNo:result.idNo,
        });

        //隐藏loading图片
        this.props.setLoading(false);

        //获取对应数据
        this.requireJson();
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
        console.log(err);
        Toast.info('用户kissoID不存在');
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
    let bankNumber=this.refs.refBankCard.value.replace(/\s/g,'');
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
            this.props.router.push('rebindcard');
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

  async checkCardFetch(val) {

    let cardNo=val.replace(/\s/g,'');
    let checkCardUrl = CONFIGS.basePath+'fcp/cardInfo/?cardNo='+cardNo+'&kissoId='+CONFIGS.ssoId;

    const refBankName = this.refs.refBankName;
    const refSupportCard = this.refs.refSupportCard;
    const refBankError = this.refs.refBankError;

    try {

      let fetchPromise = CRFFetch.Get(checkCardUrl);

      //显示loading图片
      this.props.setLoading(true);

      // 获取数据
      let result = await fetchPromise;

      if (result && !result.response) {

        //隐藏loading图片
        this.props.setLoading(false);

        CONFIGS.bindCard.bankCode=result.bankCode;

        if(result.prcptcd==='1'){
          if(result.bankCode===null){
            //卡号错误
            refBankName.classList.add(styles.disabled);//所属银行字体变灰
            refSupportCard.classList.add('n');//隐藏支持银行div
            refBankError.classList.remove('n');//提示银行卡号错误
            CONFIGS.bindCard.bankCardNumStatus=false;
          }else{
            //卡号不支持
            refBankError.classList.add('n');//隐藏银行卡号错误
            refSupportCard.classList.remove('n');//显示支持银行div
            CONFIGS.bindCard.bankCardNumStatus=false;
          }

          this.refs.refFormNextBtn.classList.add(styles.btnDisabled);//提交按钮置灰

        }else if(result.prcptcd==='0'){
          refBankError.classList.add('n');//隐藏银行卡号错误
          refSupportCard.classList.add('n');//隐藏支持银行div
          CONFIGS.bindCard.bankCardNumStatus=true;
          this.removeDisabled();
        }

        refBankName.value=result.bankName||'银行';
        CONFIGS.bindCard.bankName=result.bankName;

        /*
        * bankCode:"CMB"
         bankName:"招商银行"
         cardType:"2"
         consultationPhone:null
         dayLimint:null
         monthLimint:null
         prcptcd:"0"
         singleLimint:null
         */
      }
    } catch (err) {
      //隐藏loading图片
      this.props.setLoading(false);

      CRFFetch.handleError(err,Toast,()=>{

        if(err.response.status===400){
          //{"code":"0000","message":"请输入正确的银行卡信息"}

          err.body.then(data => {
            Toast.info(data.message);

            //卡号错误
            refBankName.classList.add(styles.disabled);//所属银行字体变灰
            refSupportCard.classList.add('n');//隐藏支持银行div
            refBankError.classList.remove('n');//提示银行卡号错误
            CONFIGS.bindCard.bankCardNumStatus=false;
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


    //输入银行卡号
    const refBankCard=this.refs.refBankCard;
    const refBankCardClear=this.refs.refBankCardClear;
    const refBankName=this.refs.refBankName;

    //银行卡号
    refBankCard.oninput=()=>{
      if(refBankCard.value.length>0){
        refBankCardClear.classList.remove('n');
      }else{
        refBankCardClear.classList.add('n');
      }
    };

    refBankCard.onfocus=()=>{
      if(refBankCard.value.length>0){
        refBankCardClear.classList.remove('n');
      }
    };

    refBankCard.onblur=()=>{
      setTimeout(()=>{//解决与click冲突问题
        refBankCardClear.classList.add('n');
      },80);
    };

    refBankCardClear.onclick=()=>{
      refBankCard.value='';
      refBankCardClear.classList.add('n');

      this.refs.refBankError.classList.add('n');//隐藏银行卡错误提示
      this.refs.refSupportCard.classList.add('n');//隐藏支持银行div

      refBankName.value = '银行';//所属银行名字变回‘银行’
      refBankName.classList.add(styles.disabled);//所属银行字体变灰
    };
  }

  handleSubmit(e) {

    _paq.push(['trackEvent', 'C_BindCard', 'E_BindCard_submit', '确认提交按钮']);

    if (e.target.classList.contains(styles.btnDisabled)) {
      this.checkSubmitStatus();
      return;
    }

    this.sendBindCardFetch();
  }

  checkSubmitStatus(){

    if(this.refs.refBankCard.value === ''){
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

  checkSupport() {
    _paq.push(['trackEvent', 'C_BindCard', 'E_BindCard_checkCard', '查看支持银行卡']);
    this.props.router.push('supportcard');
  }

  bankNumInput(e) {
    const refBankName = this.refs.refBankName;
    const refBankError = this.refs.refBankError;
    const refSupportCard = this.refs.refSupportCard;
    const refFormNextBtn = this.refs.refFormNextBtn;
    const refBankCard = this.refs.refBankCard;

    let currentVal = e.target.value.replace(/\D/g,'');
    let cardBindArr = this.state.cardBinData;

    let notCardNum=true;

    CONFIGS.bindCard.bankNum=refBankCard.value;

    if (e.keyCode != 8) {
      refBankCard.value=currentVal.replace(/(\d{4})/g, '$1 ');

      if (currentVal.length === 6) {

        for(let i=0;i<cardBindArr.length;i++){
          if(currentVal==cardBindArr[i][0]){
            refBankName.value=cardBindArr[i][2];
            CONFIGS.bindCard.bankName=refBankName.value;
            refBankName.classList.remove(styles.disabled);//所属银行字体变黑
            refBankError.classList.add('n');//隐藏银行卡错误提示
            notCardNum=false;//表示卡号不在卡bin里
            break;
          }
        }

        if(notCardNum){
          refBankName.value = '银行';//所属银行名字变回‘银行’
          refBankName.classList.add(styles.disabled);//所属银行字体变灰
          refSupportCard.classList.remove('n');//显示支持银行div
          refBankError.classList.add('n');//隐藏银行卡错误提示
        }

      }
      if (currentVal.length >= 12) {//输入大于12位，然后停顿1.5秒，认为用户已经输入完，发请求到后端确认这个银行卡号是否正确
        clearTimeout(this.timer);
        this.timer = setTimeout(()=> {
          this.checkCardFetch(currentVal);
        }, 1000);
      }

    }

    if (e.target.value.length <= 6) {
      clearTimeout(this.timer);
      refBankError.classList.add('n');//隐藏银行卡错误提示
      refSupportCard.classList.add('n');//隐藏支持银行div

      refBankName.value = '银行';//所属银行名字变回‘银行’
      refBankName.classList.add(styles.disabled);//所属银行字体变灰

      refFormNextBtn.classList.add(styles.btnDisabled);//提交按钮置灰
    }
  }

  removeDisabled() {

    console.log(CONFIGS.bindCard.phoneNumStatus);

    if (CONFIGS.bindCard.bankCardNumStatus && CONFIGS.bindCard.phoneNumStatus && doc.querySelector('.am-list-extra').innerHTML !== '开户行所在地'&&(!this.state.refAgree.classList.contains('un-agree'))) {
      this.refs.refFormNextBtn.classList.remove(styles.btnDisabled);
      CONFIGS.bindCard.notSubmit=false;
    }else{
      this.refs.refFormNextBtn.classList.add(styles.btnDisabled);
      CONFIGS.bindCard.notSubmit=true;
    }
  }

  setCitySelect(val) {
    CONFIGS.bindCard.cityCode = val[0];
    CONFIGS.bindCard.areaCode = val[1];
    this.removeDisabled();
  }

  setSwitchVal(val){
    CONFIGS.bindCard.switchStatus=val;
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

  requireJson() {
    let storageName = 'cardBinData';
    let version = 'cardBinVersion';

    let allData = JSON.parse(localStorage.getItem('CRF_' + storageName));

    if (!(allData&&allData[0]) || VERSION.cardBinVERSION != localStorage.getItem('CRF_' + version) ) {

      this.sendLocationFetch(storageName,version);

    } else {

      this.setState({
        cardBinData: allData
      });

    }
  }

  render() {

    const userName = '*'+this.state.userName.substring(1);

    const isBankName=CONFIGS.bindCard.bankName==='银行'||CONFIGS.bindCard.bankName==='';

    return (
      <section className={CONFIGS.adapt?'adapt':''}>
        <div className={styles.infoForm}>
          <div className={styles.formInput}>
            <div className={styles.borderLine+' borderLine'}>
              <input type="button" className={styles.userName} value={userName} />
            </div>
          </div>
          <div className={styles.formInput}>
            <div className={styles.borderLine+' borderLine'}>
              <input type="tel" className={styles.bankCard} placeholder="请输入银行卡号" onKeyUp={this.bankNumInput.bind(this)} defaultValue={CONFIGS.bindCard.bankNum||""} maxLength="19" ref="refBankCard"/>
            </div>
            <div className={styles.errorInfo + " n"} ref="refSupportCard">
              暂不支持此卡, 请查看<a href="javascript:void(0);" onClick={this.checkSupport.bind(this)}>支持银行卡</a>
            </div>
            <div className={styles.errorInfo + " color-FA4548 n"} ref="refBankError">您输入的银行卡号有误</div>
            <div className="clearVal n" ref="refBankCardClear"><div className="clearInput"><span className="closeBtn">x</span></div></div>
          </div>
          <div className={styles.formInput}>
            <div className={styles.borderLine+' borderLine'}>
              <input type="button" className={(isBankName?styles.disabled:"") + " " + styles.bank} defaultValue={CONFIGS.bindCard.bankName||"银行"} ref="refBankName"/>
            </div>
          </div>
          <div className={styles.formInput}>
            <CityWrapper getSelectVal={this.setCitySelect.bind(this)}/>
          </div>
        </div>

        <WritePhone getWritePhoneEle={this.setWritePhoneEle.bind(this)} removeDisabled={this.removeDisabled.bind(this)} />

        <SwitchBtn getSwitchVal={this.setSwitchVal.bind(this)} />

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
