import React, { Component } from 'react';
import { Toast } from 'antd-mobile';
import { Loading } from 'app/components';
import { hashHistory } from 'react-router';
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
  }

  getVerificationNum(e) {
    let status = this.refs.verificationNum.classList.contains('click-disable');
    this.refs.smsText && this.refs.smsText.classList.remove(styles.error);
    if (!status) {
      if(this.props.pathname&&this.props.pathname.indexOf('loanconfirm')>-1){
        CONFIGS.loanData.isAgree&&this.getVerification(0);
      }else{
        this.getVerification(0); //0 文本
      }
    }
  }

  sendSound() {
    this.refs.smsText && this.refs.smsText.classList.add('hide');
    this.refs.smsSoundTextMain && this.refs.smsSoundTextMain.classList.add('hide');
    this.refs.verificationNum && this.refs.verificationNum.classList.contains('click-disable');

    if(this.props.pathname&&this.props.pathname.indexOf('loanconfirm')>-1){
      CONFIGS.loanData.isAgree&&this.getVerification(1);
    }else{
      this.getVerification(1); // 1 声音
    }
  }

  countDown(code) {
    this.clearInput();
    let phoneNum = HandleRegex.hiddenMobile(CONFIGS.account.mobile);
    this.setState({inputVerification: `已发送短信到${phoneNum}的手机`});
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
    let path = `${CONFIGS.basePath}msg/${CONFIGS.account.mobile}`;
    let params = {
      intent: CONFIGS.type[CONFIGS.sendSmsType],
      phone: CONFIGS.account.mobile,
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
      let msgs = error.body;
      msgs.then((data) => {
        Toast.info(data.message);
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
        console.log(currentValue);
        if(this.props.pathname&&this.props.pathname.indexOf('loanconfirm')>-1){
          this.submitFetch();
        }else{
          this.submitLoan(currentValue);
        }
      }, 200);
    }
  }

  async submitFetch(){
    //https://m-ci.crfchina.com/h5_dubbo/loan?kissoId=370486f0d16742b38138f3dc1839efcb
    let loanPath = `${CONFIGS.loanPath}?kissoId=${CONFIGS.ssoId}`;
    let params = {
      "agreementGroup": CONFIGS.method.agreementGroup,
      "agreementName": CONFIGS.method.agreementName,
      "agreementVersion": CONFIGS.method.agreementVersion,
      "bankCardNo": CONFIGS.account.bankCardNo,
      "billTerm": 1,
      "code": this.refs.smsNum.value,
      "deviceType": "H5_24",
      "loanDays": CONFIGS.loanData.day,
      "loanNo": CONFIGS.method.loanNo,
      "productNo": "P2001002",
      "totalPrincipal": CONFIGS.loanData.amount
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

      result=result.json();
      result.then((data)=>{
        if (data && !data.response) {
          console.log(data.result);

          //hash
          hashHistory.push({
            pathname: path,
            query: {
              ssoId: CONFIGS.userId,
            },
            state: {
              contractNo: data.rcs_repay_no,
              cash: CONFIGS.method.repayTotalAmt,
              type: CONFIGS.sendSmsType,
              currentPath: 'loanconfirm',
            }
          });
        }
      });
    } catch (err) {
      CRFFetch.handleError(err,Toast,()=>{
        if(err.response.status==400){
          err.body.then(data => {
            Toast.info(data.message);
          });
        }
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
        repaymentAmount: CONFIGS.method.repayTotalAmt + CONFIGS.selectCoupon.offsetedCouponPrice,
        couponList: JSON.stringify(couponData)
      };
    } else {
      params = {
        code: this.refs.smsNum.value,
        deviceType: 'H5_24',
        repayChannel: 'FTS',
        repaymentAmount: CONFIGS.method.repayTotalAmt
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
              cash: CONFIGS.method.repayTotalAmt,
              type: CONFIGS.sendSmsType
            }
          });
        });
      }
    } catch (error) {
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
          <div className={`${styles.sendSmsText} hide`} ref="smsSoundTextMain">收不到验证码? 试试 <a onClick={this.sendSound}>语音验证</a></div>
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
