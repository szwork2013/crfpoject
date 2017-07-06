
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
    return ua.match(/micromessenger/i) == 'micromessenger';
  },
  isAdapt:function(){
    let adapt;
    if (screen.availWidth/screen.availHeight >= 0.659 || doc.body.scrollWidth/doc.body.scrollHeight >= 0.659 || screen.availWidth <= 320) {
      adapt=true;
    }
    return adapt;
  },
  showTopTips:function(){
    let referrerUrl=this.returnReferrerUrl();
    let localHash=referrerUrl.substring(referrerUrl.indexOf('consumption/#/')+13,referrerUrl.indexOf('?'));

    switch (localHash){
      case '/':
        return false;
      case '/loan':
        return true;
    }
  },
  random32word:function(){
    let str = '';
    let arr = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'];

    for(let i=0;i<32;i++){
      str+=arr[parseInt(Math.random()*arr.length)];
    }

    return str;
  },
  setDocTitle:function(title){
    doc.title = title;
    if(Common.isWeChat()){
      doc.setTitle(title);
    }
  },
  customPopState:function(){
    let refUrl=CONFIGS.referrerUrl;//首页点击绑卡过来返回首页 产品页过来返回产品页面（点击确认跳转支付页面）

    if(refUrl){
      if(refUrl.indexOf('#/loan?')>-1){
        refUrl=CONFIGS.referrerUrl.replace('#/loan?','#/recharge?');
      }

      //回退
      window.addEventListener("popstate",function(){
        location.href=refUrl;
      }, false);

      let state = {
        title: "title",
        url: ""
      };
      window.history.pushState(state, "title", "");
    }

  },
  isIos:function(){
    const u = navigator.userAgent;
    return !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/);
  }
};

module.exports = Common;