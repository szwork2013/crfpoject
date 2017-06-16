let CurrentPath = '/h5_dubbo/';


let localHref=location.href;
let referrerUrl=localHref.substring(localHref.indexOf('?')+1);

let referrerPara=referrerUrl.substring(referrerUrl.indexOf('?')+1);
let paraArr=referrerPara.split('&');

let kissoId='';

for(let i=0;i<paraArr.length;i++){
  if(paraArr[i].split('=')[0]==='ssoId'){
    kissoId=paraArr[i].split('=')[1];
  }
}

const ua = window.navigator.userAgent.toLowerCase();
const isWeChat = ua.match(/MicroMessenger/i) == 'micromessenger';

module.exports = {
  basePath: CurrentPath,
  userId: '',
  userName:'',
  idNo:'',
  ssoId:kissoId,
  isWeChat:isWeChat,
  referrerUrl:referrerUrl,
};
