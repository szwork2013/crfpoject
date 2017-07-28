import React, { Component } from 'react';
import { withRouter } from 'react-router';
import { Nav, BillList, Loading, BillNotice } from 'app/components';
import { WhiteSpace, Tabs } from 'antd-mobile';
const TabPane = Tabs.TabPane;

class Bill extends Component {
  constructor(props) {
    super(props);
    this.state = {
      title: '借还款记录',
      type: 'repay'
    }
  }

  componentDidMount() {
    _paq.push(['trackEvent', 'C_Page', 'E_P_Bill']);
  }

  callback = (key) => {
    //console.log('onChange', key);
  }

  handleTabClick = (key) => {
    if (key === '1') {
      this.setState({
        type: 'loan'
      });
    } else {
      this.setState({
        type: 'repay'
      });
    }
  }

  render() {
    const props = {title: this.state.title, stage: ''};
    let {type} = this.state,
        billListByLoan = null,
        billListByRepay = null;
        if (type === 'repay') {
          billListByRepay = <BillList type={type} />
        } else {
          billListByLoan = <BillList type={type} />
        }
    return (
      <section>
        <Loading />
        <Nav data={props} />
        <WhiteSpace />
        <Tabs defaultActiveKey="2" animated={false} onChange={this.callback} onTabClick={this.handleTabClick}>
          <TabPane tab="借款" key="1">
            <WhiteSpace />
            <BillNotice type={type} />
            {billListByLoan}
          </TabPane>
          <TabPane tab="还款" key="2">
            <WhiteSpace />
            {billListByRepay}
          </TabPane>
        </Tabs>
      </section>
    );
  }
}

export default withRouter(Bill);
