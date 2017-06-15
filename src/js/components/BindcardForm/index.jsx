import React, {Component} from 'react';
import {withRouter} from 'react-router';
import styles from './index.scss';

import CityWrapper from './selectCity.jsx';

import SwitchBtn from './switchBtn.jsx';


class Form extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      //selectCityEl:null,
      cardBinData:null
    };
    this.cityCode = '500';
    this.areaCode = '6530';
  }

  componentWillMount() {
    this.requireJson();
  }

  componentDidMount() {
    /*setTimeout(()=>{
     this.state.selectCityEl.onclick=()=>{
     this.removeDisabled();
     };
     },80);*/
    doc.onclick = function (e) {
      if (e.target.classList.contains('am-picker-popup-header-right')) {
        doc.querySelector('.am-list-extra').classList.add('col323232');
        this.removeDisabled();
        console.log(this.cityCode, this.areaCode);
      }
    }.bind(this);

  }

  sendBindCardFetch() {

  }

  checkCardFetch(val) {
    if (val !== '6214837552082046') {
      this.refs.refSupportCard.classList.add('n');
      this.refs.refBankError.classList.remove('n');
    } else {
      this.removeDisabled();
    }

  }

  handleSubmit(e) {

    if (e.target.classList.contains(styles.btnDisabled)) {
      return;
    }

    this.sendBindCardFetch();

    if (this.refs.refBankCard.value === '') {
      this.props.router.push('rebindcard');
      return;
    }
    this.props.router.push('success');
  }

  checkSupport() {
    this.props.router.push('supportcard');
  }

  bankNumInput(e) {
    let timer = null;

    let refBankName = this.refs.refBankName;
    let refBankError = this.refs.refBankError;
    let refSupportCard = this.refs.refSupportCard;

    let currentVal = e.target.value;
    let cardBindArr = this.state.cardBinData;

    let notCardNum=true;

    if (e.keyCode != 8) {
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
        clearTimeout(timer);
        timer = setTimeout(()=> {
          this.checkCardFetch(currentVal);
        }, 1500);
      }
    }
    if (e.target.value.length === 0) {
      clearTimeout(timer);
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
    if (this.refs.refBankCard.value !== '' && this.refs.refTelInput.value !== '' && doc.querySelector('.am-list-extra').innerHTML !== '开户行所在地') {
      this.refs.refFormNextBtn.classList.remove(styles.btnDisabled);
    }
  }

  setCitySelect(val) {
    /*this.setState({
     cityCode:val[0],
     areaCode:val[1],
     });*/
    this.cityCode = val[0];
    this.areaCode = val[1];
    this.removeDisabled();

  }

  requireJson() {
    let storageName = 'cardBinData';
    let version = 'cardBinVersion';

    let allData = JSON.parse(localStorage.getItem('CRF_' + storageName));

    if ((!allData) || cardBinVERSION != localStorage.getItem('CRF_' + version)) {
      require.ensure([], (require)=> {
        let data = require('../../../json/cardBin.json');
        localStorage.setItem('CRF_' + storageName, JSON.stringify(data));
        this.setState({
          cardBinData: data
        });
      });
      localStorage.setItem('CRF_' + version, cardBinVERSION);
      console.log('发了请求');
    } else {
      this.setState({
        cardBinData: allData
      });
      console.log('没发请求,使用本地localstorage');
    }
  }

  /*setElMethod(el){
   console.log(el);
   this.setState({
   selectCityEl:el
   });
   }*/

  render() {
    //let userName='*'+global.userName;
    let userName = '*小斌';//mock

    return (
      <section>
        <div className={styles.infoForm}>
          <div className={styles.formInput}>
            <div className={styles.borderLine}>
              <input type="text" className={styles.userName} value={userName} disabled="disabled"/>
            </div>
          </div>
          <div className={styles.formInput}>
            <div className={styles.borderLine}>
              <input type="text" className={styles.bankCard} placeholder="请输入银行卡号"
                     onInput={this.bankNumInput.bind(this)} maxLength="23" ref="refBankCard"/>
            </div>
            <div className={styles.errorInfo + " n"} ref="refSupportCard">
              暂不支持此卡, 请查看<a href="javascript:void(0);" onClick={this.checkSupport.bind(this)}>支持银行卡</a>
            </div>
            <div className={styles.errorInfo + " colFA4548 n"} ref="refBankError">您输入的银行卡号有误</div>
          </div>
          <div className={styles.formInput}>
            <div className={styles.borderLine}>
              <input type="text" className={styles.disabled + " " + styles.bank} value="银行"
                     disabled="disabled" ref="refBankName"/>
            </div>
          </div>
          <div className={styles.formInput}>
            <CityWrapper
              getSelectVal={this.setCitySelect.bind(this)}/>{/* getElMethod={this.setElMethod.bind(this)} */}
          </div>
        </div>

        <div className={styles.infoForm + " " + styles.telInput}>
          <input type="text" className={styles.infoInput + ' ' + styles.userPhone} placeholder="请输入该银行卡预留的手机号"
                 onInput={this.telRegex.bind(this)} maxLength="11" ref="refTelInput"/>
          <div className={styles.errorInfo + " colFA4548 n"} ref="refTelErrorMsg">请输入正确的手机号</div>
        </div>

        <div className={styles.infoForm}>
          <span className={styles.infoInput + ' ' + styles.repayBtn}>开通自动还款</span>
          <SwitchBtn />
        </div>

        <div className={styles.submitBtn}>
          <button className={styles.formNextButton + " " + styles.btnDisabled}
                  onClick={this.handleSubmit.bind(this)} ref="refFormNextBtn">确认提交
          </button>
          <div className={styles.authorize}>
            <span className="agree">我已阅读并同意</span>
            <p className={styles.protocol}>
              <a href={location.origin+"/tripartite_agreement.html"}>《网络交易资金账户三方协议》</a><a href={location.origin+"/userLicense_agreement.html"}>《用户授权协议》</a>
            </p>
          </div>
        </div>

      </section>
    )
  }
}


export default withRouter(Form);
