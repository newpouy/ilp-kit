/* globals Raven */

/**
 * THIS IS THE ENTRY POINT FOR THE CLIENT, JUST LIKE server.js IS THE ENTRY POINT FOR THE SERVER.
 */
import 'babel-polyfill'
import React from 'react'
import ReactDOM from 'react-dom'
import createStore from './redux/store'
import ApiClient from './helpers/ApiClient'
import io from 'socket.io-client'
import {Provider} from 'react-redux'
import { Router, browserHistory } from 'react-router'
import { ReduxAsyncConnect } from 'redux-async-connect'
import rga from 'react-ga'
global.rga = rga

import getRoutes from './routes'
const client = new ApiClient()

/* client.get('/config')
  .then((config) => {
    global.config = config

    // Remote log service
    Raven.config(config.sentryUri).install()
  }) */

const dest = document.getElementById('content')
const store = createStore(browserHistory, client, window.__data)

function initSocket() {
  return io('', {path: '/api/socket.io'})
}

global.socket = initSocket()

function logPageView() {
  rga.pageview(window.location.pathname)
}

const component = (
  <Router render={(props) =>
        <ReduxAsyncConnect {...props} helpers={{client}} filter={item => !item.deferred} />
      } history={browserHistory} onUpdate={logPageView}>
    {getRoutes(store)}
  </Router>
)

ReactDOM.render(
  <Provider store={store} key="provider">
    {component}
  </Provider>,
  dest
)

if (process.env.NODE_ENV !== 'production') {
  window.React = React // enable debugger

  if (!dest || !dest.firstChild || !dest.firstChild.attributes || !dest.firstChild.attributes['data-react-checksum']) {
    console.error('Server-side React render was discarded. Make sure that your initial render does not contain any client-side code.')
  }
}

// Google analytics
rga.initialize('UA-77001509-1')

if (__DEVTOOLS__ && !window.devToolsExtension) {
  const DevTools = require('./containers/DevTools/DevTools')
  ReactDOM.render(
    <Provider store={store} key="provider">
      <div>
        {component}
        <DevTools />
      </div>
    </Provider>,
    dest
  )
}
