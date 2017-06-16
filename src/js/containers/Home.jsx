import React, { Component } from 'react';
import { withRouter } from 'react-router';
import { Nav, BindcardForm, Loading } from 'app/components';

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
      <section className="wrap">
        <article>
          {CONFIGS.isWeChat?'':<Nav data={props} />}
          <BindcardForm setLoading={this.setLoading.bind(this)} />
        </article>
        <Loading show={this.state.loadingShowStatus} />
      </section>
    )
  }
}

export default withRouter(Home);
