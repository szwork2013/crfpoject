import React, {Component} from 'react';
import styles from './index.scss';

class WritePhone extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
    };
  }

  componentDidMount() {

    const refTelInput=this.refs.refTelInput;
    const refPhoneClear=this.refs.refPhoneClear;

    this.props.getWritePhoneEle(refTelInput);

    //输入手机号码
    refTelInput.oninput=()=>{
      if(refTelInput.value.length>0){
        refPhoneClear.classList.remove('n');
      }else{
        refPhoneClear.classList.add('n');
      }
    };

    refTelInput.onblur=()=>{
      setTimeout(()=>{//解决与click冲突问题
        refPhoneClear.classList.add('n');
      },80);
    };

    refTelInput.onfocus=()=>{
      if(refTelInput.value.length>0){
        refPhoneClear.classList.remove('n');
      }
    };

    refPhoneClear.onclick=()=>{
      refTelInput.value='';
      refPhoneClear.classList.add('n');

      this.refs.refTelErrorMsg.classList.add('n');//隐藏手机号错误提示
    };
  }

  telRegex(e) {
    let refTelErrorMsg=this.refs.refTelErrorMsg;

    let currentVal=e.target.value;
    CONFIGS.bindCard.phoneNum=currentVal;

    if (currentVal.length === 11) {
      if (CONFIGS.userWritePhoneRegx.test(e.target.value)) {
        CONFIGS.bindCard.phoneNumStatus=true;
        this.props.removeDisabled();
        if (!refTelErrorMsg.classList.contains('n')) {
          refTelErrorMsg.classList.add('n');//隐藏手机号错误提示
        }
      } else {
        CONFIGS.bindCard.phoneNumStatus=false;
        this.props.removeDisabled();
        refTelErrorMsg.classList.remove('n');//显示手机号错误提示
      }
    } else {
      CONFIGS.bindCard.phoneNumStatus=false;
      this.props.removeDisabled();
      refTelErrorMsg.classList.add('n');//隐藏手机号错误提示
    }
  }

  render() {

    return (
      <div className={styles.infoForm + " subInfoForm " + styles.telInput}>
        <input type="tel" className={styles.infoInput + ' ' + styles.userPhone} placeholder="请输入该银行卡预留的手机号"
               onInput={this.telRegex.bind(this)} defaultValue={CONFIGS.bindCard.phoneNum} maxLength="11" ref="refTelInput"/>
        <div className={styles.errorInfo + " color-FA4548 n"} ref="refTelErrorMsg">请输入正确的手机号</div>
        <div className="telInput clearVal n" ref="refPhoneClear"><div className="clearInput"><span className="closeBtn">x</span></div></div>
      </div>
    );
  }
}


export default WritePhone;