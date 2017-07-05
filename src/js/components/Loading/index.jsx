import React, { Component } from 'react';
import styles from './index.scss';

export default class Loading extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      show: props.show,
      maskHeight:{},
    }
    this.show = this.show.bind(this);
    this.hide = this.hide.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    this.setState({show: nextProps.show});
  }

  componentDidMount(){
    let topHeight=0;

    if(!Common.isWeChat()){
      topHeight=doc.querySelector('nav').offsetHeight+doc.querySelector('.am-whitespace').offsetHeight;
    }

    this.setState({
      maskHeight:{height:doc.documentElement.clientHeight-topHeight+'px'}
    });
  }

  show() {
    this.setState({show: true});
  }

  hide() {
    this.setState({show: false});
  }

  render() {
    const show = this.state.show;
    let showStyle = '';

    if (show) {
      showStyle = styles.root;
    } else {
      showStyle = styles.hide;
    }
    return (
      <div className={showStyle}>
        <div className={styles.mask} style={this.state.maskHeight}>
          <div className={styles.loader}></div>
        </div>
      </div>
    );
  }
}
