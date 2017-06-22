import React, { Component } from 'react';
import styles from './index.scss';

export default class RepayDetail extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      fees: props.data,
      data: {}
    };
  }

  componentWillReceiveProps(nextProps) {
    //this.setState({fees: nextProps.data});
    if (nextProps.data !== this.state.fees) {

    }
  }

  componentDidUpdate() {

  }

  render() {
    return (
      <div className={styles.root}>

      </div>
    );
  }
}
