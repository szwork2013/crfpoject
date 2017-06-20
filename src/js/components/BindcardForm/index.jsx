import React, {Component} from 'react';
import {withRouter} from 'react-router';
import styles from './index.scss';

import {Toast,InputItem} from 'antd-mobile';

import CityWrapper from './selectCity.jsx';
import SwitchBtn from './switchBtn.jsx';


class Form extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      cardBinData:null,
      contractData:[
        {contractName:'网络交易资金账号三方协议',contractUrl:location.origin+'contract/tripartite_agreement.html'},
        {contractName:'第三方协议',contractUrl:location.origin+'contract/userLicense_agreement.html'}
      ],
      userName:'',
    };
    this.timer = null;
    this.bankCode='';

    this.bankCardNumStatus=false;
    this.phoneNumStatus=false;

  }

  componentWillMount() {
    this.getUserInfo();
  }

  componentDidMount() {

    this.bindEvent();

    //开户所在地
    const amListExtra=doc.querySelector('.am-list-extra');
    if (amListExtra.innerHTML!=='开户行所在地') {
      amListExtra.classList.add('color-323232');
      //this.removeDisabled();
    }
  }

  async getUserInfo(){
    let getContractUrl=CONFIGS.basePath+'api/user?kissoId='+CONFIGS.ssoId;

    try {
      let fetchPromise = CRFFetch.Get(getContractUrl);
      // 获取数据
      let result = await fetchPromise;
      if (result && !result.response) {
        console.log(result);

        CONFIGS.userId=result.crfUid;
        CONFIGS.userName=result.userName;
        CONFIGS.idNo=result.idNo;

        this.setState({
          //userId:result.crfUid,
          userName:result.userName,
          //idNo:result.idNo,
        });

        //获取对应数据
        this.requireJson();
        this.getContractFetch();
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
      if(err.toString().indexOf('Unexpected')>-1){
        console.log(err);
        Toast.info('用户kissoID不存在');
        return;
      }
      CRFFetch.handleError(err,()=>{
        try{
          if(err.response.status==400){
            err.body.then(data => {
              if(/[\u0391-\uFFE5]+/.test(data.message)){
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

  async getContractFetch(){
    let type='OPEN_ACCOUNT';
    let getContractUrl=CONFIGS.basePath+'contract/?contractEnum='+type;

      try {
      let fetchPromise = CRFFetch.Get(getContractUrl);
      // 获取数据
      let result = await fetchPromise;
      if (result && !result.response) {

        /*
         {contractName:"网络交易资金账户第三方协议",contractUrl:"https://m-ci.crfchina.com/tripartite_agreement.html"}
         {contractName:"用户授权协议",contractUrl:"https://m-ci.crfchina.com/userLicense_agreement.html"}
        * */
        this.setState({
          contractData:result
        });
      }
    } catch (err) {
      CRFFetch.handleError(err,()=>{

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
    }
  }

  async sendBindCardFetch() {
    const word32=this.random32word();

    let submitFetchUrl=CONFIGS.basePath+'fts/borrower_open_account?kissoId='+CONFIGS.ssoId;
    let bankNumber=this.refs.refBankCard.value.replace(/\s/g,'');
    CONFIGS.bindCard.bankNum=bankNumber;
    let params = {
      'autoDeduct': CONFIGS.bindCard.switchStatus,//代扣
      'bankCardNo': bankNumber,//银行卡号
      'bankCode': this.bankCode,
      'businessType': 'rcs',//业务类型
      'cityId': CONFIGS.bindCard.areaCode,//城市代码
      'crfUserId': CONFIGS.userId,//信而富用户id
      'email': null,//邮箱 可不传
      'idNo': CONFIGS.idNo,//证件号码 身份证
      'idType': "0",//证件类型
      'mobile': this.refs.refTelInput.value,//手机号
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
      }).then((err)=>{
        CRFFetch.handleError(err,()=>{

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
      });
    } catch (err) {
      CRFFetch.handleError(err,()=>{

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
            this.props.setLoading(false);
            this.props.router.push('success');//绑卡成功
            break;
          case 'FAIL':
            this.props.setLoading(false);
            this.props.router.push('rebindcard');
            break;
        }
      }
    } catch (err) {
      CRFFetch.handleError(err,()=>{

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

        this.bankCode=result.bankCode;

        if(result.prcptcd==='1'){
          if(result.bankCode===null){
            //卡号错误
            refBankName.classList.add(styles.disabled);//所属银行字体变灰
            refSupportCard.classList.add('n');//隐藏支持银行div
            refBankError.classList.remove('n');//提示银行卡号错误
            this.bankCardNumStatus=false;
          }else{
            //卡号不支持
            refBankError.classList.add('n');//隐藏银行卡号错误
            refSupportCard.classList.remove('n');//显示支持银行div
            this.bankCardNumStatus=false;
          }

          this.refs.refFormNextBtn.classList.add(styles.btnDisabled);//提交按钮置灰

        }else if(result.prcptcd==='0'){
          refBankError.classList.add('n');//隐藏银行卡号错误
          refSupportCard.classList.add('n');//隐藏支持银行div
          this.bankCardNumStatus=true;
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

      CRFFetch.handleError(err,()=>{

        if(err.response.status===400){
          //{"code":"0000","message":"请输入正确的银行卡信息"}

          err.body.then(data => {
            if(data.code==="0000"){
              Toast.info(data.message);

              //卡号错误
              refBankName.classList.add(styles.disabled);//所属银行字体变灰
              refSupportCard.classList.add('n');//隐藏支持银行div
              refBankError.classList.remove('n');//提示银行卡号错误
              this.bankCardNumStatus=false;
              return;
            }
            if(/[\u0391-\uFFE5]+/.test(data.message)){
              console.log(data.message);
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
        this.removeDisabled();
      }
    }.bind(this);


    //勾选协议
    const refAgree=this.refs.refAgree;
    refAgree.onclick=()=>{
      refAgree.classList.toggle(styles['un-agree']);
      CONFIGS.bindCard.isAgree=!CONFIGS.bindCard.isAgree;
      this.removeDisabled();
    };


    //输入框 focus click
    const refBankCard=this.refs.refBankCard;
    const refTelInput=this.refs.refTelInput;
    const refBankCardClear=this.refs.refBankCardClear;
    const refPhoneClear=this.refs.refPhoneClear;

    refBankCard.onfocus=()=>{
      refBankCardClear.classList.remove('n');
    };
    refTelInput.onfocus=()=>{
      refPhoneClear.classList.remove('n');
    };

    refBankCardClear.onclick=()=>{
      refBankCard.value='';
      refBankCardClear.classList.add('n');

      this.refs.refBankError.classList.add('n');//隐藏银行卡错误提示
      this.refs.refSupportCard.classList.add('n');//隐藏支持银行div

      this.refs.refBankName.value = '银行';//所属银行名字变回‘银行’
      this.refs.refBankName.classList.add(styles.disabled);//所属银行字体变灰
    };
    refPhoneClear.onclick=()=>{
      refTelInput.value='';
      refPhoneClear.classList.add('n');

      this.refs.refTelErrorMsg.classList.add('n');//隐藏手机号错误提示
    };
  }

  handleSubmit(e) {

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
    if(!this.bankCardNumStatus){
      Toast.info('请输入正确的银行卡号');
      return;
    }

    if(this.refs.refTelInput.value === ''){
      Toast.info('手机号码不能为空');
      return;
    }
    if(!this.phoneNumStatus){
      Toast.info('请输入正确的手机号码');
      return;
    }

    if(doc.querySelector('.am-list-extra').innerHTML === '开户行所在地'){
      Toast.info('请选择开户城市');
      return;
    }

    if(this.refs.refAgree.classList.contains(styles['un-agree'])){
      Toast.info('请勾选合同协议');
    }
  }

  checkSupport() {
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

  telRegex(e) {
    let refTelErrorMsg=this.refs.refTelErrorMsg;
    let refFormNextBtn=this.refs.refFormNextBtn;

    let currentVal=e.target.value;
    CONFIGS.bindCard.phoneNum=currentVal;

    if (currentVal.length === 11) {
      if (/^1([1-6]\d|7[^017]|[8-9]\d)\d{8}$/.test(e.target.value)) {
        this.phoneNumStatus=true;
        this.removeDisabled();
        if (!refTelErrorMsg.classList.contains('n')) {
          refTelErrorMsg.classList.add('n');//隐藏手机号错误提示
        }
      } else {
        this.phoneNumStatus=false;
        refFormNextBtn.classList.add(styles.btnDisabled);//提交按钮置灰
        refTelErrorMsg.classList.remove('n');//显示手机号错误提示
      }
    } else {
      this.phoneNumStatus=false;
      refFormNextBtn.classList.add(styles.btnDisabled);//提交按钮置灰
      refTelErrorMsg.classList.add('n');//隐藏手机号错误提示
    }
  }

  removeDisabled() {
    // this.refs.refBankCard.value !== '' this.refs.refTelInput.value !== ''
    if (this.bankCardNumStatus && this.phoneNumStatus && doc.querySelector('.am-list-extra').innerHTML !== '开户行所在地'&&(!this.refs.refAgree.classList.contains(styles['un-agree']))) {
      this.refs.refFormNextBtn.classList.remove(styles.btnDisabled);
    }else{
      this.refs.refFormNextBtn.classList.add(styles.btnDisabled);
    }
  }

  setCitySelect(val) {
    /*this.setState({
     cityCode:val[0],
     areaCode:val[1],
     });*/
    //this.cityCode = val[0];
    //this.areaCode = val[1];
    CONFIGS.bindCard.cityCode = val[0];
    CONFIGS.bindCard.areaCode = val[1];
    this.removeDisabled();

  }

  handleContractClick(item){
    CONFIGS.bindCard.contractName=item.contractName;
    CONFIGS.bindCard.contractUrl=item.contractUrl;
    this.props.router.push('contract');
  }

  setSwitchVal(val){
    CONFIGS.bindCard.switchStatus=val;
  }

  random32word(){
    let str = '';
    let arr = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'];

    for(let i=0;i<32;i++){
      str+=arr[parseInt(Math.random()*arr.length)];
    }

    return str;
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
      CRFFetch.handleError(err);
    }
  }

  render() {
    //let userName='*'+global.userName;
    const userName = '*'+this.state.userName.substring(1);

    const isBankName=CONFIGS.bindCard.bankName==='银行'||CONFIGS.bindCard.bankName==='';

    const isAgree=CONFIGS.bindCard.isAgree;

    console.log(++CONFIGS.count+'render le me');
    return (
      <section>
        <div className={styles.infoForm}>
          <div className={styles.formInput}>
            <div className={styles.borderLine}>
              <input type="button" className={styles.userName} value={userName} />
            </div>
          </div>
          <div className={styles.formInput}>
            <div className={styles.borderLine}>
              <input type="tel" className={styles.bankCard} placeholder="请输入银行卡号" onKeyUp={this.bankNumInput.bind(this)} defaultValue={CONFIGS.bindCard.bankNum||""} maxLength="19" ref="refBankCard"/>
              {/*<InputItem placeholder="请输入银行卡号" maxLength="19" type="bankCard"></InputItem>*/}
            </div>
            <div className={styles.errorInfo + " n"} ref="refSupportCard">
              暂不支持此卡, 请查看<a href="javascript:void(0);" onClick={this.checkSupport.bind(this)}>支持银行卡</a>
            </div>
            <div className={styles.errorInfo + " color-FA4548 n"} ref="refBankError">您输入的银行卡号有误</div>
            <div className="clearPwd n" ref="refBankCardClear"><span className="closeBtn">x</span></div>
          </div>
          <div className={styles.formInput}>
            <div className={styles.borderLine}>
              <input type="button" className={(isBankName?styles.disabled:"") + " " + styles.bank} defaultValue={CONFIGS.bindCard.bankName||"银行"} ref="refBankName"/>
            </div>
          </div>
          <div className={styles.formInput}>
            <CityWrapper getSelectVal={this.setCitySelect.bind(this)}/>
          </div>
        </div>

        <div className={styles.infoForm + " " + styles.telInput}>
          <input type="tel" className={styles.infoInput + ' ' + styles.userPhone} placeholder="请输入该银行卡预留的手机号"
                 onInput={this.telRegex.bind(this)} defaultValue={CONFIGS.bindCard.phoneNum} maxLength="11" ref="refTelInput"/>
          <div className={styles.errorInfo + " color-FA4548 n"} ref="refTelErrorMsg">请输入正确的手机号</div>
          <div className="telInput clearPwd n" ref="refPhoneClear"><span className="closeBtn">x</span></div>
        </div>

        <div className={styles.infoForm + " " + styles.switchForm}>
          <span className={styles.infoInput + ' ' + styles.repayBtn}>开通自动还款</span>
          <SwitchBtn getSwitchVal={this.setSwitchVal.bind(this)} />
        </div>

        <div className={styles.submitBtn}>
          <button className={styles.formNextButton + " " + styles.btnDisabled}
                  onClick={this.handleSubmit.bind(this)} ref="refFormNextBtn">确认提交
          </button>
          <div className={styles.authorize}>
            <span className={styles.agree+" "+(isAgree?"":styles['un-agree'])} ref="refAgree">勾选</span>
            <span>我已阅读并同意</span>
            <p className={styles.protocol}>
              {
                this.state.contractData.map((item,index)=>{
                  return (
                    <a href="javascript:void(0)" key={index} onClick={this.handleContractClick.bind(this,item)}>《{item.contractName}》</a>
                  )
                })
              }
            </p>
          </div>
        </div>

      </section>
    )
  }
}


export default withRouter(Form);
