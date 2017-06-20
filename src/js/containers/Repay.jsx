import React, { Component } from 'react';
import { Nav, Rulers, Present, Coupons } from 'app/components';
import { Toast, WhiteSpace } from 'antd-mobile';
import { connect } from 'react-redux';

class Repay extends Component {
  constructor(props){
    super(props);
    this.state = {
      title: '我要还款',
      data: [],
      presentNum: 0
    };
  }

  componentDidMount() {
    setTimeout(() => {
      let listData = [50, 100, 150, 100, 150, 200, 250, 300, 350, 400, 450, 500, 550, 600, 650, 700, 750, 800, 850, 900, 950, 1000, 1050, 1100, 1150, 1200, 1250, 1300, 1350, 1400, 1450, 1500, 1550, 1600, 1650, 1700, 1750, 1800, 1850, 1900, 1950, 2000, 2050];
      Object.assign(CONFIGS.rulerData, listData);
      this.setState({
        data: listData
      });
    }, 1000);
  }

  handleClick() {

  }

  render() {
    let props = { title: this.state.title};

    return (
      <div className="bindCardMain">
        <Nav data={props} />
        <WhiteSpace />
        <Rulers list={this.state.data} />
        <WhiteSpace />
        <Present list={this.state} />
        <Coupons />
        <footer>
          <button onClick={this.handleClick.bind(this)}>立即还款</button>
        </footer>
      </div>
    )
  }
}

export default Repay;
