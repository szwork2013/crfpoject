/*import 'es6-promise/auto';
import 'whatwg-fetch';*/
require('es6-promise/auto');
require('whatwg-fetch');

function checkStatus(response) {
  if (response.status >= 200 && response.status < 300) {
    return response;
  } else {
    let error = new Error(response.statusText)
    error.response = response;
    error.body = response.json();
    throw error;
  }
}

function returnResponse(response) {
  return response;
}

function parseJSON(response) {
  return response.json();
}

const FetchInterface = {
  // do get
  Get(url: string, httpHeaders?: { [name: string]: any }) {
    let customHttpHeaders = Object.assign({}, httpHeaders);
    let defer = new Promise((resolve, reject) => {
      fetch(url, {
        method: 'GET',
        headers: customHttpHeaders,
        credentials: 'include',
        mode: 'cors'
      })
      .then(checkStatus)
      .then(parseJSON)
      .then(data => {
        resolve(data)
      })
      .catch(error => {
        //捕获异常
        reject(error)
      })
    });

    return defer;
  },
  // do post
  Post(url: string, parmJson?: { [name: string]: any }, extraHeaders?: { [name: string]: any }) {
    let requestHeaders = Object.assign({}, extraHeaders);
    let defer = new Promise((resolve, reject) => {
      fetch(url, {
        method: 'POST',
        headers: requestHeaders,
        body: parmJson,
        credentials: 'include',
        mode: 'cors'
      })
      .then(checkStatus)
      .then(parseJSON)
      .then(data => {
        resolve(data)
      })
      .catch(error => {
        //捕获异常
        reject(error)
      })
    });

    return defer;
  },
  // do put
  Put(url: string, parmJson?: { [name: string]: any }, extraHeaders?: { [name: string]: any }) {
    let requestHeaders = Object.assign({}, extraHeaders);
    let defer = new Promise((resolve, reject) => {
      fetch(url, {
        method: 'PUT',
        headers: requestHeaders,
        body: parmJson,
        credentials: 'include',
        mode: 'cors'
      })
      .then(checkStatus)
      .then(returnResponse)
      .then(data => {
        resolve(data)
      })
      .catch(error => {
        //捕获异常
        reject(error)
      })
    });

    return defer;
  }
}

module.exports = FetchInterface;
/*console.log(FetchInterface);
export default FetchInterface;*/
