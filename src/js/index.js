import React from 'react';
//import { Provider } from 'react-redux';
import routes from './routes';
import { Router } from 'react-router';

import '../styles/normalize.scss';
import '../styles/antdStyleReset.scss';
import '../styles/app.scss';
/*
const Root = ({ store, history }) => (
  <Provider store={store}>
    <Router history={history} routes={routes} />
  </Provider>
);*/
const Root = ({ history }) => (
  <Router history={history} routes={routes} />
);

export default Root;
