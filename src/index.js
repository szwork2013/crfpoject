import {AppContainer as HotReloader} from 'react-hot-loader';
import React from 'react';
import {render} from 'react-dom';
import {browserHistory} from 'react-router';
import {default as App} from './js/index';
import RedBox from 'redbox-react';
require('./js/utils/device/index.es6');
import injectTapEventPlugin from 'react-tap-event-plugin';
injectTapEventPlugin();

global.CONFIGS = require('./js/config');
global.CRFFetch = require('./js/utils/ajax/index.es6');
global.HandleRegex = require('./js/utils/regex/index.es6');
global.cityDataVERSION='20170612';
global.bankDataVERSION='20170612';
global.doc=window.document;

if (typeof Object.assign !== 'function') {
  Object.assign = require('object-assign');
}

if (process.env.NODE_ENV === 'development') {
  const renderRoot = () => render(
    <HotReloader errorReporter={RedBox}>
      <App history={browserHistory}/>
    </HotReloader>,
    doc.getElementById('app')
  );
  renderRoot();
  if (module.hot) {module.hot.accept('./js/containers/index', renderRoot);}
} else {
  render(<App history={browserHistory}/>, doc.getElementById('app'));
}
