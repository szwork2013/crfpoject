import React from 'react';
import routes from './routes.jsx';
import {Router} from 'react-router';

import '../styles/normalize.scss';
import '../styles/app.scss';
import '../styles/antdStyleReset.scss';
import '../styles/global.scss';
import '../styles/bind-card.scss';
import '../styles/repay.scss';
import '../styles/confirm.scss';

const Root = ({ history }) => (
  <Router history={history} routes={routes} />
);

export default Root;
