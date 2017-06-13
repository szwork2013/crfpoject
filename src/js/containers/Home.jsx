import React, { Component } from 'react';
import { withRouter } from 'react-router';
import { Nav, BindcardForm } from 'app/components';

class Home extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {

    };
  }

  componentDidMount() {

  }

  render() {
    let props = {title: '绑定银行卡', stage: 'home'};
    return (
      <section className="wrap">
        <article>
          <Nav data={props} />
          <BindcardForm />
        </article>
      </section>
    )
  }
}

export default withRouter(Home);
