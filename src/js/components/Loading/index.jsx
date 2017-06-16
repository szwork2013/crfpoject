import React, { Component } from 'react';
import styles from './index.scss';

export default class Loading extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      show: props.show
    }
  }

  componentWillReceiveProps(nextProps) {
    this.setState({show: nextProps.show});
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
        <div className={styles.mask}>
          <div className={styles.loader}></div>
        </div>
      </div>
    );
  }
}
