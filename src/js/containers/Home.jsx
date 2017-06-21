import React, { Component } from 'react';
import { withRouter } from 'react-router';
import { Nav, BindcardForm, Loading } from 'app/components';
import { WhiteSpace } from 'antd-mobile';

class Home extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      loadingShowStatus:false
    };
  }

  componentDidMount() {

  }

  setLoading(status){
    this.setState({
      loadingShowStatus:status
    });
  }

  render() {
    let props = {title: '绑定银行卡', stage: 'home'};
    return (
      <section className="bind-card-wrap">
        <article>
          <Nav data={props} />
          {CONFIGS.showTopTips?<div className="topTips"><span>提交申请成功, 但未绑卡, 请先绑定银行卡。</span></div>:<WhiteSpace />}
          <BindcardForm setLoading={this.setLoading.bind(this)} />
        </article>
        <Loading show={this.state.loadingShowStatus} />
      </section>
    )
  }
}

export default withRouter(Home);
