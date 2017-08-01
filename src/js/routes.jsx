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
  LoanConfirm,
  RepayConfirm,
  Result,
  Channel,
  Bill,
  Index,
  Detail,
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
    <Route path="loanconfirm" component={LoanConfirm} />
    <Route path="repayconfirm" component={RepayConfirm} />
    <Route path="result" component={Result} />
    <Route path="channel" component={Channel} />
    <Route path="bill" component={Bill} />
    <Route path="index" component={Index} />
    <Route path="contract" component={Contract} />
    <Route path="detail" component={Detail} />
    <Route path="*" component={NotFoundPage} />
  </Route>
);
