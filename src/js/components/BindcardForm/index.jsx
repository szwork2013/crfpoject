import React, {Component} from 'react';
import {withRouter} from 'react-router';
import styles from './index.scss';

import {Toast} from 'antd-mobile';

import CityWrapper from './selectCity.jsx';
import SwitchBtn from './switchBtn.jsx';


class Form extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      cardBinData:null,
      contractData:[
        {contractName:'网络交易资金账号三方协议',contractUrl:location.origin+'tripartite_agreement.html'},
        {contractName:'第三方协议',contractUrl:location.origin+'userLicense_agreement.html'}
      ],
      userName:'',
    };
    //this.cityCode = '500';
    this.areaCode = '6530';
    this.timer = null;
    this.switchStatus=true;
    this.bankCode='';
  }

  componentWillMount() {
    this.getUserInfo();
    this.requireJson();
    this.getContractFetch();
  }

  componentDidMount() {

    this.bindEvent();

  }

  async getUserInfo(){
    let getContractUrl=CONFIGS.basePath+'api/user?kissoId='+CONFIGS.ssoId;

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
        Toast.info('用户kissoID不存在');
        return;
      }
      CRFFetch.handleError(err,()=>{
        //Toast.loading('cuowule',10000);
        //Toast.info('cuowule',10000);
        if(status==400){
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

        if(status==400){
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
    let word32=this.random32word();
    let submitFetchUrl=CONFIGS.basePath+'fts/borrower_open_account?kissoId='+CONFIGS.ssoId;
    let bankNumber=this.refs.refBankCard.value.replace(/\s/g,'');
    CONFIGS.bankNum=bankNumber;
    let params = {
      'autoDeduct': this.switchStatus,//代扣
      'bankCardNo': bankNumber,//银行卡号
      'bankCode': this.bankCode,
      'businessType': 'rcs',//业务类型
      'cityId': this.areaCode,//城市代码
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
      // 获取数据
      let result = await fetchPromise;

      this.props.setLoading(true);
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
              this.props.setLoading(false);
              this.props.router.push('success');//绑卡成功
              break;
            case 'FAIL':
              this.props.setLoading(false);
              this.props.router.push('rebindcard');
              break;
          }
        }
      }).then((err)=>{
        CRFFetch.handleError(err,()=>{

          if(status==400){
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

        if(status==400){
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

        if(status==400){
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
    let checkCardUrl = CONFIGS.basePath+'fcp/cardInfo/'+cardNo;

    let refBankName = this.refs.refBankName;
    let refSupportCard = this.refs.refSupportCard;
    let refBankError = this.refs.refBankError;

    try {

      let fetchPromise = CRFFetch.Get(checkCardUrl);
      // 获取数据
      let result = await fetchPromise;

      if (result && !result.response) {

        refBankName.value=result.bankName||'银行';
        CONFIGS.bankName=result.bankName||'银行';

        this.bankCode=result.bankCode;

        if(result.prcptcd==='1'){
          if(result.bankCode===null){
            //卡号错误
            //refBankName.value = '银行';//所属银行名字变回‘银行’
            refBankName.classList.add(styles.disabled);//所属银行字体变灰
            refSupportCard.classList.add('n');//隐藏支持银行div
            refBankError.classList.remove('n');//提示银行卡号错误

          }else{
            //卡号不支持
            refBankError.classList.add('n');//隐藏银行卡号错误
            refSupportCard.classList.remove('n');//显示支持银行div
          }
        }else if(result.prcptcd==='0'){
          refBankError.classList.add('n');//隐藏银行卡号错误
          refSupportCard.classList.add('n');//隐藏支持银行div
          this.removeDisabled();
        }

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
      CRFFetch.handleError(err,()=>{

        if(status==400){
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

  bindEvent(){
    const amListExtra=doc.querySelector('.am-list-extra');
    doc.onclick = function (e) {
      if (e.target.classList.contains('am-picker-popup-header-right')) {
        amListExtra.classList.add('color-323232');
        amListExtra.innerHTML=amListExtra.innerHTML.replace(/,/g,'&nbsp;');
        this.removeDisabled();
      }
    }.bind(this);

    const refAgree=this.refs.refAgree;
    refAgree.onclick=()=>{
      refAgree.classList.toggle(styles['un-agree']);
      this.removeDisabled();
    };

  }

  handleSubmit(e) {

    if (e.target.classList.contains(styles.btnDisabled)) {
      return;
    }

    this.sendBindCardFetch();
  }

  checkSupport() {
    this.props.router.push('supportcard');
  }

  bankNumInput(e) {
    let refBankName = this.refs.refBankName;
    let refBankError = this.refs.refBankError;
    let refSupportCard = this.refs.refSupportCard;

    let currentVal = e.target.value.replace(/\D/g,'');
    let cardBindArr = this.state.cardBinData;

    let notCardNum=true;

    if (e.keyCode != 8) {
      this.refs.refBankCard.value=currentVal.replace(/(\d{4})/g, '$1 ');
      if (currentVal.length === 6) {

        for(let i=0;i<cardBindArr.length;i++){
          if(currentVal==cardBindArr[i][0]){
            refBankName.value=cardBindArr[i][2];
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
    if (e.target.value.length === 0) {
      clearTimeout(this.timer);
      refBankError.classList.add('n');//隐藏银行卡错误提示
      refSupportCard.classList.add('n');//隐藏支持银行div

      refBankName.value = '银行';//所属银行名字变回‘银行’
      refBankName.classList.add(styles.disabled);//所属银行字体变灰
    }
  }

  telRegex(e) {
    let refTelErrorMsg=this.refs.refTelErrorMsg;
    let refFormNextBtn=this.refs.refFormNextBtn;
    if (e.target.value.length === 11) {
      if (/^1[^7]\d{9}$/.test(e.target.value)) {
        this.removeDisabled();
        if (!refTelErrorMsg.classList.contains('n')) {
          refTelErrorMsg.classList.add('n');//隐藏手机号错误提示
        }
      } else {
        refFormNextBtn.classList.add(styles.btnDisabled);//提交按钮置灰
        refTelErrorMsg.classList.remove('n');//显示手机号错误提示
      }
    } else {
      refFormNextBtn.classList.add(styles.btnDisabled);//提交按钮置灰
      refTelErrorMsg.classList.add('n');//隐藏手机号错误提示
    }
  }

  removeDisabled() {
    if (this.refs.refBankCard.value !== '' && this.refs.refTelInput.value !== '' && doc.querySelector('.am-list-extra').innerHTML !== '开户行所在地'&&(!this.refs.refAgree.classList.contains(styles['un-agree']))) {
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
    this.areaCode = val[1];
    this.removeDisabled();

  }

  handleContractClick(item){
    CONFIGS.contractName=item.contractName;
    CONFIGS.contractUrl=item.contractUrl;
    this.props.router.push('contract');
  }

  setSwitchVal(val){
    this.switchStatus=val;
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

    if ((!allData) || VERSION.cardBinVERSION != localStorage.getItem('CRF_' + version)) {
      require.ensure([], (require)=> {
        let data = require('../../../json/cardBin.json');
        localStorage.setItem('CRF_' + storageName, JSON.stringify(data));
        this.setState({
          cardBinData: data
        });
      });
      localStorage.setItem('CRF_' + version, VERSION.cardBinVERSION);

    } else {
      this.setState({
        cardBinData: allData
      });

    }
  }

  render() {
    //let userName='*'+global.userName;
    let userName = '*'+this.state.userName.substring(1);

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
              <input type="text" className={styles.bankCard} placeholder="请输入银行卡号"
                     onKeyUp={this.bankNumInput.bind(this)} maxLength="23" ref="refBankCard"/>
            </div>
            <div className={styles.errorInfo + " n"} ref="refSupportCard">
              暂不支持此卡, 请查看<a href="javascript:void(0);" onClick={this.checkSupport.bind(this)}>支持银行卡</a>
            </div>
            <div className={styles.errorInfo + " color-FA4548 n"} ref="refBankError">您输入的银行卡号有误</div>
          </div>
          <div className={styles.formInput}>
            <div className={styles.borderLine}>
              <input type="button" className={styles.disabled + " " + styles.bank} value="银行" ref="refBankName"/>
            </div>
          </div>
          <div className={styles.formInput}>
            <CityWrapper getSelectVal={this.setCitySelect.bind(this)}/>
          </div>
        </div>

        <div className={styles.infoForm + " " + styles.telInput}>
          <input type="text" className={styles.infoInput + ' ' + styles.userPhone} placeholder="请输入该银行卡预留的手机号"
                 onInput={this.telRegex.bind(this)} maxLength="11" ref="refTelInput"/>
          <div className={styles.errorInfo + " color-FA4548 n"} ref="refTelErrorMsg">请输入正确的手机号</div>
        </div>

        <div className={styles.infoForm}>
          <span className={styles.infoInput + ' ' + styles.repayBtn}>开通自动还款</span>
          <SwitchBtn getSwitchVal={this.setSwitchVal.bind(this)} />
        </div>

        <div className={styles.submitBtn}>
          <button className={styles.formNextButton + " " + styles.btnDisabled}
                  onClick={this.handleSubmit.bind(this)} ref="refFormNextBtn">确认提交
          </button>
          <div className={styles.authorize}>
            <span className={styles.agree} ref="refAgree">勾选</span>
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
