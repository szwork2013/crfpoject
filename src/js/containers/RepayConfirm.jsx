import React, { Component } from 'react';
import { Nav } from 'app/components';
import { Toast, WhiteSpace } from 'antd-mobile';
import { hashHistory } from 'react-router';

class RepayConfirm extends Component {
  constructor(props){
    super(props);
    this.state = {
      title: '还款确认'
    };
  }

  componentDidMount() {
    // setTimeout(() => {
    //   let listData = [50, 100, 150, 100, 150, 200, 250, 300, 350, 400, 450, 500, 550, 600, 650, 700, 750, 800, 850, 900, 950, 1000, 1050, 1100, 1150, 1200, 1250, 1300, 1350, 1400, 1450, 1500, 1550, 1600, 1650, 1700, 1750, 1800, 1850, 1900, 1950, 2000, 2050];
    //   Object.assign(CONFIGS.rulerData, listData);
    //   this.setState({
    //     data: listData
    //   });
    // }, 1000);
  }

  render() {
    let props = { title: this.state.title};

    return (
      <div className="bindCardMain">
        <Nav data={props} />
        <WhiteSpace />
      </div>
    )
  }
}

export default RepayConfirm;
