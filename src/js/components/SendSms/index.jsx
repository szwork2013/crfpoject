import React, { Component } from 'react';
import { Toast } from 'antd-mobile';
import { Loading } from 'app/components';
import { hashHistory } from 'react-router';
import Numeral from 'numeral';
import styles from './index.scss';

export default class SendSms extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      inputVerification: '输入验证码',
      getVerification: '获取验证码',
      count: 0,
      timer: null,
      checkStatus: true,
      isRender: false,
      maxLength: 6,
      val: '',
      isLoading: false
    };
    this.sendFlag = true;
    this.getVerificationNum = this.getVerificationNum.bind(this);
    this.handleSendSMS = this.handleSendSMS.bind(this);
    this.sendSound = this.sendSound.bind(this);
    this.checkNumberLength = this.checkNumberLength.bind(this);
    this.reload = this.reload.bind(this);
  }

  reload() {
    window.location.reload();
  }

  getVerificationNum(e) {
    let status = this.refs.verificationNum.classList.contains('click-disable');
    this.refs.smsText && this.refs.smsText.classList.remove(styles.error);
    if (!status) {
      if(this.props.pathname && this.props.pathname.indexOf('loanconfirm')>-1){
        _paq.push(['trackEvent', 'C_LoanConfirm', 'E_LoanConfirm_sendMsg']);
        if(CONFIGS.loanData.isAgree){
          this.getVerification(0);
        }else{
          Toast.info('请勾选协议');
        }
      }else{
        _paq.push(['trackEvent', 'C_RepayConfirm', 'E_RepayConfirm_sendMsg']);
        this.getVerification(0); //0 文本
      }
    }
  }

  sendSound() {
    this.refs.smsText && this.refs.smsText.classList.add('hide');
    this.refs.smsSoundTextMain && this.refs.smsSoundTextMain.classList.add('hide');
    this.refs.verificationNum && this.refs.verificationNum.classList.contains('click-disable');

    if(this.props.pathname&&this.props.pathname.indexOf('loanconfirm')>-1){
      _paq.push(['trackEvent', 'C_LoanConfirm', 'E_LoanConfirm_sendMsgVoice']);
      CONFIGS.loanData.isAgree&&this.getVerification(1);
    }else{
      _paq.push(['trackEvent', 'C_RepayConfirm', 'E_RepayConfirm_sendMsgVoice']);
      this.getVerification(1); // 1 声音
    }
  }

  countDown(code) {
    this.clearInput();
    let phoneNum = HandleRegex.hiddenMobile(CONFIGS.user.phone);
    this.refs.smsText && this.refs.smsText.classList.remove('hide');
    this.setState({inputVerification: `已发送短信到您${phoneNum}的手机`});
    let time = 60;
    clearInterval(this.state.timer);
    this.setState({getVerification: time + 's'});
    this.refs.verificationNum && this.refs.verificationNum.classList.add('click-disable');
    if (code === 0) {
      this.refs.smsSoundTextSub && this.refs.smsSoundTextSub.classList.add('hide');
    } else {
      this.refs.smsText && this.refs.smsText.classList.add('hide');
    }
    this.state.timer = setInterval(() => {
      time --;
      if (time >= 0) {
        this.setState({getVerification: time + 's'});
      } else {
        this.showSound();
        this.clearTimer();
      }
    }, 1000);
  }

  showSound() {
    this.refs.smsText && this.refs.smsText.classList.add('hide');
    this.refs.smsSoundTextMain && this.refs.smsSoundTextMain.classList.remove('hide');
    this.refs.smsSoundTextSub && this.refs.smsSoundTextSub.classList.add('hide');
  }

  clearTimer() {
    clearInterval(this.state.timer);
    let count = this.state.count + 1;
    this.refs.verificationNum && this.refs.verificationNum.classList.remove('click-disable');
    this.setState({getVerification: '重新获取', count: count});
  }

  async getVerification(code) {
    this.setState({
      isLoading: true
    });
    let path = `${CONFIGS.basePath}msg/${CONFIGS.user.phone}`;
    let params = {
      intent: CONFIGS.type[CONFIGS.sendSmsType],
      phone: CONFIGS.user.phone,
      type: code
    };
    let headers = {
      'Content-Type': 'application/json'
    };
    try {
      let fetchPromise = CRFFetch.Put(path, JSON.stringify(params), headers);
      // 获取数据
      let result = await fetchPromise;
      if (result && !result.response) {
        this.setState({
          isLoading: false
        });
        this.countDown(code);
        this.setVerification(result, code);
      }
    } catch (error) {
      this.setState({
        isLoading: false
      });
      CRFFetch.handleError(error, Toast, () => {
        if (error.response.status === 400) {
          error.body.then(data => {
            code === 1 && this.showSound();
            Toast.info(data.message);
          });
        }
      });
    }
  }

  setVerification(result, code) {
    let count = this.state.count;
    switch (result.status) {
      case 200:
        if (code === 0) {
          this.refs.smsSoundTextSub && this.refs.smsSoundTextSub.classList.add('hide');
        } else {
          this.refs.smsSoundTextSub && this.refs.smsSoundTextSub.classList.remove('hide');
        }
        this.refs.smsText && this.refs.smsText.classList.remove(styles.error);
        this.refs.smsSoundTextMain && this.refs.smsSoundTextMain.classList.add('hide');
        break;
      case 400:
        this.setState({inputVerification: result.message});
        this.refs.smsText && this.refs.smsText.classList.add(styles.error);
        this.refs.smsText && this.refs.smsText.classList.remove('hide');
        this.refs.smsSoundTextMain && this.refs.smsSoundTextMain.classList.add('hide');
        this.refs.smsSoundTextSub && this.refs.smsSoundTextSub.classList.add('hide');
        break;
      case 500:
        Toast.info(result.message);
        break;
      default:
    }
  }

  setVerificationBySubmit(result) {
    let count = this.state.count;
    switch (result.status) {
      case 400:
        if (result.code === 'E_M_02') {
          this.setState({inputVerification: result.message});
          this.refs.smsText && this.refs.smsText.classList.add(styles.error);
        } else {
          Toast.info(result.message);
        }
        this.refs.smsText && this.refs.smsText.classList.remove('hide');
        this.refs.smsSoundTextMain && this.refs.smsSoundTextMain.classList.add('hide');
        this.refs.smsSoundTextSub && this.refs.smsSoundTextSub.classList.add('hide');
        break;
      case 401:
        CRFLogin.initialize(this.reload);
        break;
      case 500:
        Toast.info(result.message);
        break;
      default:
    }
  }

  clearInput() {
    this.setState({'val': ''});
    let maxLength = this.state.maxLength;
    let targetInputs = this.refs.smsInputTarget.children;
    for (let i = 0 ; i < maxLength; i++) {
      targetInputs[i].value = '';
    }
  }

  handleSendSMS() {
    let currentValue = this.refs.smsNum.value;
    if (!isNaN(currentValue)) {
      this.setState({'val': currentValue});
    }
    let maxLength = this.state.maxLength;
    let currentStr = currentValue.replace(/\D/g, '');
    let targetInputs = this.refs.smsInputTarget.children;
    for (let i = 0 ; i < maxLength; i++) {
      targetInputs[i].value = currentStr[i] ? currentStr[i] : '';
    }

    if (currentStr.length >= maxLength) {
      this.refs.smsNum.blur();
      currentValue = currentStr.substring(0, 6);
      setTimeout(() => {
        if(this.props.pathname && this.props.pathname.indexOf('loanconfirm')>-1){
          this.submitFetch();
        }else{
          this.submitLoan(currentValue);
        }
      }, 200);
    }
  }

  async submitFetch(){
    if (!this.sendFlag) return;
    this.sendFlag = false;
    this.setState({
      isLoading: true
    });

    //https://m-ci.crfchina.com/h5_dubbo/loan?kissoId=370486f0d16742b38138f3dc1839efcb
    let loanPath = `${CONFIGS.loanPath}?kissoId=${CONFIGS.ssoId}`;

    let params = {
      "agreementGroup": CONFIGS.method.agreementGroup,
      "agreementName": CONFIGS.method.agreementName,
      "agreementVersion": CONFIGS.method.agreementGroupVer,
      "bankCardNo": CONFIGS.account.bankCardNo,
      "billTerm": CONFIGS.loanData.period,//1、2、3还是M、D
      "code": this.refs.smsNum.value,
      "deviceType": "H5_24",
      "loanDays": CONFIGS.loanData.day,
      "loanNo": CONFIGS.method.loanNo,
      "productNo": "P2001002",
      "totalPrincipal": CONFIGS.loanData.amount,//传值的时候以 分 为单位
    };

    /*
    * {
     "agreementGroup": "p2p",
     "agreementName": "服务协议",
     "agreementVersion": "2.0.2",
     "bankCardNo": "6216612600003455182",
     "billTerm": 1,//分期
     "code": "string",
     "deviceType": "H5_24",//固定
     "loanDays": 0,
     "loanNo": "string",
     "productNo": "p2001002",
     "totalPrincipal": 0
     }
     * */

    let headers = {
      'Content-Type': 'application/json'
    };
    try {
      let fetchPromise = CRFFetch.Put(loanPath, JSON.stringify(params), headers);
      // 获取数据
      let result = await fetchPromise;
      let path = 'result';

      this.sendFlag = true;
      this.setState({
        isLoading: false
      });

      result=result.json();
      result.then((data)=>{
        if (data && !data.response) {
          //hash
          hashHistory.push({
            pathname: path,
            query: {
              ssoId: CONFIGS.userId,
              contractNo: data.loanNo,
              type: CONFIGS.sendSmsType,
              source: 'loan'
            },
            state: {
              currentPath: 'loanconfirm',
            }
          });
        }
      });
    } catch (error) {
      /*this.clearInput();

      CRFFetch.handleError(err,Toast,()=>{
        if(err.response.status==400){
          err.body.then(data => {
            Toast.info(data.message);
          });
        }
      });*/
      this.clearInput();
      this.sendFlag = true;
      this.setState({
        isLoading: false
      });
      let errorStatus = {
        status: error.response.status
      };
      let msg = error.body;
      msg.then((data) => {
        let res = Object.assign(data, errorStatus);
        this.setVerificationBySubmit(res);
      });
    }
  }

  async submitLoan(value) {
    if (!this.sendFlag) return;
    this.sendFlag = false;
    this.setState({
      isLoading: true
    });
    let path = `${CONFIGS.repayPath}?kissoId=${CONFIGS.userId}`;
    let params = null;
    if (CONFIGS.selectCoupon) {
      let couponData = [{
        amt_type: 1,
        coupon_id: CONFIGS.selectCoupon.id,
        coupon_price: CONFIGS.selectCoupon.originAmount
      }];
      params = {
        code: this.refs.smsNum.value,
        deviceType: 'H5_24',
        repayChannel: 'FTS',
        repaymentAmount: Numeral(CONFIGS.realAmount).multiply(100).value() + CONFIGS.selectCoupon.offsetedCouponPrice,
        couponList: JSON.stringify(couponData)
      };
    } else {
      params = {
        code: this.refs.smsNum.value,
        deviceType: 'H5_24',
        repayChannel: 'FTS',
        repaymentAmount: Numeral(CONFIGS.realAmount).multiply(100).value()
      };
    }

    let headers = {
      'Content-Type': 'application/json'
    };
    try {
      let fetchPromise = CRFFetch.Put(path, JSON.stringify(params), headers);
      // 获取数据
      let result = await fetchPromise;
      if (result && !result.response) {
        _paq.push(['trackEvent', 'C_Repay', 'E_SubmitRepay', '确认还款']);
        this.sendFlag = true;
        this.setState({
          isLoading: false
        });
        let path = 'result';
        let res = result.json();

        res.then((data) => {
          hashHistory.push({
            pathname: path,
            query: {
              ssoId: CONFIGS.userId,
              contractNo: data.rcs_repay_no,
              type: CONFIGS.sendSmsType
            }
          });
        });
      }
    } catch (error) {
      this.clearInput();
      this.sendFlag = true;
      this.setState({
        isLoading: false
      });
      let errorStatus = {
        status: error.response.status
      };
      let msgs = error.body;
      let status = error.response.status;
      msgs.then((data) => {
        let res = Object.assign(data, errorStatus);
        this.setVerificationBySubmit(res);
      });
    }
  }

  checkNumberLength(e) {
    let currentValue = this.refs.smsNum.value;
    if (currentValue.length > 6) {
      this.refs.smsNum.value = this.refs.smsNum.value.substr(0, 6);
    }
  }

  render() {
    let { inputVerification, getVerification, checkStatus, count, isLoading } = this.state;
    return (
      <section className={styles.root}>
        <div className={`${styles.sendSmsContainer} hor`}>
          <div className={styles.sendSmsText} ref="smsText">{inputVerification}</div>
          <div className={`${styles.sendSmsText} hide`} ref="smsSoundTextMain">收不到? 请尝试 <a onClick={this.sendSound}>语音验证码</a></div>
          <div className={`${styles.sendSmsText} hide`} ref="smsSoundTextSub">验证电话即将发出, <span>请注意接听</span></div>
          <div className={styles.sendSmsAction}>
            <a ref="verificationNum" onClick={this.getVerificationNum}>{getVerification}</a>
          </div>
        </div>
        <div className={styles.sendSmsInput}>
          <input className={styles.originInput} defaultValue="" readonly unselectable="on" value={this.state.val} ref="smsNum" type="tel" maxLength="6" onChange={this.handleSendSMS} />
          <div className={styles.targetInput} ref="smsInputTarget">
            <input type="number" disabled />
            <input type="number" disabled />
            <input type="number" disabled />
            <input type="number" disabled />
            <input type="number" disabled />
            <input type="number" disabled />
          </div>
        </div>
        <Loading show={isLoading} />
      </section>
    );
  }
}
