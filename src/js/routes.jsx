import React from 'react';
import { Route, IndexRoute } from 'react-router';

import {
  App,
  Home,
  Success,
  ReBindCard,
  SupportCard,
  Repay,
  Contract,
  RepayConfirm,
  Result,
  NotFoundPage,
} from './containers';

export default (
  <Route path="/" component={App}>
    <IndexRoute component={Home} />
    <Route path="success" component={Success} />
    <Route path="rebindcard" component={ReBindCard} />
    <Route path="supportcard" component={SupportCard} />
    <Route path="repay" component={Repay} />
    <Route path="repayconfirm" component={RepayConfirm} />
    <Route path="result" component={Result} />
    <Route path="contract" component={Contract} />
    <Route path="*" component={NotFoundPage} />
  </Route>
);
