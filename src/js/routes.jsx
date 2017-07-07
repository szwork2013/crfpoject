import React from 'react';
import { Route, IndexRoute } from 'react-router';

import {
  App,
  Home,
  Success,
  ReBindCard,
  SupportCard,
  Repay,
  Loan,
  Contract,
  RepayConfirm,
  Result,
  Channel,
  NotFoundPage,
} from './containers';

export default (
  <Route path="/" component={App}>
    <IndexRoute component={Home} />
    <Route path="success" component={Success} />
    <Route path="rebindcard" component={ReBindCard} />
    <Route path="supportcard" component={SupportCard} />
    <Route path="repay" component={Repay} />
    <Route path="loan" component={Loan} />
    <Route path="repayconfirm" component={RepayConfirm} />
    <Route path="result" component={Result} />
    <Route path="channel" component={Channel} />
    <Route path="contract" component={Contract} />
    <Route path="*" component={NotFoundPage} />
  </Route>
);
