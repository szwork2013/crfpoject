import React from 'react';
import { Route, IndexRoute } from 'react-router';

import {
  App,
  Home,
  Success,
  ReBindCard,
  SupportCard,
  NotFoundPage,
} from './containers';

export default (
  <Route path="/" component={App}>
    <IndexRoute component={Home} />
    <Route path="success" component={Success} />
    <Route path="rebindcard" component={ReBindCard} />
    <Route path="supportcard" component={SupportCard} />
    <Route path="*" component={NotFoundPage} />
  </Route>
);
