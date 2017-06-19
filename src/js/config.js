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
  userId: '',//用户ID
  userName:'',//用户名
  idNo:'',//身份证
  bankName:'',//银行卡名字
  bankNum:'',//银行卡号码
  ssoId:kissoId,
  isWeChat:isWeChat,
  referrerUrl:referrerUrl,
  contractName:'',//协议名字
  contractUrl:'',//协议地址
  cityCode:'',//城市编号
  areaCode:'',//区域编号
  phoneNum:'',//手机号
  count:0,
};
