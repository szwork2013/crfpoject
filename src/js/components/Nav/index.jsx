import React, { Component } from 'react';
import { browserHistory } from 'react-router';
import styles from './index.scss';

export default class Nav extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      title: this.props.data.title,
      stage: this.props.data.stage,
      from: this.props.data.from,
      isApp: this.props.data.isApp
    };
    this.handleBack = this.handleBack.bind(this);
    this.handleGoHome = this.handleGoHome.bind(this);
  }

  handleBack() {
    if(this.state.stage === 'home') {
      window.location = 'crfxjd://consumptionLoanHome';
    } else {
      if (this.state.isApp === 'crfapp') {
        window.location = 'crfxjd://closeWindow';
      } else {
        browserHistory.goBack();
      }
    }
  }

  handleGoHome() {
    let path = '/?ssoId=' + CONFIGS.userId;
    browserHistory.push(path);
  }

  render() {
    let { stage, title,  from} = this.state;
    let rootClass = '';
    if (stage === 'home') {
      rootClass = styles.root;
    } else {
      rootClass = styles.child;
    }

    let leftEle = null;
    if (from === 'loan') { //from loan show finish
      leftEle = <span className={styles.dark} onClick={this.handleGoHome}>完成</span>
    } else {
      leftEle = <span className={styles.navbarLeftIcon} onTouchTap={this.handleBack}></span>;
      //if(contractNo) title = CONFIGS.billType[type] + '动态';
    }
    return (
      <nav className={rootClass}>
        <div className={styles.navbarLeft}>
          {leftEle}
        </div>
        <div className={styles.navbarTitle}>{title}</div>
      </nav>
    )
  }
}
