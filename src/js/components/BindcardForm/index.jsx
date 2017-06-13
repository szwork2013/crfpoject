import React, { Component } from 'react';
import { withRouter } from 'react-router';
import styles from './index.scss';

import CityWrapper from './selectCity.jsx';

import SwitchBtn from './switchBtn.jsx';


class Form extends Component {
  constructor(props, context) {
    super(props, context);
    this.state={
      //selectCityEl:null,
    };
    this.cityCode='500';
    this.areaCode='6530';
  }

  componentDidMount(){
    /*setTimeout(()=>{
      this.state.selectCityEl.onclick=()=>{
        this.removeDisabled();
      };
    },80);*/
    doc.onclick=function(e){
      if(e.target.classList.contains('am-picker-popup-header-right')){
        doc.querySelector('.am-list-extra').classList.add('col323232');
        this.removeDisabled();
        console.log(this.cityCode,this.areaCode);
      }
    }.bind(this);

  }

  handleSubmit(e){
    if(e.target.classList.contains(styles.btnDisabled)){
      return;
    }
    if(this.refs.refBankCard.value===''){
      this.props.router.push('rebindcard');
      return;
    }
    this.props.router.push('success');
  }

  checkSupport(){
    this.props.router.push('supportcard');
  }

  bankNumInput(e){
    if(e.keyCode!=8){
      if(e.target.value.length>=8){
        /*clearTimeout(this.timer);
        this.timer = setTimeout(()=>{
        }, 1000);*/
        this.refs.refSupportCard.classList.remove('n');
        this.removeDisabled();
      }
    }
    if(e.target.value.length===0){
      this.refs.refBankError.classList.add('n');
      this.refs.refSupportCard.classList.add('n');
    }

  }

  telRegex(e){
    if(e.target.value.length===11&&!/^1[^7]\d{9}$/.test(e.target.value)){
      this.refs.refTelErrorMsg.classList.remove('n');
      this.removeDisabled();
    }else{
      if(!this.refs.refTelErrorMsg.classList.contains('n')){
        this.refs.refTelErrorMsg.classList.add('n');
      }
    }
  }

  removeDisabled(){
    if(this.refs.refBankCard.value!==''&&this.refs.refTelInput.value!==''&&doc.querySelector('.am-list-extra').innerHTML!=='开户行所在地'){
      this.refs.refFormNextBtn.classList.remove(styles.btnDisabled);
    }
  }

  setCitySelect(val){
    /*this.setState({
      cityCode:val[0],
      areaCode:val[1],
    });*/
    this.cityCode=val[0];
    this.areaCode=val[1];
    this.removeDisabled();

  }

  /*setElMethod(el){
    console.log(el);
    this.setState({
      selectCityEl:el
    });
  }*/

  render() {
    //let userName='*'+global.userName;
    let userName='*小斌';//mock

    return (
      <section>
        <div className={styles.infoForm}>
          <div className={styles.formInput}>
            <div className={styles.borderLine}>
              <input type="text" className={styles.userName} value={userName} disabled="disabled" />
            </div>
          </div>
          <div className={styles.formInput}>
            <div className={styles.borderLine}>
               <input type="text" className={styles.bankCard} placeholder="请输入银行卡号" onInput={this.bankNumInput.bind(this)} maxLength="23" ref="refBankCard" />
            </div>
            <div className={styles.errorInfo+" n"} ref="refSupportCard">
                暂不支持此卡, 请查看<a href="javascript:void(0);" onClick={this.checkSupport.bind(this)}>支持银行卡</a>
            </div>
            <div className={styles.errorInfo+" colFA4548 n"} ref="refBankError">您输入的银行卡号有误</div>
          </div>
          <div className={styles.formInput}>
            <div className={styles.borderLine}>
               <input type="text" className={styles.disabled+" "+styles.bank} value="银行" disabled="disabled" />
            </div>
          </div>
          <div className={styles.formInput}>
            <CityWrapper getSelectVal={this.setCitySelect.bind(this)}/>{/* getElMethod={this.setElMethod.bind(this)} */}
          </div>
        </div>

        <div className={styles.infoForm+" "+styles.telInput}>
          <input type="text" className={styles.infoInput+' '+styles.userPhone} placeholder="请输入该银行卡预留的手机号" onInput={this.telRegex.bind(this)} maxLength="11" ref="refTelInput" />
          <div className={styles.errorInfo+" colFA4548 n"} ref="refTelErrorMsg">请输入正确的手机号</div>
        </div>

        <div className={styles.infoForm}>
          <span className={styles.infoInput+' '+styles.repayBtn}>开通自动还款</span>
          <SwitchBtn />
        </div>

        <div className={styles.submitBtn}>
          <button className={styles.formNextButton+" "+styles.btnDisabled} onClick={this.handleSubmit.bind(this)} ref="refFormNextBtn">确认提交</button>
          <div className={styles.authorize}>
            <span className="agree">我已阅读并同意</span>
            <p className={styles.protocol}>
              <a href="javascript:void(0);">《网络交易资金账户三方协议》</a><a href="javascript:void(0);">《用户授权协议》</a>
            </p>
          </div>
        </div>

      </section>
    )
  }
}


export default withRouter(Form);
