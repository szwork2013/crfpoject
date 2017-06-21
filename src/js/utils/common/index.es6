
let Common={
  returnReferrerUrl:function(){
    let localHref=location.href;
    return localHref.substring(localHref.indexOf('?')+1);
  },
  returnKissoID:function(){
    let referrerUrl=this.returnReferrerUrl();
    let referrerPara=referrerUrl?referrerUrl.substring(referrerUrl.indexOf('?')+1):'';

    const name = 'ssoId';
    let urlParaArr=referrerPara.match(new RegExp("(^|&)" + name + "=([^&]*)(&|$)"));

    return urlParaArr&&urlParaArr[2];
  },
  isWeChat:function(){
    const ua = window.navigator.userAgent.toLowerCase();
    return ua.match(/MicroMessenger/i) == 'micromessenger';
  },
  isAdapt:function(){
    let adapt;
    if (screen.availWidth/screen.availHeight >= 0.659 || doc.body.scrollWidth/doc.body.scrollHeight >= 0.659 || screen.availWidth <= 320) {
      adapt=true;
    }
    return adapt;
  }
};

module.exports = Common;