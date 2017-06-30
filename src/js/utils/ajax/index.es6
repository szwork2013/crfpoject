require('es6-promise/auto');
require('whatwg-fetch');

function checkStatus(response) {
  if (response.status >= 200 && response.status < 300) {
    return response;
  } else {
    let error = new Error(response.statusText);
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
      //.then(parseJSON)
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
  },
  handleError(err,Toast,callback,fn){

    let msg = err&&err.body;
    let status = err&&err.response&&err.response.status;

    if(!fn){
      fn=()=>location.reload();
      console.log(fn);
    }

    switch(status){
        case 400:

          break;
        case 401:
          CRFLogin.initialize(fn);
          break;
        case 403:
          Toast.info('您没有权限做此操作，请返回重试！');
          break;
        case 404:
          Toast.info('资源已经移除，访问出错！');
          break;
        case 500:
        case 502:
        case 504:
          Toast.info('哎呀，服务器开小差了，请稍后再试吧!');
          break;
        default:
          msg&&msg.then(data=>{
            Toast.info(data.message);
          });
    }
    typeof callback==='function'&&callback();

  }
}

module.exports = FetchInterface;
