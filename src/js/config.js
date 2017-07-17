const CurrentPath = '/h5_dubbo/';

const isWeChat = Common.isWeChat();
const kissoId = Common.returnKissoID();
const referrerUrl = Common.returnReferrerUrl();
const adapt = Common.isAdapt();
const showTopTips = Common.showTopTips();

module.exports = {
  basePath: CurrentPath,
  repayPath: CurrentPath + 'repayment',
  loanPath: CurrentPath + 'loan',
  ftsPath: CurrentPath +'fts',
  userId: '',//用户ID
  userName:'',//用户名
  idNo:'',//身份证
  ssoId:kissoId,
  isWeChat:isWeChat,
  referrerUrl:referrerUrl,
  adapt:adapt,
  showTopTips:showTopTips,
  isReload:false,
  currentPath:'',
  bindCard:{
    bankName:'',//银行卡名字
    bankNum:'',//银行卡号码basePath
    contractName:'',//协议名字
    contractUrl:'',//协议地址
    cityCode:'',//城市编号
    areaCode:'',//区域编号
    phoneNum:'',//手机号
    switchStatus:true,
    isAgree:true,
    notSubmit:true,
    bankCode:'',//银行代码 如：PAB
    bankCardNumStatus:false,//判断银行卡是否正确
    phoneNumStatus:false,//判断手机号是否正确
    showSupportCard:false,
    showErrorMsg:false,
    showTelErrMsg:false,
    sendCount:1,
  },
  user: {},
  sendSmsType: null,
  type: {
    s: 4,
    p: 4,
    r: 5
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
    s: '消费',
    p: '借款',
    r: '还款'
  },
  repayType: {
    1: '快捷还款',
    2: '微信还款',
    3: '自动还款'
  },
  userWritePhoneRegx:/^1\d{10}$/,// /^1([358]\d|7[^017])\d{8}$/
  userWriteThreeDigits:/^1([358]\d|7[^017])/,
  chineseCharRegx:/[\u0391-\uFFE5]+/,
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
  rulerData: [],
  couponData: [],
  selectCoupon: null,
  repayData: {},
  loanData: {
    isAgree:true,
    amount: 0,
    day: 0,
    period: 1,
    currentAmountCount: 0,
    sendSwitch: true,
  },
  currentAmount: 0,
  realAmount: 0,
  account: {},
  method: {},
  repayStatus: {
    Y: '可结清',
    N: '部分结清'
  },
  resultDetail: {
    s: {
      default: '话费充值一般2小时内到账（月初月末高峰期，24小时内到账均属正常情况），请耐心等待。如有疑问，请联系客服。',
      success: '话费充值一般2小时内到账（月初月末高峰期，24小时内到账均属正常情况），请耐心等待。如有疑问，请联系客服。',
      failed: '对不起, 借款失败了, 请您稍后重试'
    },
    p: {
      default: '预计3分钟到达银行卡, 部分银行可能延迟, 以实际到账时间为准',
      success: '预计3分钟到达银行卡, 部分银行可能延迟, 以实际到账时间为准',
      failed: '对不起, 借款失败了, 请您稍后重试'
    },
    r: {
      default: '还款当日到账(最晚24:00), 部分银行可能出现延迟, 最终以银行到账时间为准',
      success: '还款当日到账(最晚24:00), 部分银行可能出现延迟, 最终以银行到账时间为准',
      failed: '对不起, 还款失败了, 请您稍后重试'
    }
  },
  defaultScale: 5000
};
