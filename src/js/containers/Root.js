import React from 'react';
//import { Provider } from 'react-redux';
import routes from '../routes';
import { Router } from 'react-router';
import '../../styles/normalize.scss';
import '../../styles/app.scss';
import 'moment/locale/zh-cn';

/*
const Root = ({ history }) => (
  <Provider>
    <Router history={history} routes={routes} />
  </Provider>
);*/
const Root = ({ history }) => (
  <Router history={history} routes={routes} />
);

export default Root;
