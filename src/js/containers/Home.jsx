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
          {CONFIGS.isWeChat?'':<Nav data={props} />}
          <WhiteSpace />
          <BindcardForm setLoading={this.setLoading.bind(this)} />
        </article>
        <Loading show={this.state.loadingShowStatus} />
      </section>
    )
  }
}

export default withRouter(Home);
