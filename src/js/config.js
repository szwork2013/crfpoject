let CurrentPath = '/h5_dubbo/';

let localHref=location.href;
let referrerUrl=localHref.substring(localHref.indexOf('?')+1);
let referrerPara=referrerUrl?referrerUrl.substring(referrerUrl.indexOf('?')+1):'';

let name = 'ssoId';
let urlParaArr=referrerPara.match(new RegExp("(^|&)" + name + "=([^&]*)(&|$)"));

let kissoId=urlParaArr&&urlParaArr[2];

const ua = window.navigator.userAgent.toLowerCase();
const isWeChat = ua.match(/MicroMessenger/i) == 'micromessenger';

module.exports = {
  basePath: CurrentPath,
  userId: '',
  userName:'',
  idNo:'',
  bankName:'',
  bankNum:'',
  ssoId:kissoId,
  isWeChat:isWeChat,
  referrerUrl:referrerUrl,
  contractName:'',
  contractUrl:'',
};
