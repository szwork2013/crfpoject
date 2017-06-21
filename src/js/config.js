let CurrentPath = '/h5_dubbo/';

const isWeChat = Common.isWeChat();
const kissoId = Common.returnKissoID();
const referrerUrl = Common.returnReferrerUrl();
const adapt = Common.isAdapt();

module.exports = {
  basePath: CurrentPath,
  userId: '',//用户ID
  userName:'',//用户名
  idNo:'',//身份证
  ssoId:kissoId,
  isWeChat:isWeChat,
  referrerUrl:referrerUrl,
  adapt:adapt,
  bindCard:{
    bankName:'',//银行卡名字
    bankNum:'',//银行卡号码
    contractName:'',//协议名字
    contractUrl:'',//协议地址
    cityCode:'',//城市编号
    areaCode:'',//区域编号
    phoneNum:'',//手机号
    switchStatus:true,
    isAgree:true,
    notSubmit:true,
  },
  phone: null,
  csPhone: 4009699559,
  billStatus: {
    1: '借款中',
    2: '还款中',
    3: '借款成功',
    4: '还款成功',
    5: '借款失败',
    6: '还款失败'
  },
  billType: {
    s: '借款',
    r: '还款'
  },
  chinaMobileRegx: /^1(3[4-9]|5[012789]|8[23478]|4[7]|7[8])\d{8}$/, //中国移动
  chinaUnionRegx: /^1(3[0-2]|5[56]|8[56]|4[5]|7[6])\d{8}$/, //中国联通
  chinaTelcomRegx: /^1(3[3])|(8[019])\d{8}$/, //中国电信
  otherTelphoneRegx: /^1(7[0678])\d{8}$/, //其他运营商
  mobileFormartRegx: /^(\d{3})(\d{4})(\d{4})$/,
  phoneFormartRegx: /^(\d{3})(\d{3})(\d{4})$/,
  mobileHiddenRegx: /^(\d{3})\d{4}(\d{4})$/,
  iosRegx: /\(i[^;]+;( U;)? CPU.+Mac OS X/,
  repayDefaultTitle: '应还金额(元)',
  repayChangedTitle: '实还金款(元)',
  rulerData: []
};
