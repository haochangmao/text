// <!-----------------2019-05-14 11:04:25.748---------------------->
!(function (document, undefined) {/**
    * Created with JetBrains WebStorm.
    * User: xuyafeng
    * Date: 15-12-30
    * Time: 上午11:42
    * To change this template use File | Settings | File Templates.
    */
   if (typeof SOTool == "undefined") {
       var SOTool = {};
       SOTool = {
           PluginStack:{},
           JsList:{},
           shareObj:function (name, fun) {
               if (typeof window.CloudSdkPlugin == "undefined") {
                   window.CloudSdkPlugin = {}
               }
               if (!window.CloudSdkPlugin.hasOwnProperty("STK")) {
                   window.CloudSdkPlugin.STK = {}
               }
               window.CloudSdkPlugin.STK[name] = fun;
           }, getObj:function (name) {
               if (typeof window.CloudSdkPlugin == "undefined") {
                   window.CloudSdkPlugin = {}
               }
               if (!window.CloudSdkPlugin.hasOwnProperty("STK")) {
                   throw new Error("no " + name + " Obj");
               }
               return window.CloudSdkPlugin.STK[name];
           }, creatPlugin:function (name, fun) {
               if (typeof window.CloudSdkPlugin == "undefined") {
                   window.CloudSdkPlugin = {}
               }
               window.CloudSdkPlugin[name] = fun;
           }, getPlugin:function (name, fun) {
               if (name == "STK") {
                   throw new Error(name + " is not support");
               }
               if (window.CloudSdkPlugin && typeof window.CloudSdkPlugin[name] != "undefined") {
                   fun&&fun(window.CloudSdkPlugin[name]);
               } else {
                   if( !SOTool.JsList.hasOwnProperty(SOTool.PluginStack[name])){
                       SOTool.JsList[SOTool.PluginStack[name]] =[];
                       if(fun){
                           SOTool.JsList[SOTool.PluginStack[name]].push(fun);
                       }
                   }else{
                       if(fun){
                           SOTool.JsList[SOTool.PluginStack[name]].push(fun);
                       }
                       return;
                   }
                   //合并请求，如果已经请求或者请求成功
                   videoSdkTool.getJS(SOTool.PluginStack[name], function () {
                       var tmpArr = videoSdkTool.clone(SOTool.JsList[SOTool.PluginStack[name]]);
                       delete SOTool.JsList[SOTool.PluginStack[name]];
                       for(var i=0;i<tmpArr.length;i++){
                           var fun = tmpArr[i];                       
                           fun&&fun(window.CloudSdkPlugin[name]);
                       }
                   }, function () {
                       var tmpArr = videoSdkTool.clone(SOTool.JsList[SOTool.PluginStack[name]]);
                       delete SOTool.JsList[SOTool.PluginStack[name]];
                       for(var i=0;i<tmpArr.length;i++){
                           var fun = tmpArr[i];
                           fun&&fun(null);
                       }
                   }, this, "utf-8");
               }
           },setPluginStack:function(opt,lang){
               if (videoSdkTool.isArray(opt)) {
                   for(var i=0;i<opt.length;i++){
                       //回调
                       arguments.callee(opt[i],lang);
                   }
               }else{
                   var HTTP_DOMAIN = "yuntv.letv.com";
                   if(opt.hasOwnProperty("name")&&opt.hasOwnProperty("url")){
                       SOTool.PluginStack[opt.name] = opt.url;
                       if(opt.url.substr(0,4)!="http"){
                           if(window.location.protocol == "https:"){
                               SOTool.PluginStack[opt.name] =window.location.protocol+SOTool.PluginStack[opt.name].replace(/{domain}/g,HTTP_DOMAIN);
                           }else{
                               SOTool.PluginStack[opt.name] ="http:"+SOTool.PluginStack[opt.name].replace(/{domain}/g,HTTP_DOMAIN);
                           }
                           SOTool.PluginStack[opt.name] = SOTool.PluginStack[opt.name].replace(/{LANG}/g,lang);
                       }
                   }else{
                   /*debug*/throw new Error(opt +"must has name and url");
                   }
               }
           },preload:function(){
               //预下载
               var loadArr =arguments;
               for(var i=0;i<loadArr.length;i++){
                   SOTool.getPlugin(loadArr[i]);
               }
           }
       }
   }
   SOTool.shareObj("common.SOTool",SOTool);/**
    * Created with JetBrains WebStorm.
    * User: xuyafeng
    * Date: 16-7-26
    * Time: 下午8:30
    * To change this template use File | Settings | File Templates.
    */
   
   var DomainTool =function () {
       var DomainMap={
           "api.mms.lecloud.com":{
               "en_US":"api.usmms.lecloud.com"
           },
           "apple-www.letv.com":{
               "en_US":"apple.us.www.letv.com"
           }
       }
       var HttpsMap={
           "yuntv.letv.com":"yuntv.letv.com",
           "sdk.lecloud.com":"sdkletv.lecloud.com",
           "ark.letv.com":"arkletv.lecloud.com",//广告
           "api.letvcloud.com":"apiletv.lecloud.com",//云点播接口
           "api.mms.lecloud.com":"api-mms.lecloud.com",//mms点播接口
           "api.live.letvcloud.com":"api-live.lecloud.com",//直播接口
           "apple-www.letv.com":"apple-www.le.com",//上报接口
           "log.cdn.letvcloud.com":"log-cdn.letvcloud.com"//上报错误
       }
       function getDomain(str,lang,useHttps)
       {
           //最终得到的域名
           var purl = str;
           //截取http://后的字符串
           if(str.indexOf("://")!=-1){
               var url = str.match(/^http(|s):\/\/[a-zA-Z\.0-9:]*/)[0];
               purl = str.replace(url,getHttpsByDomain(getMapStr(url,lang),useHttps));
           }
           return purl;
       }
       function getMapStr(str,lang){
           var domain = "";
           if(str.indexOf("://")!=-1){
               var arr = str.split("://");
               domain = arr[1];
           }
           var newDomain = domain;
           if(DomainMap.hasOwnProperty(domain)){
               if(DomainMap[domain].hasOwnProperty(lang)){
                    newDomain = DomainMap[domain][lang];
               }
           }
           return str.replace(domain,newDomain);
       }
       function getHttpsByDomain(url,useHttps) {
           var domain=url;
           if (window&&window.location.protocol == "https:"|| (typeof useHttps!="undefined" && useHttps) ) {
               if(url.indexOf("http://") != -1){
                   domain = url.split("://")[1];
                   if (HttpsMap.hasOwnProperty(domain)) {
                       domain = HttpsMap[domain];
                   }
                   return "https://" + domain;
               }else{
                   if (HttpsMap.hasOwnProperty(domain)) {
                       domain = HttpsMap[domain];
                   }
               }
           }
           return domain;
       }
       return {
           getDomain:getDomain
       };
   }()
   SOTool.shareObj("common.DomainTool", DomainTool);/**
    * Created with JetBrains WebStorm.
    * User: xuyafeng
    * Date: 16-7-4
    * Time: 下午4:39
    * To change this template use File | Settings | File Templates.
    */
   /**
    * Created with JetBrains WebStorm.
    * User: xuyafeng
    * Date: 15-8-26
    * Time: 上午11:51
    * To change this template use File | Settings | File Templates.
    */
   var Message =function () {
       return {
           NoSupportPano:0
           ,Drm:1 //视频为加密视频，无法解密播放
           ,NoStart:2 //直播未开始,请稍候 "直播未开始,请稍候",
           ,INTERRUPT:3 //"直播信号中断，请稍候",
           ,END:4 //"直播已经结束"
           ,GSLB_IO:470 //媒资接口参数不合法
           ,Other:"other" //其他错误
       }
   }()
   SOTool.shareObj("model.Message", Message);
   
   
   /**
    * Created with JetBrains WebStorm.
    * User: xuyafeng
    * Date: 15-8-26
    * Time: 上午11:51
    * To change this template use File | Settings | File Templates.
    * 多语言 工具
    * 多语言做法，js是一个，加载不同语言包
    *
    *  http://blog.sina.com.cn/s/blog_7981f91f01012wm7.html
    */
   var LangTool =function () {
       var isload =false;
       var ms ;
       function getLang(callback,type,message){
           //加载语言包模块
           if(isload){
               if(ms.hasOwnProperty(message)){
                   return {message:ms[message]};
               }
               return {message:message};
           }
           SOTool.getPlugin("lang.message.plugin."+type, function (MS) {
               if (MS) {
                   ms = MS;
                   isload =true;
                   callback();
               }else{
                   callback();
               }
           });
           return false;
       }
       function getLangN(callback,type,err){
           //加载语言包模块
           if(isload){
               if(ms.hasOwnProperty(err.message)){
                   return {message:ms[err.message]};
               }
               if(err.code=="490"||err.code=="153"){
                   return {message:err.message}
               }
               return {message:ms[Message.Other]};
           }
           SOTool.getPlugin("lang.message.plugin."+type, function (MS) {
               if (MS) {
                   ms = MS;
                   isload =true;
                   callback();
               }else{
                   callback();
               }
           });
           return false;
       }
       return {
           loadLang:isload,
           toMessage:getLang,
           toMessageN:getLangN,
           ms:ms
       };
      // getLang();
   }()
   SOTool.shareObj("common.LangTool", LangTool);/**
    * Created with JetBrains WebStorm.
    * User: xuyafeng
    * Date: 15-8-26
    * Time: 上午11:51
    * To change this template use File | Settings | File Templates.
    */
   var videoSdkTool = function () {
       var ua = navigator.userAgent.toLowerCase();
       //   var ua ="Mozilla/5.0 (Linux; Android 4.4.2; PE-TL20 Build/HuaweiPE-TL20) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/47.0.2526.83 Mobile Safari/537.36".toLowerCase();
       var br = {
           br:"",
           device:"",
           ver:"",
           params:null,
           os:""
       }
   
       function urlParams() {
           var url = window.location.search;
           var result = {};
           if (url.indexOf("?") != -1) {
               var str = url.substr(1);
               var strs = str.split("&");
               for (var i = 0; i < strs.length; i++) {
                   var key = strs[i].substr(0, strs[i].indexOf("="));
                   var value = strs[i].substr(strs[i].indexOf("=") + 1);
                   result[key] = value;
               }
           }
           return result;
       }
   
       function getBrowser(ua) {
           var config = [
               {name:"ie", test:/msie/},
               {name:"opera", test:/opera/},
               {name:"firefox", test:/firefox/},
               {name:"safari", test:/safari.*(?!chrome)/},
               {name:"chrome", test:/chrome/},
               {name:"wph", test:/windows phone/},
               {name:"ps", test:/playstation/},
               {name:"uc", test:/ucbrowser|ucweb/},
               {name:"ps", test:/playstation/},
               {name:"xiaomi", test:/xiaomi/},
               {name:"qq", test:/qqbrowser/},
               {name:"weixin", test:/micromessenger/},
               {name:"360", test:/360browser/},
               {name:"baidu", test:/baidu/},
               {name:"qqwebview", test:/ qq/},
               {name:"sougou", test:/sougou/},
               {name:"liebao", test:/liebaofast/},
               {name:"letv", test:/eui browser/}
           ]
           var br = "un";
           for (var i = 0; i < config.length; i++) {
               var item = config[i];
               if (item.test.test(ua)) {
                   br = item.name;
               }
           }
           return br;
       }
   
       function getDevice(ua) {
           var config = [
               {name:"wph", test:/windows phone/},
               {name:"ipad", test:/ipad/},
               {name:"iphone", test:/iphone/},
               {name:"androidPad", test:/(?!.*mobile)android/},
               {name:"androidPhone", test:/android.*mobile/},
               {name:"android", test:/android/},
               {name:"pc", test:/windows/},
               {name:"mac", test:/macintosh|mac os x/}
           ]
           for (var i = 0; i < config.length; i++) {
               var item = config[i];
               if (item.test.test(ua)) {
                   return item.name;
               }
           }
           return "un";
       }
   
       function getVersion(ua) {
           var browser = {};
           var s;
           (s = ua.match(/msie ([\d.]+)/))
               ? browser.msie = s[1]
               : (s = ua.match(/firefox\/([\d.]+)/))
               ? browser.firefox = s[1]
               : (s = ua.match(/360browser/))
               ? browser.b360 = (s[1] ? s[1] : '-')
               : (s = ua.match(/qqbrowser\/([\d.]+)/))
               ? browser.bqq = s[1]
               : (s = ua.match(/ucbrowser\/([\d.]+)/))
               ? browser.buc = s[1]
               : (s = ua.match(/baidubrowser\/([\d.]+)/))
               ? browser.bbaidu = s[1]
               : (s = ua.match(/sogoumobilebrowser\/([\d.]+)/))
               ? browser.bsgm = s[1]
               : (s = ua.match(/liebaofast\/([\d.]+)/))
               ? browser.blbfast = s[1]
               : (s = ua.match(/mb2345browser\/([\d.]+)/))
               ? browser.b2345 = s[1]
               : (s = ua.match(/4g explorer\/([\d.]+)/))
               ? browser.b4g = s[1]
               : (s = ua.match(/huohoubrowser\/([\d.]+)/))
               ? browser.bhuohou = s[1]
               : (s = ua.match(/maxthon[\/ ]([\d.]+)/))
               ? browser.maxthon = s[1]
               : (s = ua.match(/(opera)|(opr)\/([\d.]+)/))
               ? browser.opera = s[3]
               : (s = ua.match(/chrome\/([\d.]+)/))
               ? browser.chrome = s[1]
               : (s = ua.match(/version\/([\d.]+).*safari/))
               ? browser.safari = s[1]
               : browser.other = '-';
           var version = "";
           for (var i in  browser) {
               version = browser[i];
           }
           return version;
       }
   
       function getOs(ua) {
           var isWin = (navigator.platform == "Win32") || (navigator.platform == "Windows");
           var isMac = (navigator.platform == "Mac68K") || (navigator.platform == "MacPPC") || (navigator.platform == "Macintosh") || (navigator.platform == "MacIntel");
           if (isMac) return "mac";
           if (isWin) {
               var isWin2K = ua.indexOf("windows nt 5.0") > -1 || ua.indexOf("windows 2000") > -1;
               if (isWin2K) return "win2000";
               var isWinXP = ua.indexOf("windows nt 5.1") > -1 || ua.indexOf("windows XP") > -1;
               if (isWinXP) return "winXP";
               var isWin2003 = ua.indexOf("windows nt 5.2") > -1 || ua.indexOf("windows 2003") > -1;
               if (isWin2003) return "win2003";
               var isWinVista = ua.indexOf("windows nt 6.0") > -1 || ua.indexOf("windows vista") > -1;
               if (isWinVista) return "winVista";
               var isWin7 = ua.indexOf("windows nt 6.1") > -1 || ua.indexOf("windows 7") > -1;
               if (isWin7) return "win7";
           }
           if (/android/.test(ua)) {
               return "android";
           }
           if (!!ua.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/) || ua.match(/iphone/) || ua.match(/ipad/)) {
               return "ios";
           }
           var isUnix = (navigator.platform == "X11") && !isWin && !isMac;
           if (isUnix) return "unix";
           var isLinux = (String(navigator.platform).indexOf("Linux") > -1);
           if (isLinux) return "linux";
           return "un";
       }
   
       return {
           br:br,
           getOs:function () {
               if (br.os == "") {
                   br.os = getOs(ua);
               }
               return br.os;
           },
           getUrlParams:function (key) {
               if (br.params == null) br.params = urlParams();
               if (br.params && br.params.hasOwnProperty(key)) {
                   return br.params[key];
               }
               return false;
           },
           getDevice:function () {
               if (br.device == "") {
                   br.device = getDevice(ua);
               }
               return  br.device;
           },
           getBrowser:function () {
               if (br.br == "") {
                   br.br = getBrowser(ua);
               }
               return br.br;
           },
           getBrowserVersion:function () {
               if (br.br == "") {
                   br.br = getBrowser(ua);
               }
               if (br.ver == "") {
                   br.ver = getVersion(ua);
               }
               return br.br + br.ver;
           },
           now:Date.now || function () {
               return +new Date();
           },
           getJS:function (u, s, e, bind, c, t) {
               if (typeof u == "undefined") {
                   return;
               }
               var head = document.head || document.getElementsByTagName('head')[0] || document.documentElement,
                   a = document.createElement("script"),
                   check;
               a.type = "text/javascript";
               if (c) {
                   a.charset = c;
               }
               ;
               a.onload = a.onreadystatechange = function () {
                   if (a.readyState && a.readyState != "loaded" && a.readyState != "complete") {
                       return;
                   }
                   a.onreadystatechange = a.onload = a.onerror = null;
                   a = null;
                   clearTimeout(check);
                   if (typeof s == "function") {
                       s.call(bind);
                   }
               };
               a.onerror = function () {
                   a.onload = a.onreadystatechange = a.onerror = null;
                   a = null;
                   clearTimeout(check);
                   if (typeof e == "function") {
                       e.call(bind);
                   }
               };
               a.src = u;
               head.appendChild(a);
               if (!t) {
                   t = 10000;
               }
               check = setTimeout(function () {
                       clearTimeout(check);
                       if (typeof e == "function") {
                           e();
                       }
                   },
                   t);
           },
           getJSON:function (url, success, fail, timeout, max, delay) {
               var time = this.now(),
                   jsonpCallback = 'letvcloud' + time + Math.floor(Math.random() * 100),
                   replace = '$1' + jsonpCallback + '$2',
                   count = 0,
                   delayID = 0,
                   me = this,
                   s,
                   err = -1,
                   head = document.head || document.getElementsByTagName('head')[0] || document.documentElement;
               var urlobj = this.urlToObj(url);
               if(urlobj.hasOwnProperty("callback")){
                   jsonpCallback = urlobj.callback;
               }else{
                   if (!/_r=/i.test(url)) url += '&callback=?';
                   url = url.replace(/(\=)\?(&|$)|\?\?/i, replace);
               }
               // logger.log('URL:'+url);
               var timeout = timeout || 5000;
               var maxCount = max || 2;
               var timeDelay = delay || 1000;
               window[jsonpCallback] = function (response) {
                   destroy();
                   window[jsonpCallback] = null;
                   err = -1;
                   success.call(this, response, {responseTime:me.now() - time, retryCount:count});
               };
               var destroy = function () {
                   clearTimeout(delayID);
                   if (s && s.parentNode) {
                       head.removeChild(s);
                       s.onload = s.onreadystatechange = null;
                       s.onerror = null;
                       s = undefined;
                   }
               }
               var errorHandler = function () {
                   destroy();
                   if (count >= maxCount) {
                       clearTimeout(delayID);
                       window[jsonpCallback] = null;
                       // vjs.pingback.errorStatus = 1;
                       fail && fail.call(this, null, {responseTime:me.now() - time, retryCount:count, error:err});
                       return;
                   } else {
                       setTimeout(load, timeDelay);
                   }
               }
               var load = function () {
                   destroy();
                   count++;
                   url = url.replace(/&_r=[\d|\?]+/i, '&_r=' + count);
   
                   s = document.createElement('script');
                   s.setAttribute('type', 'text/javascript');
                   s.setAttribute('src', url);
                   s.setAttribute('charset', "utf-8");
                   s.onload = s.onreadystatechange = function (_) {
                       s.onload = s.onreadystatechange = null;
                       clearTimeout(delayID);
                   }
                   head.insertBefore(s, head.firstChild);
                   err = 1;
                   delayID = setTimeout(errorHandler, timeout);
               };
               load();
           },
           getJSONbyAjax:function (url, success, fail, timeout, max, delay) {
               var time = this.now(),
                   count = 0,
                   delayID = 0,
                   me = this,
                   s,
                   err = -1,
                   xhr;
               // logger.log('URL:'+url);
               var timeout = timeout || 5000;
               var maxCount = max || 2;
               var timeDelay = delay || 1000;
               var destroy = function () {
                   clearTimeout(delayID);
                   if (xhr) {
                       xhr.onreadystatechange =null;
                      // xhr.abort();
                   }
               }
               var errorHandler = function () {
                   destroy();
                   if (count >= maxCount) {
                       clearTimeout(delayID);
                       fail && fail.call(this, null, {responseTime:me.now() - time, retryCount:count, error:err});
                       return;
                   } else {
                       setTimeout(load, timeDelay);
                   }
               }
               var load = function () {
                   destroy();
                   count++;
                   xhr = new XMLHttpRequest();
                   xhr.timeout =timeout;
                   xhr.onreadystatechange = function(evtXHR) {
                       if (xhr.readyState == 4) {
                           if (xhr.status == 200) {
                               var response = xhr.responseText;
                               //成功获得数据
                               destroy();
                               err = -1;
                               success.call(this, response, {responseTime:me.now() - time, retryCount:count});
                           } else {
                               //获得数据失败
                               errorHandler();
                           }
                       }
                       else {
                           //获得数据失败
                       }
                   };
                   xhr.ontimeout=errorHandler;
                   xhr.open('GET', url, true);
                   xhr.send();
                   err = 1;
               };
               load();
           },
           creatUuid:function () {
               var chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('');
               var uuid = [], i;
               var len = 32, radix = 16;
               radix = radix || chars.length;
               if (len) {
                   // Compact form
                   for (i = 0; i < len; i++) uuid[i] = chars[0 | Math.random() * radix];
               } else {
                   // rfc4122, version 4 form
                   var r;
                   // rfc4122 requires these characters
                   uuid[8] = uuid[13] = uuid[18] = uuid[23] = '-';
                   uuid[14] = '4';
   
                   // Fill in random data.  At i==19 set the high bits of clock sequence as
                   // per rfc4122, sec. 4.1.5
                   for (i = 0; i < 36; i++) {
                       if (!uuid[i]) {
                           r = 0 | Math.random() * 16;
                           uuid[i] = chars[(i == 19) ? (r & 0x3) | 0x8 : r];
                       }
                   }
               }
               return uuid.join('');
           },
           urlToObj:function(url){
               var flashVars = {};
               var str =url;
               if (url.indexOf("?") != -1) {
                   str = url.substr(1);
               }
               var strs = str.split("&");
               for (var i = 0; i < strs.length; i++) {
                   var key = strs[i].substr(0, strs[i].indexOf("="));
                   var value = strs[i].substr(strs[i].indexOf("=") + 1);
                   flashVars[key] = value;
               }
               return flashVars;
           },
           objectParseToString:function (value) {
               if (value == null)return "";
               var str = "";
               var count = 0;
               for (var item in value) {
                   if (count > 0) {
                       str += "&" + item + "=" + value[item];
                   } else {
                       str += item + "=" + value[item];
                   }
                   count++;
               }
               return str;
           },
           /**
            1. 设置cookie的值，把name变量的值设为value
            example videoSdkTool.cookie(’name’, ‘value’);
            2.新建一个cookie 包括有效期 路径 域名等
            example videoSdkTool.cookie(’name’, ‘value’, {expires: 7, path: ‘/’, domain: ‘jquery.com’, secure: true});
            3.新建cookie
            example videoSdkTool.cookie(’name’, ‘value’);
            4.删除一个cookie
            example videoSdkTool.cookie(’name’, null);
            5.取一个cookie(name)值给myvar
            var account= videoSdkTool.cookie('name');
            **/
           cookie:function (name, value, options) {
               if (typeof value != 'undefined') { // name and value given, set cookie
                   options = options || {};
                   if (value === null) {
                       value = '';
                       options.expires = -1;
                   }
                   var expires = '';
                   if (options.expires && (typeof options.expires == 'number' || options.expires.toUTCString)) {
                       var date;
                       if (typeof options.expires == 'number') {
                           date = new Date();
                           date.setTime(date.getTime() + (options.expires * 24 * 60 * 60 * 1000));
                       } else {
                           date = options.expires;
                       }
                       expires = '; expires=' + date.toUTCString(); // use expires attribute, max-age is not supported by IE
                   }
                   var path = options.path ? '; path=' + options.path : '';
                   var domain = options.domain ? '; domain=' + options.domain : '';
                   var secure = options.secure ? '; secure' : '';
                   document.cookie = [name, '=', encodeURIComponent(value), expires, path, domain, secure].join('');
               } else { // only name given, get cookie
                   var cookieValue = null;
                   if (document.cookie && document.cookie != '') {
                       var cookies = document.cookie.split(';');
                       for (var i = 0; i < cookies.length; i++) {
                           var cookie = cookies[i];
                           // Does this cookie string begin with the name we want?
                           if (cookie.substring(0, name.length + 1) == (name + '=')) {
                               cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                               break;
                           }
                       }
                   }
                   return cookieValue;
               }
               return null;
           },
           setLocal:function (name, value, cookie) {
               if (typeof cookie == "undefined") {cookie=true;}
               if (window.localStorage) {
                   try {
                       //无痕浏览器会报错
                       localStorage.setItem(name, value);
                   } catch (e) {
                   }
               }
               if(cookie){
                   this.cookie(name, value, cookie);
               }
           },
           getLocal:function (name,cookie) {
               if (typeof cookie == "undefined") {cookie=true;}
               if (window.localStorage) {
                   try {
                       if (localStorage.getItem(name)) {
                           return localStorage.getItem(name);
                       }
                   } catch (e) {
                   }
               }
               if(cookie){
                   return this.cookie(name);
               }
               return -1;
           },
           num2Time:function (num) {
               var hours;
               var min;
               if (parseInt(num / 60) < 10) {
                   hours = "0" + parseInt(num / 60) + ":"
               } else {
                   hours = parseInt(num / 60) + ":"
               }
               if (parseInt(num % 60) < 10) {
                   min = "0" + parseInt(num % 60) + "";
               } else {
                   min = parseInt(num % 60) + "";
               }
               return hours + min;
           },
           lt10:function (time) {
               return time<10?"0"+time:time;
           },
           num2Duration:function (num) {
               if(parseInt(num/60) >= 60){//大于60分钟
                   return this.lt10(parseInt(num/3600))+":"+this.lt10(parseInt(num/60%60))+":"+this.lt10(parseInt(num%60));
               }else{
                   return this.lt10(parseInt(num/60))+":"+this.lt10(parseInt(num%60));
               }
           },
           clone:function (obj) {
               var o, i, j, k;
               if (typeof(obj) != "object" || obj === null)return obj;
               if (obj instanceof(Array)) {
                   o = [];
                   i = 0;
                   j = obj.length;
                   for (; i < j; i++) {
                       if (typeof(obj[i]) == "object" && obj[i] != null) {
                           o[i] = arguments.callee(obj[i]);
                       }
                       else {
                           o[i] = obj[i];
                       }
                   }
               }
               else {
                   o = {};
                   for (i in obj) {
                       if (typeof(obj[i]) == "object" && obj[i] != null) {
                           o[i] = arguments.callee(obj[i]);
                       }
                       else {
                           o[i] = obj[i];
                       }
                   }
               }
               return o;
           },
           isHttps:function () {
               try {
                   return window.location.protocol == "https:";
               } catch (e) {
               }
               return false;
           },
           isArray:function (o) {
               return Object.prototype.toString.call(o) === '[object Array]';
           },
           isFunction:function(fn) {
               return Object.prototype.toString.call(fn)=== '[object Function]';
           },
           addUrlParams:function (urls, addParams) {
               for (var i = 0; i < urls.length; i++) {
                   var url = urls[i];
                   for (var key in addParams) {
                       if (url.indexOf("&" + key + "=") == -1 && url.indexOf("?" + key + "=") == -1) {
                           if (url.indexOf("?") != -1) {
                               url += "&" + key + "=" + addParams[key];
                           } else {
                               url += "?" + key + "=" + addParams[key];
                           }
                       }
                   }
                   urls[i] = url;
               }
           },
           bindFun:function (fun, t) {
               if (fun.bind) {
                   return fun.bind(t);
               }
               return function () {
                   return fun.apply(t, arguments)
               }
           },
           split:function (str,code,len) {
               var arr = str.split(code),narr=[],i=0;
               if (typeof len == "undefined"|| len>=arr.length) {
                   return arr;
               }
               while(narr.length<len-1){
                   narr.push(arr[0]);
                   arr.shift();
               }
               narr[len-1] = arr.join(code);
               return narr;
           }
       }
   }();
   SOTool.shareObj("common.videoSdkTool", videoSdkTool);/**
    * Created with JetBrains WebStorm.
    * User: xuyafeng
    * Date: 15-12-16
    * Time: 下午2:33
    * To change this template use File | Settings | File Templates.
    */
   videoSdkTool.checkPano = function () {
       try {
           var canvas = document.createElement('canvas');
           var webgl= !!window.WebGLRenderingContext && ( canvas.getContext('webgl') || canvas.getContext('experimental-webgl') );
           if(webgl){
               switch (videoSdkTool.getDevice()){
                   case "ipad":
                   case "iphone":
                       return false;
                       break;
                   case "androidPad":
                   case "androidPhone":
                   case "android":
                       if(videoSdkTool.getBrowser()=="chrome"||videoSdkTool.getBrowser()=="firefox"){
                           return true;
                       }
                       break;
                   case "pc":
                       return true;
                       break;
                   case "wph":
                       return false;
                       break;
                   default:
                       break;
               }
           }
       } catch (e) {
           return false;
       }
       return false;
   };
   SOTool.shareObj("common.videoSdkTool", videoSdkTool);/**
    * Created with JetBrains WebStorm.
    * User: xuyafeng
    * Date: 15-9-22
    * Time: 上午10:57
    * To change this template use File | Settings | File Templates.
    */
   var WIN = window,
       DC = document;
   var ApiList = [
       "playNewId",
       "getVideoSetting",
       "getVideoTime",
       "pauseVideo",
       "resumeVideo",
       "seekTo",
       "replayVideo",
       "closeVideo",
       "setVolume",
       "shutDown",
       "startUp",
       "getBufferPercent",
       "setDefinition",
       "getDefinition",
       "getDefaultDefinition",
       "getDefinitionList",
       "getDefList",
       "setVideoPercent",
       "getVideoPercent",
       "setVideoScale",
       "getVideoScale",
       "resetVideoScale",
       "fullVideoScale",
       "setVideoRect",
       "getLoadPercent",
       "getDownloadSpeed",
       "getPlayRecord",
       "getPlayState",
       "setVideoColor",
       "getVideoColor",
       "getVersion",
       "setAutoReplay",
       "feedback",
       "getLog",
       "getServerTime",
       "setTipInfo",
       "setPlayerInfo",
       "setHorseRaceLampInfo",
       "barrageInput",
       "barrageStop",
       "barrageStart",
       "barrageResume",
       "barragePause",
       "callFlash",
       "setPoint",
       "removePoint",
       "setPlaybackRate",
       "setFullScreen",
       "setX5FullScreen"
   ];/**
    * Created with JetBrains WebStorm.
    * User: xuyafeng
    * Date: 15-9-15
    * Time: 下午4:39
    * To change this template use File | Settings | File Templates.
    *
    * http://www1.tc711.com/tool/js/Base64.js
    */
   var BaseCode =
   {
       decode:function (data) {
           var b64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
           var o1, o2, o3, h1, h2, h3, h4, bits, i = 0, ac = 0, dec = "", tmp_arr = [];
   
           if (!data) {
               return data;
           }
           data += '';
   
           do {        // unpack four hexets into three octets using index points in b64
               h1 = b64.indexOf(data.charAt(i++));
               h2 = b64.indexOf(data.charAt(i++));
               h3 = b64.indexOf(data.charAt(i++));
               h4 = b64.indexOf(data.charAt(i++));
               bits = h1 << 18 | h2 << 12 | h3 << 6 | h4;
   
               o1 = bits >> 16 & 0xff;
               o2 = bits >> 8 & 0xff;
               o3 = bits & 0xff;
   
               if (h3 == 64) {
                   tmp_arr[ac++] = String.fromCharCode(o1);
               } else if (h4 == 64) {
                   tmp_arr[ac++] = String.fromCharCode(o1, o2);
               } else {
                   tmp_arr[ac++] = String.fromCharCode(o1, o2, o3);
               }
           } while (i < data.length);
           dec = tmp_arr.join('');
           return dec;
       },
       encode:function (data) {
           var b64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
           var o1, o2, o3, h1, h2, h3, h4, bits, i = 0, ac = 0, enc = "", tmp_arr = [];
   
           if (!data) {
               return data;
           }
           data = this.utf8_encode(data + '');
           do { // pack three octets into four hexets
               o1 = data.charCodeAt(i++);
               o2 = data.charCodeAt(i++);
               o3 = data.charCodeAt(i++);
   
               bits = o1 << 16 | o2 << 8 | o3;
   
               h1 = bits >> 18 & 0x3f;
               h2 = bits >> 12 & 0x3f;
               h3 = bits >> 6 & 0x3f;
               h4 = bits & 0x3f;
   
               tmp_arr[ac++] = b64.charAt(h1) + b64.charAt(h2) + b64.charAt(h3) + b64.charAt(h4);
           } while (i < data.length);
   
           enc = tmp_arr.join('');
           switch (data.length % 3) {
               case 1:
                   enc = enc.slice(0, -2) + '==';
                   break;
               case 2:
                   enc = enc.slice(0, -1) + '=';
                   break;
           }
           return enc;
       },
       utf8to16:function(str) {
           var out, i, len, c;
           var char2, char3;
           out = "";
           len = str.length;
           i = 0;
           while(i < len) {
               c = str.charCodeAt(i++);
               switch(c >> 4)
               {
                   case 0: case 1: case 2: case 3: case 4: case 5: case 6: case 7:
                   // 0xxxxxxx
                   out += str.charAt(i-1);
                   break;
                   case 12: case 13:
                   // 110x xxxx   10xx xxxx
                   char2 = str.charCodeAt(i++);
                   out += String.fromCharCode(((c & 0x1F) << 6) | (char2 & 0x3F));
                   break;
                   case 14:
                       // 1110 xxxx  10xx xxxx  10xx xxxx
                       char2 = str.charCodeAt(i++);
                       char3 = str.charCodeAt(i++);
                       out += String.fromCharCode(((c & 0x0F) << 12) |
                           ((char2 & 0x3F) << 6) |
                           ((char3 & 0x3F) << 0));
                       break;
               }
           }
   
           return out;
       }
   };/*
    * A JavaScript implementation of the RSA Data Security, Inc. MD5 Message
    * Digest Algorithm, as defined in RFC 1321.
    * Version 2.1 Copyright (C) Paul Johnston 1999 - 2002.
    * Other contributors: Greg Holt, Andrew Kepert, Ydnar, Lostinet
    * Distributed under the BSD License
    * See http://pajhome.org.uk/crypt/md5 for more info.
    */
   var MD5 =function(){
       /*
        * Configurable variables. You may need to tweak these to be compatible with
        * the server-side, but the defaults work in most cases.
        */
       var hexcase = 0;  /* hex output format. 0 - lowercase; 1 - uppercase        */
       var b64pad  = ""; /* base-64 pad character. "=" for strict RFC compliance   */
       var chrsz   = 8;  /* bits per input character. 8 - ASCII; 16 - Unicode      */
   
       /*
        * These are the functions you'll usually want to call
        * They take string arguments and return either hex or base-64 encoded strings
        */
       function hex_md5(s){ return binl2hex(core_md5(str2binl(s), s.length * chrsz));}
   //    function b64_md5(s){ return binl2b64(core_md5(str2binl(s), s.length * chrsz));}
   //    function str_md5(s){ return binl2str(core_md5(str2binl(s), s.length * chrsz));}
   //    function hex_hmac_md5(key, data) { return binl2hex(core_hmac_md5(key, data)); }
   //    function b64_hmac_md5(key, data) { return binl2b64(core_hmac_md5(key, data)); }
   //    function str_hmac_md5(key, data) { return binl2str(core_hmac_md5(key, data)); }
   
       /*
        * Perform a simple self-test to see if the VM is working
   
       function md5_vm_test()
       {900150983cd24fb0d6963f7d28e17f72
         return hex_md5("abc") == "900150983cd24fb0d6963f7d28e17f72";
       }  */
   
       /*
        * Calculate the MD5 of an array of little-endian words, and a bit length
        */
       function core_md5(x, len)
       {
         /* append padding */
         x[len >> 5] |= 0x80 << ((len) % 32);
         x[(((len + 64) >>> 9) << 4) + 14] = len;
   
         var a =  1732584193;
         var b = -271733879;
         var c = -1732584194;
         var d =  271733878;
   
         for(var i = 0; i < x.length; i += 16)
         {
           var olda = a;
           var oldb = b;
           var oldc = c;
           var oldd = d;
   
           a = md5_ff(a, b, c, d, x[i+ 0], 7 , -680876936);
           d = md5_ff(d, a, b, c, x[i+ 1], 12, -389564586);
           c = md5_ff(c, d, a, b, x[i+ 2], 17,  606105819);
           b = md5_ff(b, c, d, a, x[i+ 3], 22, -1044525330);
           a = md5_ff(a, b, c, d, x[i+ 4], 7 , -176418897);
           d = md5_ff(d, a, b, c, x[i+ 5], 12,  1200080426);
           c = md5_ff(c, d, a, b, x[i+ 6], 17, -1473231341);
           b = md5_ff(b, c, d, a, x[i+ 7], 22, -45705983);
           a = md5_ff(a, b, c, d, x[i+ 8], 7 ,  1770035416);
           d = md5_ff(d, a, b, c, x[i+ 9], 12, -1958414417);
           c = md5_ff(c, d, a, b, x[i+10], 17, -42063);
           b = md5_ff(b, c, d, a, x[i+11], 22, -1990404162);
           a = md5_ff(a, b, c, d, x[i+12], 7 ,  1804603682);
           d = md5_ff(d, a, b, c, x[i+13], 12, -40341101);
           c = md5_ff(c, d, a, b, x[i+14], 17, -1502002290);
           b = md5_ff(b, c, d, a, x[i+15], 22,  1236535329);
   
           a = md5_gg(a, b, c, d, x[i+ 1], 5 , -165796510);
           d = md5_gg(d, a, b, c, x[i+ 6], 9 , -1069501632);
           c = md5_gg(c, d, a, b, x[i+11], 14,  643717713);
           b = md5_gg(b, c, d, a, x[i+ 0], 20, -373897302);
           a = md5_gg(a, b, c, d, x[i+ 5], 5 , -701558691);
           d = md5_gg(d, a, b, c, x[i+10], 9 ,  38016083);
           c = md5_gg(c, d, a, b, x[i+15], 14, -660478335);
           b = md5_gg(b, c, d, a, x[i+ 4], 20, -405537848);
           a = md5_gg(a, b, c, d, x[i+ 9], 5 ,  568446438);
           d = md5_gg(d, a, b, c, x[i+14], 9 , -1019803690);
           c = md5_gg(c, d, a, b, x[i+ 3], 14, -187363961);
           b = md5_gg(b, c, d, a, x[i+ 8], 20,  1163531501);
           a = md5_gg(a, b, c, d, x[i+13], 5 , -1444681467);
           d = md5_gg(d, a, b, c, x[i+ 2], 9 , -51403784);
           c = md5_gg(c, d, a, b, x[i+ 7], 14,  1735328473);
           b = md5_gg(b, c, d, a, x[i+12], 20, -1926607734);
   
           a = md5_hh(a, b, c, d, x[i+ 5], 4 , -378558);
           d = md5_hh(d, a, b, c, x[i+ 8], 11, -2022574463);
           c = md5_hh(c, d, a, b, x[i+11], 16,  1839030562);
           b = md5_hh(b, c, d, a, x[i+14], 23, -35309556);
           a = md5_hh(a, b, c, d, x[i+ 1], 4 , -1530992060);
           d = md5_hh(d, a, b, c, x[i+ 4], 11,  1272893353);
           c = md5_hh(c, d, a, b, x[i+ 7], 16, -155497632);
           b = md5_hh(b, c, d, a, x[i+10], 23, -1094730640);
           a = md5_hh(a, b, c, d, x[i+13], 4 ,  681279174);
           d = md5_hh(d, a, b, c, x[i+ 0], 11, -358537222);
           c = md5_hh(c, d, a, b, x[i+ 3], 16, -722521979);
           b = md5_hh(b, c, d, a, x[i+ 6], 23,  76029189);
           a = md5_hh(a, b, c, d, x[i+ 9], 4 , -640364487);
           d = md5_hh(d, a, b, c, x[i+12], 11, -421815835);
           c = md5_hh(c, d, a, b, x[i+15], 16,  530742520);
           b = md5_hh(b, c, d, a, x[i+ 2], 23, -995338651);
   
           a = md5_ii(a, b, c, d, x[i+ 0], 6 , -198630844);
           d = md5_ii(d, a, b, c, x[i+ 7], 10,  1126891415);
           c = md5_ii(c, d, a, b, x[i+14], 15, -1416354905);
           b = md5_ii(b, c, d, a, x[i+ 5], 21, -57434055);
           a = md5_ii(a, b, c, d, x[i+12], 6 ,  1700485571);
           d = md5_ii(d, a, b, c, x[i+ 3], 10, -1894986606);
           c = md5_ii(c, d, a, b, x[i+10], 15, -1051523);
           b = md5_ii(b, c, d, a, x[i+ 1], 21, -2054922799);
           a = md5_ii(a, b, c, d, x[i+ 8], 6 ,  1873313359);
           d = md5_ii(d, a, b, c, x[i+15], 10, -30611744);
           c = md5_ii(c, d, a, b, x[i+ 6], 15, -1560198380);
           b = md5_ii(b, c, d, a, x[i+13], 21,  1309151649);
           a = md5_ii(a, b, c, d, x[i+ 4], 6 , -145523070);
           d = md5_ii(d, a, b, c, x[i+11], 10, -1120210379);
           c = md5_ii(c, d, a, b, x[i+ 2], 15,  718787259);
           b = md5_ii(b, c, d, a, x[i+ 9], 21, -343485551);
   
           a = safe_add(a, olda);
           b = safe_add(b, oldb);
           c = safe_add(c, oldc);
           d = safe_add(d, oldd);
         }
         return Array(a, b, c, d);
   
       }
   
       /*
        * These functions implement the four basic operations the algorithm uses.
        */
       function md5_cmn(q, a, b, x, s, t)
       {
         return safe_add(bit_rol(safe_add(safe_add(a, q), safe_add(x, t)), s),b);
       }
       function md5_ff(a, b, c, d, x, s, t)
       {
         return md5_cmn((b & c) | ((~b) & d), a, b, x, s, t);
       }
       function md5_gg(a, b, c, d, x, s, t)
       {
         return md5_cmn((b & d) | (c & (~d)), a, b, x, s, t);
       }
       function md5_hh(a, b, c, d, x, s, t)
       {
         return md5_cmn(b ^ c ^ d, a, b, x, s, t);
       }
       function md5_ii(a, b, c, d, x, s, t)
       {
         return md5_cmn(c ^ (b | (~d)), a, b, x, s, t);
       }
   
       /*
        * Calculate the HMAC-MD5, of a key and some data
        */
       function core_hmac_md5(key, data)
       {
         var bkey = str2binl(key);
         if(bkey.length > 16) bkey = core_md5(bkey, key.length * chrsz);
   
         var ipad = Array(16), opad = Array(16);
         for(var i = 0; i < 16; i++)
         {
           ipad[i] = bkey[i] ^ 0x36363636;
           opad[i] = bkey[i] ^ 0x5C5C5C5C;
         }
   
         var hash = core_md5(ipad.concat(str2binl(data)), 512 + data.length * chrsz);
         return core_md5(opad.concat(hash), 512 + 128);
       }
   
       /*
        * Add integers, wrapping at 2^32. This uses 16-bit operations internally
        * to work around bugs in some JS interpreters.
        */
       function safe_add(x, y)
       {
         var lsw = (x & 0xFFFF) + (y & 0xFFFF);
         var msw = (x >> 16) + (y >> 16) + (lsw >> 16);
         return (msw << 16) | (lsw & 0xFFFF);
       }
   
       /*
        * Bitwise rotate a 32-bit number to the left.
        */
       function bit_rol(num, cnt)
       {
         return (num << cnt) | (num >>> (32 - cnt));
       }
   
       /*
        * Convert a string to an array of little-endian words
        * If chrsz is ASCII, characters >255 have their hi-byte silently ignored.
        */
       function str2binl(str)
       {
         var bin = Array();
         var mask = (1 << chrsz) - 1;
         for(var i = 0; i < str.length * chrsz; i += chrsz)
           bin[i>>5] |= (str.charCodeAt(i / chrsz) & mask) << (i%32);
         return bin;
       }
   
       /*
        * Convert an array of little-endian words to a string
   
       function binl2str(bin)
       {
         var str = "";
         var mask = (1 << chrsz) - 1;
         for(var i = 0; i < bin.length * 32; i += chrsz)
           str += String.fromCharCode((bin[i>>5] >>> (i % 32)) & mask);
         return str;
       } */
   
       /*
        * Convert an array of little-endian words to a hex string.
        */
       function binl2hex(binarray)
       {
         var hex_tab = hexcase ? "0123456789ABCDEF" : "0123456789abcdef";
         var str = "";
         for(var i = 0; i < binarray.length * 4; i++)
         {
           str += hex_tab.charAt((binarray[i>>2] >> ((i%4)*8+4)) & 0xF) +
                  hex_tab.charAt((binarray[i>>2] >> ((i%4)*8  )) & 0xF);
         }
         return str;
       }
   
       /*
        * Convert an array of little-endian words to a base-64 string
   
       function binl2b64(binarray)
       {
         var tab = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
         var str = "";
         for(var i = 0; i < binarray.length * 4; i += 3)
         {
           var triplet = (((binarray[i   >> 2] >> 8 * ( i   %4)) & 0xFF) << 16)
                       | (((binarray[i+1 >> 2] >> 8 * ((i+1)%4)) & 0xFF) << 8 )
                       |  ((binarray[i+2 >> 2] >> 8 * ((i+2)%4)) & 0xFF);
           for(var j = 0; j < 4; j++)
           {
             if(i * 8 + j * 6 > binarray.length * 32) str += b64pad;
             else str += tab.charAt((triplet >> 6*(3-j)) & 0x3F);
           }
         }
         return str;
       }  */
       return {
           hash:function(str){
                   return hex_md5(str);
           }
       }
   }();/**
    * Created with JetBrains WebStorm.
    * User: xuyafeng
    * Date: 15-9-16
    * Time: 下午2:48
    * To change this template use File | Settings | File Templates.
    */
   var UiTool = {
       getTemplate:function (c, t,css,uuid) {
           if (typeof css != "undefined") {
               css =css.replace(/{#}/g, uuid);
               t =t.replace(/{#}/g, uuid);
               UiTool.loadCss(css);
           }
           var id = new Date().getTime();
           var yArr = t.match(/#{[a-z_A-Z0-9]{1,}}/g) || [];
           var keyArr = [];
           for (var i = 0; i < yArr.length; i++) {
               var k = yArr[i].replace(/^#{?|}$/g, "");
               t = t.replace(yArr[i], k + id);
               keyArr.push(k);
           }
           c.innerHTML = t;
           for (var i = 0; i < keyArr.length; i++) {
               var k = keyArr[i];
               c[k] = UiTool.$E(k + id);
             //  c[k].removeAttribute("id");
           }
           return keyArr;
       },
       loadCss:function (css) {
           var head = document.head || document.getElementsByTagName("head")[0] || document.documentElement,
               styleNode = document.createElement('style');
           styleNode.setAttribute("type", "text/css");
           styleNode.innerHTML = css;
           head.appendChild(styleNode);
       },
       $E:function (b) {
           var a = typeof b == "string" ? document.getElementById(b) : b;
           if (a != null) {
               return a
           } else {
           }
           return null
       },
       $C:function (tag) {
           return document.createElement(tag);
       },
       hasClassName:function (element, className) {
           if (!element) return;
           var elementClassName = element.className;
           if (elementClassName.length == 0) return false;
           //用正则表达式判断多个class之间是否存在真正的class（前后空格的处理）
           if (elementClassName == className || elementClassName.match(new RegExp("(^|\\s)" + className + "(\\s|$)")))
               return true;
           return false;
       },
       addClassName:function (element, className) {
           if (!element) return;
           var elementClassName = element.className;
           if (elementClassName.length == 0) {
               element.className = className;
               return;
           }
           if (elementClassName == className || elementClassName.match(new RegExp("(^|\\s)" + className + "(\\s|$)")))
               return;
           element.className = elementClassName + " " + className;
       },
       removeClassName:function (element, className) {
           if (!element) return;
           var elementClassName = element.className;
           if (elementClassName.length == 0) return;
           if (elementClassName == className) {
               element.className = "";
               return;
           }
           if (elementClassName.match(new RegExp("(^|\\s)" + className + "(\\s|$)")))
               element.className = elementClassName.replace((new RegExp("(^|\\s)" + className + "(\\s|$)")), " ");
       },
       addEvent:function (obj, eventType, func) {
           if (eventType.indexOf(",") != -1) {
               var arr = eventType.split(",");
               for (var i = 0, len = arr.length; i < len; i++) {
                   var evtype = arr[i];
                   if (evtype == "") return;
                   if (obj.attachEvent) {
                       obj.attachEvent("on" + evtype, func);
                   } else {
                       obj.addEventListener(evtype, func, false);
                   }
               }
               arr = null;
           } else {
               if (obj.attachEvent) {
                   obj.attachEvent("on" + eventType, func);
               } else {
                   obj.addEventListener(eventType, func, false);
               }
           }
       },
       removeEvent:function (obj, eventType, func) {
           var f = this.$E(obj);
           if (f == null) {
               // trace("removeEvent 找不到对象：" + obj);
               return
           }
           if (typeof func != "function") {
               return
           }
           if (typeof eventType == "undefined") {
               return
           }
           if (eventType.indexOf(",") != -1) {
               var arr = eventType.split(",");
               for (var i = 0, len = arr.length; i < len; i++) {
                   var evType = arr[i];
                   if (evType == "") return;
                   if (f.addEventListener) {
                       f.removeEventListener(evType, func, false)
                   } else {
                       if (f.attachEvent) {
                           f.detachEvent("on" + evType, func)
                       }
                   }
               }
               arr = null;
           } else {
               if (f.addEventListener) {
                   f.removeEventListener(eventType, func, false)
               } else {
                   if (f.attachEvent) {
                       f.detachEvent("on" + eventType, func)
                   }
               }
           }
       },
       getPos:function (pTarget) {
           pTarget = this.$E(pTarget);
           if (!pTarget.getBoundingClientRect) {
               var x_ = y_ = 0;
               while (pTarget.offsetParent) {
                   x_ += pTarget.offsetLeft;
                   y_ += pTarget.offsetTop;
                   pTarget = pTarget.offsetParent;
               }
               x_ += pTarget.offsetLeft;
               y_ += pTarget.offsetTop;
               return {x:x_, y:y_}
           } else {
               var body = document.compatMode == 'CSS1Compat' ? document.documentElement : document.body;
               var rect = pTarget.getBoundingClientRect()
               return {x:rect.left + body.scrollLeft, y:rect.top + body.scrollTop};
           }
       },
       getMousePoint:function (ev) {
           var SupportsTouches = ("createTouch" in document),
               x = y = 0,
               doc = document.documentElement,
               body = document.body;
           if (!ev) ev = window.event;
           if (window.pageYOffset) {
               x = window.pageXOffset;
               y = window.pageYOffset;
           } else {
               x = (doc && doc.scrollLeft || body && body.scrollLeft || 0) - (doc && doc.clientLeft || body && body.clientLeft || 0);
               y = (doc && doc.scrollTop || body && body.scrollTop || 0) - (doc && doc.clientTop || body && body.clientTop || 0);
           }
           if (SupportsTouches) {
               var evt = ev.touches.item(0);//仅支持单点触摸,第一个触摸点
               x = evt.pageX;
               y = evt.pageY;
           } else {
               x += ev.clientX;
               y += ev.clientY;
           }
           return {'x':x, 'y':y};
       },
       preventDefault:function (ev) {
           if (ev)ev.preventDefault();
           else window.event.returnValue = false;
       },
       turnEvent:function (type) {
           var EventMap = {
               mousedown:"touchstart",
               mousemove:"touchmove",
               mouseup:"touchend",
               mouseover:"touchstart",
               mouseout:"-",
               click:"touchstart"
           }
           if (UiTool.isSupportsTouches()) {
               if (EventMap.hasOwnProperty(type)) {
                   return EventMap[type];
               }
           }
           return type;
       },
       isSupportsTouches:function (type) {
           return ("createTouch" in document)
       },
       drag:function (o, opt) {
           var SupportsTouches = ("createTouch" in document),
               StartEvent = UiTool.turnEvent("mousedown"), //支持触摸式使用相应的事件替代
               MoveEvent = UiTool.turnEvent("mousemove"),
               EndEvent = UiTool.turnEvent("mouseup"),
               me = this;
           if (typeof o == "string") o = document.getElementById(o);
           o.orig_index = o.style.zIndex;
           o.startX = 0;
           o.startY = 0;
           o['on' + StartEvent] = function (e) {
               var d = document,
                   result = {},
                   x,
                   y,
                   limitRect;
               this.style.zIndex = 10000;
               if (opt.rect) {
                   limitRect = opt.rect();
               }
               if (!e)e = window.event;
               e.preventDefault();
               if (SupportsTouches) {
                   var evt = e.touches.item(0);
                   x = evt.pageX;
                   y = evt.pageY;
               } else {
                   x = e.clientX + d.body.scrollLeft;
                   y = e.clientY + d.body.scrollTop;
               }
               //记录原始位置
               var start = {x:parseInt(o.offsetLeft), y:parseInt(o.offsetTop)};
               d.ondragstart = "return false;";
               d.onselectstart = "return false;";
               d.onselect = "document.selection.empty();";
               if (o.setCapture)
                   o.setCapture();
               else if (window.captureEvents)
                   window.captureEvents(Event.MOUSEMOVE | Event.MOUSEUP);
               opt.onDown && opt.onDown((parseInt(o.style.left) - limitRect.x) / limitRect.w);
               UiTool.addEvent(d, MoveEvent, mouseDragMove);
               UiTool.addEvent(d, EndEvent, mouseDragUp);
               function mouseDragMove(e) {
                   if (!e)e = window.event;
                   //计算出鼠标移动距离
                   if (SupportsTouches) {
                       var evt = e.touches.item(0);//仅支持单点触摸,第一个触摸点
                       result.x = evt.pageX - x;
                       result.y = evt.pageY - y;
                   } else {
                       result.x = e.pageX ? e.pageX - x : e.clientX + document.body.scrollLeft - x;
                       result.y = e.pageY ? e.pageY - y : e.clientY + document.body.scrollTop - y;
                   }
                   result.x = start.x + result.x;
                   result.y = start.x + result.y;
   
                   if (limitRect) {
                       if (result.x < limitRect.x) {
                           result.x = limitRect.x
                       } else if (result.x > (limitRect.x + limitRect.w)) {
                           result.x = limitRect.x + limitRect.w;
                       }
                       if (result.y < limitRect.y) {
                           result.y = limitRect.y;
                       } else if (result.y > (limitRect.y + 0 + limitRect.h)) {
                           result.y = limitRect.y + limitRect.h;
                       }
                   }
                   o.style.left = result.x + "px";
                   o.style.top = result.y + "px";
   
                   opt.onMove && opt.onMove((parseInt(o.style.left) - limitRect.x) / limitRect.w);
                   return false;
               }
   
               function mouseDragUp() {
                   if (o.releaseCapture)
                       o.releaseCapture();
                   else if (window.captureEvents)
                       window.captureEvents(Event.MOUSEMOVE | Event.MOUSEUP);
                   UiTool.removeEvent(d, MoveEvent, mouseDragMove);
                   UiTool.removeEvent(d, EndEvent, mouseDragUp);
                   o.style.zIndex = o.orig_index;
                   opt.onUp && opt.onUp((parseInt(o.style.left) - limitRect.x) / limitRect.w);
               }
   
               return false;
           }
       },
       fullScreen:function (element) {
           if (element.requestFullscreen) {
               return  element.requestFullscreen();
           } else if (element.mozRequestFullScreen) {
               return  element.mozRequestFullScreen();
           } else if (element.webkitRequestFullscreen) {
               return element.webkitRequestFullScreen();
           } else if (element.msRequestFullscreen) {
               return  element.msRequestFullscreen();
           } else if (element.oRequestFullscreen) {
             return  element.oRequestFullscreen();
           }
   
       },
       isFullScreen:function () {
           if((document.webkitIsFullScreen || document.fullscreen || document.mozFullScreen || document.msFullscreenElement)){
               return true;
           }
           return false;
       },
       cancelFullScreen:function () {
           if (document.cancelFullscreen) {
               document.cancelFullscreen();
           } else if (document.exitFullscreen) {
               document.exitFullscreen();
           } else if (document.msExitFullscreen) {
               document.msExitFullscreen();
           } else if (document.mozCancelFullScreen) {
               document.mozCancelFullScreen();
           } else if (document.webkitExitFullscreen) {
               document.webkitExitFullscreen();
           } else if (document.webkitCancelFullScreen) {
               element.webkitCancelFullScreen();
           }
       },
       supportFullScreen:function () {
           var doc = document.documentElement;
           return ('requestFullscreen' in doc) ||
               ('mozRequestFullScreen' in doc && document.mozFullScreenEnabled) ||
               ('webkitRequestFullscreen' in doc) || ('msRequestFullscreen' in doc);
       },
       getClientWidth:function () {
           return document.body.clientWidth;
       },
       getImgRealRect:function (img) {
           var imgWidth = img.width;
           var imgHeight = img.height;
           if (typeof img.naturalWidth != "undefined") {
               imgWidth = img.naturalWidth;
               imgHeight = img.naturalHeight;
           }
           return {width:imgWidth,height:imgHeight};
       },
       isMobileEvent:function(type){
           return ["touchstart","touchmove","touchend"].indexOf(type)!=-1;
       },
       hexToRgba:function(hex,alpha){
           var sColor = hex.toLowerCase();
           var reg = /^#([0-9a-fA-f]{3}|[0-9a-fA-f]{6})$/;
           if(sColor && reg.test(sColor)){
               if(sColor.length === 4){
                   var sColorNew = "#";
                   for(var i=1; i<4; i+=1){
                       sColorNew += sColor.slice(i,i+1).concat(sColor.slice(i,i+1));
                   }
                   sColor = sColorNew;
               }
               //处理六位的颜色值
               var sColorChange = [];
               for(var i=1; i<7; i+=2){
                   sColorChange.push(parseInt("0x"+sColor.slice(i,i+2)));
               }
               return "RGBA(" + sColorChange.join(",") + ","+alpha+")";
           }else{
               return sColor;
           }
       },
       setCanvasColor:function(canvas,clr){
           var context = canvas.getContext('2d');
           var imgData=context.getImageData(0,0,canvas.width,canvas.height);
           for (var i=0;i<imgData.data.length;i+=4)
           {
               if(imgData.data[i+3]==0){
               }else{
                   var color = clr.toLocaleLowerCase();
                   color = color.replace(/rgba\(|\)/g,"").split(",");
                   imgData.data[i]= color[0];
                   imgData.data[i+1]= color[1];
                   imgData.data[i+2]= color[2];
               }
           }
           context.putImageData(imgData,0,0);
       }
   };
   SOTool.shareObj("common.UiTool",UiTool);/**
    * Created by zhaoshengdi on 2015/9/7.
    */
   var jsonTool = {
       isString:function (str) {
           return (typeof str === "string");
       },
       stringToJson:function (str) {
           if (this.isString(str)) {
               try {
                   return window.JSON.parse(str);
               } catch (e) {
                   return {};
               }
           } else {
               return str;
           }
       },
       isJson:function (obj) {
           if (obj && typeof obj === "object" && obj.constructor === "Object") {
               return true;
           } else {
               return false;
           }
       },
       jsonToString:function (obj) {
           var result ="";
           try{
               result = window.JSON.stringify(obj);
           }catch(e){result=e;}
           return result;
       }
   } /**
    * Created with JetBrains WebStorm.
    * User: xuyafeng
    * Date: 15-9-11
    * Time: 上午10:26
    * To change this template use File | Settings | File Templates.
    */
   var logTool = function () {
       var record = "";
       var logMsg = [];
       return{
           log:function (msg, obj, f) {
               var target = typeof obj != "undefined" ? "[" + obj.constructor.name + "]" : "-"
               var f = typeof f != "undefined" ? f : "-";
               if (record == msg) return;
               try {
                   var mydate = new Date();
                   var tstr = "[" + mydate.getFullYear() + "-" + mydate.getMonth() + "-" + mydate.getDate() + " " + mydate.getHours() + ":" + mydate.getMinutes() + ":" + mydate.getSeconds() + ":" + mydate.getMilliseconds() + "]";
                   logMsg.push(tstr + msg + "  target-->" + target);
                   if (logMsg.length > 1000) {
                       logMsg.shift();
                   }
                   if (window.location.href.indexOf("#dSDK=1") != -1 || window.location.href.substr(0, 4).toLocaleLowerCase() == "file") {
                       if(window.location.href.indexOf("#stack=1") != -1){
                           var stack = new Error().stack
                           console.log(stack);
                       }
                       window.console && window.console.log(msg, target, f, tstr);
                   }
                   if (window.location.href.indexOf("#dSDK=2") != -1) {
                       if (document.getElementById("log")) {
                           var logdiv = document.createElement("DIV");
                           logdiv.innerHTML = (msg + target + tstr);
                           document.getElementById("log").appendChild(logdiv);
                       } else {
                           var div = document.createElement("DIV");
                           div.id = "log";
                           document.body.appendChild(div);
                           var logdiv = document.createElement("DIV");
                           logdiv.innerHTML = (msg + target + tstr);
                           document.getElementById("log").appendChild(logdiv);
                       }
                       record = msg;
                   }
               } catch (e) {
               }
           },
           getLog:function (msg) {
               return logMsg.join("<br>\r\n");
           }
       }
   }();
   logTool.log("js 加载成功  ua:"+ window.navigator.userAgent);/**
    * Created with JetBrains WebStorm.
    * User: xuyafeng
    * Date: 15-10-8
    * Time: 上午9:33
    * To change this template use File | Settings | File Templates.
    */
   var ReportTool = function () {
       var logTmp = '<div style="width:100%;"><span>用户id:</span><input type="text" style="width:300px;"><input style="float:right;" type="button" value="关闭"></div><textarea class="input" style="width: 100%;height: 100%"  placeholder="Once upon a time..."></textarea>';
       var printEl =  document.createElement("DIV");
       printEl.style.cssText = "width:85%;height:80%;position:fixed;left:0px;top:0px;z-index: 3000;background-color:rgba(255, 255, 255, 1);";
       var postIframeEl = document.createElement("IFRAME");
       postIframeEl.name = "submit";
       postIframeEl.style.cssText ="display:none;position:absolute;";
       var postForm = document.createElement("form");
       function post(URL, PARAMS) {
           var temp = postForm;
           postForm.innerHTML ="";
           temp.action = URL;
           temp.method = "post";
           temp.target ="submit";
           temp.style.display = "none";
           for (var x in PARAMS) {
               var opt = document.createElement("textarea");
               opt.name = x;
               opt.value = PARAMS[x];
               temp.appendChild(opt);
           }
           document.body.appendChild(temp);
           temp.submit();
           return temp;
       }
       return {
           print:function (str,id) {
               printEl.innerHTML = logTmp;
               document.body.appendChild(printEl);
               printEl.style.display ="";
               var textBox = printEl.getElementsByTagName("textarea")[0];
               textBox.innerHTML = str;
               var idBox = printEl.getElementsByTagName("input")[0];
               var closebtn = printEl.getElementsByTagName("input")[1];
               closebtn.onclick = function(){
                   printEl.style.display ="none";
               }
               idBox.value = id;
           },
           report:function (url, params) {
               document.body.appendChild(postIframeEl);
               post(url,params);
           }
       }
   }();/**
    * Created with JetBrains WebStorm.
    * User: xuyafeng
    * Date: 15-9-14
    * Time: 下午5:12
    * To change this template use File | Settings | File Templates.
    */
   var FlashPlayer = {
       isSupportFlash:false,
       isEmdbed:false,
       num:0,
       check:function (num) {
           var version = "";
           if (typeof window.ActiveXObject != "undefined" || ("ActiveXObject" in window)) {
               try {
                   version = (new ActiveXObject("ShockwaveFlash.ShockwaveFlash")).GetVariable("$version")
               } catch (b) {
               }
           }
           if (window.navigator.plugins && window.navigator.plugins["Shockwave Flash"]) {
               try {
                   version = window.navigator.plugins["Shockwave Flash"].description;
                   this.isEmdbed = true;
               } catch (b) {
               }
           }
           if (version == "") this.isSupportFlash = false;
           for (var b = version.split(/\s+/), e = 0, d = b.length; e < d; e++) {
               var a = b[e];
               if (parseInt(a) > num) {
                   this.isSupportFlash = true;
               }
           }
           return this.isSupportFlash;
       },
       getPlayer:function (id) {
           if (this.isEmdbed) {
               return document[id] || window[id];
           }
           return document.getElementById(id);
       },
       create:function (containId, dconfig, flashvars) {
   
           var uuid = "cloudPlayer" + new Date().getTime() + this.num;
           this.num++;
           var config = {
               bgcolor:"#000000",
               allowscriptaccess:"always",
               wmode:"Opaque",
               width:"100%",
               height:"100%",
               align:"middle",
               quality:"high",
               allowFullScreen:true,
               version:10
           };
           for (var key in dconfig) {
               config[key] = dconfig[key];
           }
           config.flashvars = flashvars;
           var embedHtml = "";
           if (this.check(config.version)) {
               if (this.isEmdbed) {
                   var embedTpl = ["<embed name='" + uuid + "'src='" + config.url + "' pluginspage='http://www.macromedia.com/go/getflashplayer' type='application/x-shockwave-flash' width='" + config.width + "' height='" + config.height + "' ", " />"];
                   var params = ""
                   for (var key in config) {
                       if (key != "width" && key != "height" && key != "url") {
                           params += key + "='" + config[key] + "' ";
                       }
                   }
                   embedHtml = embedTpl.join(params)
               } else {
                   var params = ""
                   var objectTpl = ["<object id='" + uuid + "' classid='clsid:d27cdb6e-ae6d-11cf-96b8-444553540000'codebase='http://download.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version=9,0,45,0' type='application/x-shockwave-flash' width='" + config.width + "' height='" + config.height + "'><param name='movie' value='" + config.url + "'/>", "</object>"];
                   for (var key in config) {
                       if (key != "width" && key != "height" && key != "url") {
                           params += "<param name='" + key + "' value='" + config[key] + "'/>"
                       }
                   }
                   embedHtml = objectTpl.join(params)
               }
           } else {
               embedHtml = '<div style="width:' + config.width + "px; height:" + config.height + 'px; text-align:center;"><span style="line-height:200%; font-size:18px">\u5b89\u88c5\u6216\u8005\u66f4\u65b0\u7248\u672c\u4e0d\u5c0f\u4e8e<b style="color:red">' + config.version + '</b>\u7684flash\u64ad\u653e\u5668, \u8bf7\u70b9\u51fb<a href="http://get.adobe.com/cn/flashplayer/" target="_blank">\u8fd9\u91cc</a>\u5b89\u88c5</span></div>'
           }
           typeof containId == "string" && containId != "" && document.getElementById(containId) ? document.getElementById(containId).innerHTML = embedHtml : document.write(embedHtml);
           return uuid;
       }
   }/**
    * Created with JetBrains WebStorm.
    * User: xuyafeng
    * Date: 15-10-8
    * Time: 上午9:33
    * To change this template use File | Settings | File Templates.
    */
   var ClassTool = function () {
       var Class = {};
       return {
           inherits:function (childCtor, parentCtor) {
               function tempCtor() {
               };
               try {
                   tempCtor.prototype = parentCtor.prototype;
                   childCtor.prototype = new tempCtor();
                   //childCtor.superClass = parentCtor.prototype;
                   childCtor.prototype.constructor = childCtor;
                   childCtor.prototype.superClass = parentCtor.prototype;
               } catch (e) {
                   //debugger;
               }
               //原型链继承
           },
           provideClass:function (str, f) {
               var arr = str.split(".");
   
               if (arr.length > 1) {
                   for (var i = 0; i < arr.length - 1; i++) {
                       var key = arr[i];
                       if (!last.hasOwnProperty(key)) {
                           last[key] = {};
                       }
                       last = last[key];
                   }
               }
               last[arr[arr.length - 1]] = f;
           },
           importClass:function (str) {
               var arr = str.split(".");
               var classKey = arr[arr.length - 1];
               var last = Class;
               for (var i = 0; i < arr.length - 1; i++) {
                   var key = arr[i];
                   if (!last.hasOwnProperty(key)) {
                       throw("the " + str + "--" + key + " class is not provide")
                   }
                   last = last[key];
               }
               return last;
           }
       }
   }();
   SOTool.shareObj("common.ClassTool",ClassTool);/**
    * Created with JetBrains WebStorm.
    * User: xuyafeng
    * Date: 15-9-14
    * Time: 下午2:41
    * To change this template use File | Settings | File Templates.
    */
   var GlobalHandler =  function (){
       var settingList = ["cid", "pid", "vid", "mmsid", "pic", "title", "url", "nextvid", "nextpic", "nexttitle", "nexturl", "nextchapter", "duration", "total", "percent", "rotation", "fullscreen", "color", "volume", "jump", "continuePlay", "gpu", "gpuing", "definition", "defaultDefinition", "trylook", "fullScale", "originalScale", "originalRect","videoWidth","videoHeight"];
       /**
        * 自动匹配.
        */
       var AUTO = "auto";
       /**
        * saas 平台叫做流畅
        */
       var LW_0 = "180";
       /**
        * 流畅/标清
        */
       var LW = "350";
       /**
        * 高清.
        */
       var SD = "1000";
       /**
        * 超清.
        */
       var HD = "1300";
       /**
        * 4K.
        */
       var K4 = "k4";
       /**
        * 超清720p.
        */
       var P720 = "720p";
       /**
        * 超清1080p.
        */
       var P1080 = "1080p";
       /**
        * 原画清晰度.
        */
       var YUANHUA = "yuanhua";
       var VOD_VTYPE_DIC ={
           57:LW_0
           ,58:LW_0
           ,1:LW //流畅 flv
           ,21:LW //流畅	 mp4
           ,9:LW //流畅  mp4
           ,161:LW //流畅
           ,16:SD //高清flv
           ,13:SD //高清
           ,162:SD //高清
           ,17:HD //超清
           ,22:HD //超清
           ,163:HD //超清
           ,27:YUANHUA
           ,28:YUANHUA
           ,18:P720
           ,51:P720
           ,35:P1080
           ,52:P1080
           ,20:P1080
           ,36:P1080
           ,54:K4
       }
       return {
           defList:[LW_0,LW,SD,HD,YUANHUA,P720,P1080,K4],
           settingList:function(){
               return settingList;
           },
           getHttpsDomain:function(url) {
               if (window.location.protocol == "https:") {
                   var domain = url.split("://")[1];
                   var domainObj = {
                       "yuntv.letv.com":"yuntv.letv.com",
                       "ark.letv.com":"arkletv.lecloud.com",
                       "api.letvcloud.com":"apiletv.lecloud.com",
                       "sdk.lecloud.com":"sdkletv.lecloud.com"
                   }
                   if (domainObj.hasOwnProperty(domain)) {
                       domain = domainObj[domain];
                   }
                   return "https://" + domain;
               }
               return url;
           },
           checkPlayType:function () {
               /*
                *  强制使用mp4的浏览器
                * */
               var forceMp4 = ['samsung-sm-n9009__weibo__5.1.2__android__android4.3', 'HUAWEI MT1-T00 Build/HuaweiMT1-T00', 'cpqb', '360zqb', 'p6-t00', 'sm-n9008', 'sm-', 'samsung', 'huawei', 'android.+chrome'];
               //检查系统
               switch (videoSdkTool.getDevice()) {
                   case "ipad":
                   case "iphone":
                   case "mac":
                   case "pc":
                       return "ios"
                       break;
                   case "androidPad":
                   case "androidPhone":
                   case "android":
                       if (videoSdkTool.getLocal("playType") == "mp4") {
                           return "mp4";
                       }
                       var ua = navigator.userAgent.toLowerCase();
                       for (var i = 0; i < forceMp4.length; i++) {
                           if (ua.indexOf(forceMp4[i].toLowerCase()) != -1) {
                               return "mp4"
                           }
                       }
                       if (/samsung/i.test(ua) && /weibo/i.test(ua)) {
                           return "mp4";
                       }
                       if (document.createElement('video') && document.createElement('video').canPlayType("application/x-mpegURL") == "") {
                           return "mp4";
                       }
                       return "ios";
                       break;
               }
               return "mp4";
           },
           def2Type:function(type,obj) {//rate to vtype,type=rate,obj={rate:vtype}
               // if (obj.hasOwnProperty(type)) {
               //     return obj[type];
               // }
               // return type;
               var index = GlobalHandler.defList.indexOf(type);
               index = (index==-1)?0:index;
               for(var i=index;i>=0;i--){//向下寻找
                   if(obj.hasOwnProperty(GlobalHandler.defList[i])){
                       return obj[GlobalHandler.defList[i]];
                   }
               }
               //向下没找到，则向上寻找
               for(var j=index+1;j<GlobalHandler.defList.length;j++){
                   if(obj.hasOwnProperty(GlobalHandler.defList[j])){
                       return obj[GlobalHandler.defList[j]];
                   }
               }
               return type;
           },
           type2Def:function(type) {//vtype to rate
               if (VOD_VTYPE_DIC.hasOwnProperty(type)) {
                   return VOD_VTYPE_DIC[type];
               }
               return type;
           },
           initTypeDefObj:function(arr,obj) {//arr=服务器返回的vtype,obj={rate:vtype}
               for(var i=0;i<arr.length;i++){
                   var key = arr[i];
                   if(VOD_VTYPE_DIC.hasOwnProperty(key)){
                       obj[VOD_VTYPE_DIC[key]] = key;
                   }
               }
            }
       }
   }();/**
    * Created with JetBrains WebStorm.
    * User: xuyafeng
    * Date: 15-10-8
    * Time: 上午10:18
    * To change this template use File | Settings | File Templates.
    */
   var PlayState = {
       PLAY:0,
       PAUSE:1,
       STOP:2
   };/**
    * Created with JetBrains WebStorm.
    * User: xuyafeng
    * Date: 15-9-15
    * Time: 下午3:35
    * To change this template use File | Settings | File Templates.
    */
   //ERR.
   var ERR = {};
   /**
    * SDK对接参数传递错误
    */
   ERR.PARAMS = "1";
   /**
    * 直播未开始
    */
   ERR.NOSTART = "2";
   /**
    * 直播中断
    */
   ERR.INTERRUPT = "3";
   /**
    * 直播结束
    */
   ERR.END = "7";
   /**
    * 无直播计划
    */
   ERR.NOPLAN = "4";
   /**
    * 超出观看人数
    */
   ERR.PEOPLE_OUT = "5";
   /**
    * 白名单验证未通过
    */
   ERR.WHITE_LIST = "6";
   /**
    * 直播活动代理服务器请求失败
    */
   ERR.ACTIVITY_IO = "60";
   /**
    * 直播活动代理服务器超时错误
    */
   ERR.ACTIVITY_TIMEOUT = "61";
   /**
    * 直播活动代理服务器内容解析失败
    */
   ERR.ACTIVITY_ANALY = "63";
   /**
    * 直播活动代理服务器没有可以播放的机位
    */
   ERR.NOSTREAM = "64";
   
   /**
    * 直播代理服务器返回数据解析失败
    */
   ERR.LIVE_ANALY = "50";
   /**
    * 直播代理服务器请求失败
    */
   ERR.LIVE_IO = "51";
   /**
    * 直播代理服务器请求超时错误
    */
   ERR.LIVE_TIMEOUT = "53";
   /**
    * 播放视频NetStream.Play.Notfound
    */
   ERR.PLAY_IO = "480";
   /**
    * 播放视频长时间超时,仍旧无法播放
    */
   ERR.PLAY_TIMEOUT = "481";
   /**
    * 乐聚数据配置接口访问失败
    */
   ERR.VOD_CONFIG_IO = "150";
   /**
    * 乐聚数据配置接口访问超时
    */
   ERR.VOD_CONFIG_TIMEOUT = "152";
   /**
    * gpc访问新媒资接口内容不合法.
    */
   ERR.VOD_MMSID_ANALY = "153";
   /**
    * 不能播放drm的视频
    */
   ERR.VOD_CONFIG_DRM = "154";
   /*
   * 调度接口失败
   * */
   ERR.GSLB_IO = "470";
   /*
   * 调度返回数据不可播放
   * */
   ERR.GSLB_ANALY = "473";
   /*
   *
   * */
   ERR.NOSupport = "490";/**
    * Created with JetBrains WebStorm.
    * User: xuyafeng
    * Date: 16-5-6
    * Time: 下午11:34
    * To change this template use File | Settings | File Templates.
    * 全局颜色控制器
    */
   SOTool.shareObj("manager.ColorManager",function () {
       //模块引用区域
       var UiTool =SOTool.getObj("common.UiTool");
       function manager(){
           this.managerDsipayList =[];
           this.cList =[];
           this.colorConfig ={
               //背景颜色
               bgColor:"#000000",
               //默认颜色
               fault:"#F1F1F1",
               //激活的颜色
               active:"#1479EB"
           }
       }
       manager.prototype.setColor = function (display,colorKey,type,alpha) {
           if (typeof type == "undefined") {
               type ="bg";
           }
           if (typeof alpha == "undefined") {
               alpha =1;
           }
           display.setColor(UiTool.hexToRgba(this.colorConfig[colorKey],alpha),type);
           var index = this.managerDsipayList.indexOf(display);
           if(index ==-1){
               this.managerDsipayList.push(display);
               this.cList.push({display:display,key:colorKey,type:type,alpha:alpha})
           }else{
               this.cList[index].key = colorKey;
               this.cList[index].type = type;
               this.cList[index].alpha = alpha;
           }
       }
       manager.prototype.register = function (config) {
           for(var key in config){
               if(this.colorConfig.hasOwnProperty(key)){
                   if(config[key].substr(0,2)=="0x"){
                       config[key] =config[key].substr(2);
                   }
                   if(config[key].substr(0,1)!="#"){
                       this.colorConfig[key] = "#" + config[key]
                   }else{
                       this.colorConfig[key] =config[key];
                   }
               }
           }
       }
       manager.prototype.refresh = function (config) {
           this.register(config);
           for(var i=0;i<this.cList.length;i++){
               this.cList[i].display.setColor(UiTool.hexToRgba(this.colorConfig[this.cList[i].key],this.cList[i].alpha),this.cList[i].type);
           }
       }
       return manager;
   }());/**
    * Created with JetBrains WebStorm.
    * User: xuyafeng
    * Date: 15-9-11
    * Time: 上午11:20
    * To change this template use File | Settings | File Templates.
    */
   var ClassObject = function () {
       function Class() {
           this.init();
       }
   
       Class.prototype = {
           init: function () {
           },
           /*
           *  type 事件类型
           *  handler 侦听函数
           *  handlerThis 侦听函数作用域
           *  priority 优先级 目前还没处理
           * */
           addEventListener: function (type, handler, handlerThis, priority) {
               //addEventListener(type,handler,handlerThis,this);
               if (typeof type == "undefined") {
                   this.log(type)
                   throw new Error("type is undefined");
               }
               if (typeof handler == "undefined") {
                   this.log(handler);
                   throw new Error("handler is undefined");
               }
               if (typeof handlerThis == "undefined") {
                   //如果没传递第三个参数，则认为当前this是第三个
                   handlerThis = this;
               }
   
               var _this = this;
               if (!_this.hasOwnProperty("EventMap")) {
                   _this.EventMap = {};
               }
               if (_this.EventMap.hasOwnProperty(type)) {
               } else {
                   _this.EventMap[type] = [];
               }
               if (!_this.hasEventListener(type, handler, handlerThis)) {
                   _this.EventMap[type].push({fun: handler, target: handlerThis});
               }
           },
           hasEventListener: function (type, handler, handlerThis) {
               //addEventListener(type,handler,handlerThis,this);
               if (typeof type == "undefined") {
                   this.log(type)
                   throw new Error("type is undefined");
               }
               if (typeof handler == "undefined") {
                   this.log(handler);
                   throw new Error("handler is undefined");
               }
               if (typeof handlerThis == "undefined") {
                   this.log(handlerThis);
                   throw new Error("handlerThis is undefined");
               }
               var _this = this;
               if (_this.hasOwnProperty("EventMap") && _this.EventMap.hasOwnProperty(type)) {
                   for (var i = 0; i < _this.EventMap[type].length; i++) {
                       var item = _this.EventMap[type][i];
                       if (item.fun == handler && item.target == handlerThis) {
                           return true;
                       }
                   }
               }
               return false;
   
           },
           dispatchEvent: function (e) {
               var type = e.type;
               var _this = this;
               e.target = _this;
               if (!_this.hasOwnProperty("EventMap")) {
                   _this.EventMap = {};
               }
               if (_this.EventMap.hasOwnProperty(type)) {
                   var disPatchArr = [];
                   for (var i = 0; i < _this.EventMap[type].length; i++) {
                       disPatchArr.push(_this.EventMap[type][i]);
                   }
   
                   for (var i = 0; i < disPatchArr.length; i++) {
                       var eta = _this.EventMap[type];
                       var eto = eta ? eta[i] : null;
                       var target = eto ? eto.target : null;
   
                       if (target) {
                           disPatchArr[i].fun.call(target, e);
                       }
                   }
               }
               // dispatchEvent(type,data,this);
           },
           removeEventListener: function (type, handler, handlerThis) {
               var _this = this;
               if (!_this.hasOwnProperty("EventMap")) {
                   _this.EventMap = {};
               }
               if (_this.EventMap.hasOwnProperty(type)) {
                   for (var i = 0; i < _this.EventMap[type].length; i++) {
   
                       var eta = _this.EventMap[type];
                       var eto = eta ? eta[i] : null;
                       var target = eto ? eto.target : null;
   
                       if (eto && eto.fun == handler && eto.target == handlerThis) {
                           _this.EventMap[type].splice(i, 1);
                           if (_this.EventMap[type].length == 0) {
                               delete  _this.EventMap[type];
                           }
                           break;
                       }
                   }
               }
               // removeEventListener(type,handler,handlerThis,this);
           },
           destroy: function () {
               for (var key in this.EventMap) {
                   delete this.EventMap[key];
               }
               this.EventMap = null;
           },
           log: function (info) {
               logTool.log(info, this);
               // removeEventListener(type,handler,handlerThis,this);
           }
       }
       return Class;
   }();
   SOTool.shareObj("core.ClassObject", ClassObject);/**
    * Created with JetBrains WebStorm.
    * User: xuyafeng
    * Date: 15-9-14
    * Time: 上午9:49
    * To change this template use File | Settings | File Templates.
    */
   var Control = function () {
       function control(facade, model) {
           this.init(facade, model);
       };
       ClassTool.inherits(control, ClassObject);
       control.prototype.init = function (facade, model) {
           this.facade = facade;
           this.model = model;
       }
       return control;
   }();/**
    * Created with JetBrains WebStorm.
    * User: xuyafeng
    * Date: 15-9-14
    * Time: 下午1:01
    * To change this template use File | Settings | File Templates.
    */
   var Event = function () {
       function eventType() {
           this.type = arguments[0];
           this.args = arguments;
       };
       return eventType;
   }();
   SOTool.shareObj("core.Event",Event);/**
    * Created with JetBrains WebStorm.
    * User: xuyafeng
    * Date: 15-9-11
    * Time: 下午4:56
    * To change this template use File | Settings | File Templates.
    * 全局代理单里
    * 播放器整个逻辑中的单例对象
    * 播放器其他单例对象储存器
    *
    */
   
   var Facade = function () {
       var ColorManager = SOTool.getObj("manager.ColorManager");
       function facade() {
       }
       ClassTool.inherits(facade,SOTool.getObj("core.ClassObject"));
       //初始化
       facade.prototype.init = function (config) {
           this.color = new ColorManager();
           this.color.register(config);
       }
       return facade;
   }();
   SOTool.shareObj("core.Facade",Facade);/**
    * Created with JetBrains WebStorm.
    * User: xuyafeng
    * Date: 15-9-11
    * Time: 下午4:42
    * To change this template use File | Settings | File Templates.
    */
   var Proxy = function () {
       function proxy() {
       }
   
       ClassTool.inherits(proxy, ClassObject);
       proxy.prototype.load = function (data) {
           this.loader = new AutoLoader();
           this.isClose = false;
           var urls = this.getRequestList();
           if(this.requestType==2){
                this.loader.load2(urls, this.loadCmp, this.loadError, this);
           }else{
               this.loader.load(urls, this.loadCmp, this.loadError, this);
           }
       }
       proxy.prototype.getUrl = function (data) {
           if(this.loader.urlList.length>1){
               return this.loader.urlList[0].url;
           }
           return "";
       }
       /*
        * 获得请求列表
        * */
       proxy.prototype.getRequestList = function (data) {
           return [];
       }
       /*
        * 中止请求
        * */
       proxy.prototype.unload = function (data) {
           if(this.loader) this.loader.destroy();
           this.isClose = true;
       }
       /*
        *  加载后处理
        * */
       proxy.prototype.loadCmp = function (data, arg) {
           !this.isClose && this.dispatchEvent(new Event(LoadEvent.LOADCMP, [data, arg]));
       }
       /*
        * 加载错误处理
        * */
       proxy.prototype.loadError = function (data, arg) {
           !this.isClose && this.dispatchEvent(new Event(LoadEvent.LOADERROR, [data, arg]));
       }
       return proxy;
   }();
   /**
    * Created with JetBrains WebStorm.
    * User: xuyafeng
    * Date: 15-12-17
    * Time: 下午4:18
    * To change this template use File | Settings | File Templates.
    */
   var Plugin = function () {
       function plugin() {};
       ClassTool.inherits(plugin, ClassObject);
       plugin.prototype.initPlugin = function (options,callback,pconfig) {
           this.pluginCmpFun = callback;
           this.REConf =pconfig;
           if(this.REConf.hasOwnProperty(options.type)){
               var pluginItem = this.REConf[options.type];
               if(pluginItem.hasOwnProperty("check")){
                   if(typeof  pluginItem.check == 'function'){
                       if(pluginItem.check()){
                           this.load(options);
                           //return true;
                       }else{
                           options.onerror(pluginItem.err);
                       }
                   }else{
                       if(pluginItem.check){
                           this.load(options);
                           //return true;
                       }else{
                           options.onerror(pluginItem.err);
                       }
                   }
               }else{
                   this.load(options);
                   //return true;
               }
           }else{
               this.pluginCmpFun(null);
               options.onstart();
           }
           //return false;
       }
       plugin.prototype.load = function (options) {
           var me =this;
           me.pl =  this.REConf[options.type];
           SOTool.getPlugin(me.pl.name,function(plg){
               if(plg){
                   me.pluginCmpFun(plg);
               }else{
                   options.onerror({code:420,message:"插件加载错误"});
               }
           });
       }
       return plugin;
   }();/**
    * Created with JetBrains WebStorm.
    * User: xuyafeng
    * Date: 15-9-14
    * Time: 上午9:58
    * To change this template use File | Settings | File Templates.
    */
   var View = function () {
       function view(facade, model) {
           this.facade = facade;
           this.model = model;
           this.init();
       };
       ClassTool.inherits(view, ClassObject);
       view.prototype.init = function () {
           this.tplKey = "view";
           this.addEvent = true;
       }
       view.prototype.setUp = function (el, t,p) {
           if (typeof p == "undefined") {
               p = "";
           }
           var tpl = SkinRender.SkinTpl[this.tplKey] || p;
           this.el = UiTool.$E(el);
           this.skin = new DisplayObject(this.el);
           var arr = UiTool.getTemplate(this.el, tpl);
           if (t) {
               for (var i = 0; i < arr.length; i++) {
                   this.el[arr[i]] = new DisplayObject(this.el[arr[i]]);
               }
           }
           if (this.addEvent) {
               this.facade.addEventListener(SkinEvent.EVENT, this.skinHandler, this);
           }
       }
       view.prototype.skinHandler = function (e) {
       }
   
       view.prototype.setSize = function (w, h) {
       }
       view.prototype.show = function () {
           this.skin.setVisible(true);
       }
       view.prototype.hide = function () {
           this.skin.setVisible(false);
       }
       return view;
   }();
   SOTool.shareObj("core.View",View);/**
    * Created with JetBrains WebStorm.
    * User: xuyafeng
    * Date: 15-10-8
    * Time: 下午5:39
    * To change this template use File | Settings | File Templates.
    */
   var DisplayObject = function () {
       var ClassTool= SOTool.getObj("common.ClassTool");
       var ClassObject= SOTool.getObj("core.ClassObject");
       var UiTool = SOTool.getObj("common.UiTool");
       function display(el,sid) {
           this.init(el);
           if (typeof sid == "undefined") {
               sid = window.CloudSdkPlugin.skinUuid;
           }
           this.sid = sid;
       };
       ClassTool.inherits(display, ClassObject);
       /*
       *  初始化
       * */
       display.prototype.init = function (e) {
           this.el = e;
       };
       display.prototype.render = function (option) {
           if(this.el.hasAttribute("render-data")){
               var renderDataArr =videoSdkTool.split(this.el.getAttribute("render-data"),";",3);
               var renderType = renderDataArr[0];
               var renderSubtype = renderDataArr[1];
               var renderData =renderDataArr[2];
               switch(renderType){
                   case "canvas":
                       //canvas 渲染 img用户颜色转化
                       if(renderSubtype=="img"){
                           if(!this.renderCanvas){
                               var imgRenderArr = videoSdkTool.split(renderData,";",3),img = document.createElement("img"),canvas = document.createElement("canvas");
                               img.width =imgRenderArr[0];
                               img.height =imgRenderArr[1];
   
                               this.el.appendChild(canvas);
                               canvas.width = img.width;
                               canvas.height = img.height;
                               this.renderCanvas =canvas;
                               this.el.renderOption = option;
   
                               img.onload =videoSdkTool.bindFun(function(){
                                   //图片渲染完毕后不在缓存渲染信息
                                   canvas.getContext('2d').drawImage(img,0,0);
                                   UiTool.setCanvasColor(canvas,this.el.renderOption.color);
                                   delete this.el.renderOption;
                               },this)
                               img.src = imgRenderArr[2];
                           }else{
                               if(this.el.hasOwnProperty("renderOption")){
                                   this.el.renderOption = option;
                               }else{
                                   UiTool.setCanvasColor(this.renderCanvas,option.color);
                               }
                          }
                       }
                       break;
               }
              // this.el.removeAttribute("render-data")
           }
       }
       /*
       *  添加侦听
       * */
       display.prototype.addEventListener = function (type, handler, handlerThis) {
           type = UiTool.turnEvent(type);
           if (type != "-") {
               UiTool.addEvent(this.el, type, handler);
           }
       };
       /*
       *  移除侦听
       * */
       display.prototype.removeEventListener = function (type, handler, handlerThis) {
           type = UiTool.turnEvent(type);
           UiTool.removeEvent(this.el, type, handler);
       };
       /*
       *  拖拽
       * */
       display.prototype.drag = function (option) {
           UiTool.drag(this.el, option);
       }
       /*
       *  设置是否是按钮形式
       * */
       display.prototype.setButtonMode = function (flag) {
           if(flag){
               this.el.style.cursor = "pointer";
           }else{
               this.el.style.cursor = "default";
           }
       }
       /*
       *  设置元素是否可以点击
       * */
       display.prototype.setEnabled = function (flag) {
           if(flag){
               this.el.style.pointerEvents = "auto";
           }else{
               this.el.style.pointerEvents = "none";
           }
       }
       /*
       *  设置是否可见
       * */
       display.prototype.setVisible = function (v) {
           if (v) {
               this.el.style.display = "block";
               this.setAttribute({orgwidth:this.el.offsetWidth, orgheight:this.el.offsetHeight});
           } else {
               this.el.style.display = "none";
           }
       };
       /*
       *  设置是否可见
       * */
       display.prototype.getVisible = function () {
           return this.el.style.display != "none";
       };
       /*
       *  设置宽度
       * */
       display.prototype.setWidth = function (v) {
           v = v + "";
           if (v.indexOf("%") != -1) {
               this.el.style.width = v;
           } else {
               this.el.style.width = v + "px";
           }
       };
       /*
       *  获得高度
       * */
       display.prototype.getWidth = function () {
           return this.el.offsetWidth == 0 ? this.getAttribute("orgwidth") : this.el.offsetWidth;
       };
       /*
       *  设置高度
       * */
       display.prototype.setHeight = function (v) {
           v = v + "";
           if (v.indexOf("%") != -1) {
               this.el.style.height = v;
           } else {
               this.el.style.height = v + "px";
           }
       }
       /*
       *  获得高度
       * */
       display.prototype.getHeight = function () {
           return this.el.offsetHeight == 0 ? this.getAttribute("orgheight") : this.el.offsetHeight;
       }
       /*
       *  设置x轴方向
       * */
       display.prototype.setX = function (v) {
           v = v + "";
           if (v.indexOf("%") != -1) {
               this.el.style.left = v;
           } else {
               this.el.style.left = v + "px";
           }
       }
       /*
       *  获得x轴方向
       * */
       display.prototype.getX = function () {
           return this.el.offsetLeft;
       }
       /*
       *  获得y轴方向
       * */
       display.prototype.setY = function (v) {
           v = v + "";
           if (v.indexOf("%") != -1) {
               this.el.style.top = v;
           } else {
               this.el.style.top = v + "px";
           }
       }
       /*
       *  获得y周方向
       * */
       display.prototype.getY = function () {
           return this.el.offsetTop;
       }
       /*
       *  添加子节点
       * */
       display.prototype.appendChild = function (el) {
           // window.CloudSdkPlugin.skinUuid 皮肤uuid 常量x
           if (el.hasOwnProperty("el")) {
               el = el.el;
           }
           this.el.appendChild(el);
       }
   
   //    display.prototype.getColor = function () {
   //        return this.el.innerHTML;
   //    }
       display.prototype.setColor = function (c,type) {
           if(type=="bg"){
               if(this.el.hasAttribute("render-data")){
                   this.render({color:c});
               }else{
                   this.el.style.backgroundColor = c;
               }
           }else if(type=="text"){
               this.el.style.color = c;
           }else if(type=="fill"){
               this.el.firstChild.setAttribute("fill",c);
           }else if(type=="stroke"){
               this.el.firstChild.setAttribute("stroke",c);
           }
       }
   
       display.prototype.html = function (h) {
           // window.CloudSdkPlugin.skinUuid 皮肤uuid 常量x
           this.el.innerHTML = h;
       }
   
       display.prototype.gethtml = function (h) {
           // window.CloudSdkPlugin.skinUuid 皮肤uuid 常量x
           return this.el.innerHTML;
       }
   
       display.prototype.setClassName = function (str) {
           // window.CloudSdkPlugin.skinUuid 皮肤uuid 常量
           str = str.split(" ").join(this.sid + " ");
           str += this.sid;
           this.el.className = str;
       }
   
       display.prototype.hasClassName = function (str) {
           // this.sid 皮肤uuid 常量
           str = str.split(" ").join(this.sid + " ");
           str += this.sid;
           return UiTool.hasClassName(this.el, str);
       }
   
       display.prototype.addClassName = function (str) {
           // this.sid 皮肤uuid 常量
           str = str.split(" ").join(this.sid + " ");
           str += this.sid;
           UiTool.addClassName(this.el, str);
       }
   
       display.prototype.removeClassName = function (str) {
           // this.sid 皮肤uuid 常量
           str = str.split(" ").join(this.sid + " ");
           str += this.sid;
           UiTool.removeClassName(this.el, str);
       }
   
       display.prototype.getAttribute = function (name) {
           // this.sid 皮肤uuid 常量
           return this.el.getAttribute(name);
       }
   
       display.prototype.hasAttribute = function (name) {
           // this.sid 皮肤uuid 常量
           return this.el.hasAttribute(name);
       }
   
       display.prototype.setAttribute = function (str) {
           for (var key in str) {
               this.el.setAttribute(key, str[key])
           }
       }
   
       display.prototype.removeAttribute = function (str) {
           if (videoSdkTool.isArray(str)) {
               for (var i = 0; i < str.length; i++) {
                   this.el.removeAttribute(str[i]);
               }
           } else {
               this.el.removeAttribute(str);
           }
       }
   
       display.prototype.setStyle = function (str) {
           for (var key in str) {
               this.el.style[key] = str[key];
           }
       }
       return display;
   }();
   SOTool.shareObj("core.view.DisplayObject",DisplayObject);
   SOTool.shareObj("core.view.display.DisplayObject",DisplayObject);/**
    * Created with JetBrains WebStorm.
    * User: xuyafeng
    * Date: 16-4-28
    * Time: 下午4:44
    * To change this template use File | Settings | File Templates.
    *
    * 拖拽控件
    */
   var DragBar = function () {
   
       var ClassTool= SOTool.getObj("common.ClassTool");
       var ClassObject= SOTool.getObj("core.ClassObject");
       var UiTool = SOTool.getObj("common.UiTool");
       function display(el,sid,tmp) {
           this.init(el,tmp);
           if (typeof sid == "undefined") {
               sid = window.CloudSdkPlugin.skinUuid;
           }
           this.sid = sid;
       };
       ClassTool.inherits(display, ClassObject);
       /*
       *  初始化
       * */
       display.prototype.init = function (el,tmp) {
            //百分比默认为 0
           this.percent =0;
           this.view = el;
           this.rect ={x:-this.view.el.sliderOver.getWidth() *.5,y:this.view.el.sliderOver.getY(),w:this.view.el.trackBg.getWidth(),h:0};
           this.addEvents();
       }
       display.prototype.reSetRect = function () {
            this.rect ={x:-this.view.el.sliderOver.getWidth() *.5,y:this.view.el.sliderOver.getY(),w:this.view.el.trackBg.getWidth(),h:0};
       };
       /*
       *  渲染出控制组件
       * */
       display.prototype.render = function (e) {
       };
       display.prototype.setPercent = function (p) {
           this.percent = p;
           this.updateView();
       };
       /*
       *  更新视图
       * */
       display.prototype.updateView = function (e) {
           var dx = this.percent * this.view.el.trackBg.getWidth();
           this.view.el.track.setWidth(dx);
           this.view.el.sliderOver.setX(this.rect.x+dx);
       };
   
       /*
       *  开始侦听事件
       * */
       display.prototype.addEvents = function (type, handler, handlerThis) {
           var me = this;
           this.view.el.sliderOver.drag({rect:function () {
                   if(!me.rect.w|| me.rect.w<=0){
                       me.reSetRect();
                   }
                   return me.rect;
               },
               onDown:function (p) {
                   me.isSeeking = true;
               },
               onMove:function (p) {
                   me.seekHanler.apply(me, [false]);
               },
               onUp:function (p) {
                   me.seekHanler.apply(me, [true]);
                   me.isSeeking = false;
               }}
           );
       };
       display.prototype.seekHanler = function(percent){
           this.percent =(this.view.el.sliderOver.getX()-this.rect.x)/this.view.el.trackBg.getWidth();
           this.updateView();
           this.dispatchEvent(new Event("change",this.percent));
       }
       return display;
   }();
   SOTool.shareObj("core.view.conttrols.DragBar",DragBar);/**
    * Created with JetBrains WebStorm.
    * User: xuyafeng
    * Date: 15-9-14
    * Time: 下午1:34
    * To change this template use File | Settings | File Templates.
    */
   var AutoLoader = function () {
       function autoLoader() {
       };
       autoLoader.prototype = {
           load:function (arr, success, fail, handlerThis) {
               this.urlList = arr;
               var _this = this,
                   retryCount = 0,
                   time = videoSdkTool.now();
               var startLoad = function () {// [{url,timeout,maxCount,retryTime}]
                   clearTimeout(_this.delayID);
                   var url = _this.getRealUrl(_this.urlList[0]);
                   _this.log("load url:"+url);
                   videoSdkTool.getJSON(url,function (reponse, reponseArg) {
                       //请求成功
                       retryCount += reponseArg.retryCount;
                       success && success.call(handlerThis, reponse, {responseTime:videoSdkTool.now() - time, retryCount:retryCount})
                   }, function (reponse, reponseArg) {
                       //debugger;
                       //请求失败
                       if (_this.urlList.length > 1) {
                           retryCount += _this.urlList[0].maxCount;
                           _this.urlList.shift();
                           _this.delayID = setTimeout(startLoad,_this.urlList[0].retryTime);
                       } else {
                           retryCount += reponseArg.retryCount;
                           fail && fail.call(handlerThis, null, {responseTime:videoSdkTool.now() - time, retryCount:retryCount})
                       }
                   }, _this.urlList[0].timeout, _this.urlList[0].maxCount, _this.urlList[0].retryTime);
               }
               startLoad();
           },
           load2:function (arr, success, fail, handlerThis) {
               this.urlList = arr;
               var _this = this,
                   retryCount = 0,
                   time = videoSdkTool.now();
               var startLoad = function () {// [{url,timeout,maxCount,retryTime}]
                   clearTimeout(_this.delayID);
                   var url = _this.getRealUrl(_this.urlList[0]);
                   _this.log("load url:"+url);
                   videoSdkTool.getJSONbyAjax(url, function (reponse, reponseArg) {
                       //请求成功
                       retryCount += reponseArg.retryCount;
                       success && success.call(handlerThis, reponse, {responseTime:videoSdkTool.now() - time, retryCount:retryCount})
                   }, function (reponse, reponseArg) {
                       //debugger;
                       //请求失败
                       if (_this.urlList.length > 1) {
                           retryCount +=_this.urlList[0].maxCount;
                           _this.urlList.shift();
                           _this.delayID = setTimeout(startLoad,_this.urlList[0].retryTime);
                       } else {
                           retryCount += reponseArg.retryCount;
                           fail && fail.call(handlerThis, null, {responseTime:videoSdkTool.now() - time, retryCount:retryCount})
                       }
                   }, _this.urlList[0].timeout, _this.urlList[0].maxCount, _this.urlList[0].retryTime);
               }
               startLoad();
           },
           getRealUrl:function(opt){
               if(videoSdkTool.isFunction(opt.url)){
                   if(opt.hasOwnProperty("args")){
                       return opt.url(opt.args);
                   }else{
                       return opt.url();
                   }
               }
               return opt.url;
           },
           destroy:function () {
               clearTimeout(this.delayID);
           },
           log:function (info) {
               logTool.log(info, this);
               // removeEventListener(type,handler,handlerThis,this);
           }
       }
       return autoLoader;
   }();/**
    * Created with JetBrains WebStorm.
    * User: xuyafeng
    * Date: 15-9-8
    * Time: 下午5:27
    * To change this template use File | Settings | File Templates.
    */
   var Timer = function Timer() {
       function Timerfun(delay, me, handler, maxNum) {
           /*
            *  延时时间
            * */
           this.delay = delay;
           this.timerHandler = handler;
           this.handlerThis = me;
           if (typeof maxNum == "undefined") {
               maxNum = 0;
           }
           this.max = maxNum;
           this.T = 0;
           /*
            *  当前运行次数
            * */
           this.currentCount = 0;
           /*
            * 是否在运行
            * */
           this.running = true;
       }
   
       Timerfun.prototype = {
           /*
            * 开始计时
            * */
           start:function () {
               var me = this;
               me.running = true;
               me.checkTime(false);
           },
           /*
            * 心跳处理
            * */
           checkTime:function (f) {
               var me = this;
               //先清除，然后执行函数，再继续执行心跳
               clearTimeout(this.T);
               if (f) {
                   me.currentCount++;
                   me.timerHandler.call(me.handlerThis);
                   if (me.max > 0 && me.currentCount >= me.max) {
                       me.stop();
                       return;
                   }
               }
               me.T = setTimeout(function () {
                   me.checkTime.call(me, true);
               }, me.delay);
           },
           /*
            * 停止计时
            * */
           stop:function () {
               this.running = false;
               clearTimeout(this.T);
           },
           /*
            * 重置计时
            * */
           reset:function () {
               this.stop();
               this.currentCount = 0;
           },
           /*
            * 清除
            * */
           clear:function () {
               this.delay = null;
               this.timerHandler = null;
               this.handlerThis = null;
               this.T = 0;
           }
       }
       return Timerfun;
   }();
   SOTool.shareObj("core.util.Timer",Timer);/**
    * Created with JetBrains WebStorm.
    * User: xuyafeng
    * Date: 16-4-26
    * Time: 下午8:31
    * To change this template use File | Settings | File Templates.
    */
   //ui渲染控制器
   var SkinRender = {
       SkinTpl:"",
       setPlayerCss:function(id){
           //播放器全局设置,防止外部css污染
           var videoCss ='{id} img{'+
                    'width: auto !important;'+
                    'height: auto !important;'+
               '}';
           if(id!=""){
               id ="."+id+" ";
           }
           videoCss = videoCss.replace(/{id}/g,id);
           UiTool.loadCss(videoCss);
       },
       setMediacontrols:function(id,f){
           var videoCss ='{id}video::-webkit-media-controls-enclosure,'+
               '{id}video::-webkit-media-controls {'+
               'display: {dislay} !important;'+
               '}';
           if(id!=""){
               id ="."+id+" ";
           }
           videoCss = videoCss.replace(/{id}/g,id);
           videoCss =f?videoCss.replace("{dislay}",""):videoCss.replace("{dislay}","none");
           UiTool.loadCss(videoCss);
       },
       setMediafullscreen:function(id,f){
           var videoCss ='{id}video::-webkit-media-controls-fullscreen-button {'+
               'display: {dislay} !important;'+
               '}';
           if(id!=""){
               id ="."+id+" ";
           }
           videoCss = videoCss.replace(/{id}/g,id);
           videoCss =f?videoCss.replace("{dislay}",""):videoCss.replace("{dislay}","none");
           UiTool.loadCss(videoCss);
       },
       getSkinTpl:function(tpl,CSS_TEMPLATE,BGP,renOpt){
           if (SkinRender.SkinTpl != "") return;
           if (typeof window.CloudSdkPlugin == "undefined") {
               window.CloudSdkPlugin = {}
           }
           window.CloudSdkPlugin.skinUuid = videoSdkTool.creatUuid();
           var SkinTplUUid = window.CloudSdkPlugin.skinUuid;
           var uuid = SkinTplUUid;
           CSS_TEMPLATE = CSS_TEMPLATE.replace(/{#BGP}/g, BGP);
           CSS_TEMPLATE = CSS_TEMPLATE.replace(/{#}/g, uuid);
           UiTool.loadCss(CSS_TEMPLATE);//"<div id='#{videoArea}' class='videoArea{#}'></div>"+"
           for (var key in tpl) {
               tpl[key] = tpl[key].replace(/{#}/g, uuid);
               var yArr = tpl[key].match(/{[a-z_A-Z0-9]{1,}\.[a-z_A-Z0-9]{1,}}/g) || [];
               for(var i=0;i<yArr.length;i++){
                   var curArr = yArr[i].replace(/{|}/g,"").split(".");
                   var k =curArr[0];
                   var vk =curArr[1];
                   if(renOpt&&renOpt.hasOwnProperty(k)&&renOpt[k].hasOwnProperty(vk)){
                       if(k=="svg"){
                           tpl[key] = tpl[key].replace(yArr[i],renOpt[k][vk].src);
                       }else{
                           var result =[k,renOpt[k][vk].width,renOpt[k][vk].height,renOpt[k][vk].src].join(";");
                           tpl[key] = tpl[key].replace(yArr[i],result);
                       }
                   }
               }
           }
           SkinRender.SkinTpl = tpl;
       }
   }
   SOTool.shareObj("core.SkinRender", SkinRender);/**
    * Created with JetBrains WebStorm.
    * User: xuyafeng
    * Date: 15-9-14
    * Time: 下午3:10
    * To change this template use File | Settings | File Templates.
    */
   var AdEvent = function () {
       return {
           EVENT:"adEvent",
           HEADSTART:"adHeadPlayStart",
           HEADEND:"adHeadPlayComplete",
           NOAD:"adHeadPlayNone"
       }
   }();
   SOTool.shareObj("event.AdEvent",AdEvent);/**
    * Created with JetBrains WebStorm.
    * User: xuyafeng
    * Date: 15-9-11
    * Time: 下午6:00
    * To change this template use File | Settings | File Templates.
    */
   var LoadEvent = function () {
       return {
           LOADCMP:"loadcmp",
           LOADERROR:"loaderror"
       }
   }();
   SOTool.shareObj("event.LoadEvent",LoadEvent);/**
    * Created with JetBrains WebStorm.
    * User: xuyafeng
    * Date: 15-9-14
    * Time: 下午2:52
    * To change this template use File | Settings | File Templates.
    */
   var PlayerEvent = function () {
       return {
           EVENT:"playerEvent",
           //播放器准备完毕
           INIT:"playerInit",
           VIDEO_AUTH_VALID:"videoAuthValid",
           VIDEO_DATA_START:"videoDataStart",
           VIDEO_DATA_CMP:"videoDataCmp",
           GSLB_START:"gslbStart",
           GSLB_CMP:"gslbCmp",
           VPH:"videoPageHide",
           VPS:"videoPageShow",
           WPH:"webPageHide",
           ERROR:"playerError",
           RESIZE:"playerResize",
           VIDEO_INFO:"videoInfo",
           FULLSCREEN:"fullscreen",
           PRESIZE:"resize",
           VIDEO_LIVESTOP:"videoLiveStop",
           VIDEO_INTERRUPT:"videoLiveInterupt",
           USER_INFO:"user_info",
           NEXT:"playNext",
           POINT:"point",
           DELPOINT:"delPoint",
           CHANGESTREAM:"changeStream"
       }
   }();
   SOTool.shareObj("event.PlayerEvent",PlayerEvent);/**
    * Created with JetBrains WebStorm.
    * User: xuyafeng
    * Date: 15-9-16
    * Time: 上午10:04
    * To change this template use File | Settings | File Templates.
    */
   var MediaEvent = function () {
       return {
           EVENT:"MediaEvent",
           CONNECT:"videoConnect",
           START:"videoStart",
           PLAY:"videoResume",
           STOP:"videoStop",
           COMPLETE:"video_complete",
           PAUSE:"videoPause",
           BUFFEREMPTY:"videoEmpty",
           BUFFEREFULL:"videoFull",
           SEEK:"videoSeek",
           SEEKEMPTY:"videoSeekEmpty",
           PLAYING:"videoPlaying",
           LODING:"videoLoading",
           METADATA:"MetaData",
           DURATION:"videoDuration",
           DEFSTART:"swapDefinition",
           ERROR:"videoError",
           VOL:"vol",
           REPLAY:"videoReplay",
           SPLAYRATE:"swapPlaybackRate",
           SMACHINE:"swapMachine"
   //        FULLSCREEN:"videoFullscreen",
   //        EXITFULLSCREEN:"videoExitFullscreen"
       }
   }();
   SOTool.shareObj("event.MediaEvent",MediaEvent);/**
    * Created with JetBrains WebStorm.
    * User: xuyafeng
    * Date: 15-9-18
    * Time: 下午1:52
    * To change this template use File | Settings | File Templates.
    */
   var SkinEvent = function () {
       return {
           EVENT:"skinEvent",
           PLAY:"skinPlay",
           PAUSE:"skinPause",
           SETDEFINITION:"setDefinition",
           SEEK:"skinSeek",
           VOLUME:"skinVolume",
           FULLSCREEN:"skinFullScreen",
           REPLAY:"skinReplay",
           POINT:"skinPoint",
           DELPOINT:"skinDelPoint",
           PLAYBACKRATE:"skinPlaybackRate",
           MACHINE:"skinChangeMachine",
           ROTATE:"skinRotate"
       }
   }();
   SOTool.shareObj("event.SkinEvent",SkinEvent);/**
    * Created with JetBrains WebStorm.
    * User: xuyafeng
    * Date: 15-8-26
    * Time: 上午11:56
    * To change this template use File | Settings | File Templates.
    */
   var Model = function () {
       var LECOOKIE = "lc";
       function SystemData() {
           //pc 表示系统是否在pc上运行
           var keys = ["mac", "nt", "os", "osv", "app", "bd", "xh", "ro", "cs", "ssid", "lo", "la"], me = this;
           for (var i = 0; i < keys.length; i++) {
               this[keys[i]] = "";
           }
           this.refresh = function (info) {
               for (var key in info) {
                   me[key] = info[key];
               }
           }
       }
   
       function Config() {
           //全局涉及到皮肤 功能的相关配置
           var  me = this;
           this.autoplay = 0;
           this.refresh = function (info) {
               for (var key in info) {
                    me[key] = info[key];
               }
           }
       }
   
       function PlayerConfig() {
           //播放器相关 配置，logo 水印  播放器版本号 播放器原始长宽值
           var me = this;
           this.refresh = function (info) {
               for (var key in info) {
                   me[key] = info[key];
               }
           }
       }
   
       function UserConfig() {
           var option = ["userId"], me = this
           for (var i = 0; i < option.length; i++) {
               this[option[i]] = "";
           }
           this.refresh = function (info) {
               for (var key in info) {
                   me[key] = info[key];
               }
           }
       }
   
       //视频数据设置
       function VideoSetting() {
           var option = ["title", "duration", "volume", "definition", "defaultDefinition", "fullscreen", "percent", "time", "url", "videoWidth", "videoHeight"], me = this;
           for (var i = 0; i < option.length; i++) {
               this[option[i]] = "";
           }
           this.definitionCount = 0;
           this.refresh = function (info) {
               for (var key in info) {
                   me[key] = info[key];
               }
           }
       }
   
       function model() {
           this.systemData = new SystemData();
           this.config = new Config();
           this.reportParam = {};
           this.clear();
       }
   
       model.prototype = {
           init:function (data) {
               //产生唯一的app值
               switch (this.platform) {
                   case "sdk":
                       this._uuid = "";
                       this.playType = data.ptype;
                       delete data.ptype;
                       var keyList =["autoplay","uu","vu","liveId","streamId","activityId","lang"];
                       for(var i =0;i<keyList.length;i++){
                           var key = keyList[i];
                           if(data.hasOwnProperty(key)){
                               this.config[key] = data[key];
                               delete data[key];
                           }
                       }
                       this.systemData.refresh(data);
                       logTool.log("[Stat K] " + " model init:" + this.systemData.deviceId +"  _2019-05-14 11:04:25.748");
                       this._apprunid = this.systemData.deviceId + "_" + videoSdkTool.now();
                       break;
                   case "html5":
                       this.systemData.refresh(data);
                       this._apprunid = this.lc()+ "_" + videoSdkTool.now();
                       break;
               }
           },
           clear:function () {
               this._uuid = "";
               this._lc = videoSdkTool.getLocal(LECOOKIE);
               //初始化系统数据
               this.userData = new UserConfig();
               this.videoSetting = new VideoSetting();
               this.playerConfig = new PlayerConfig();
               this.platform = "html5";
               this.playType = "vod";
           },
           uuid:function () {
               //如果是sdk，uuid则去sdk接口中得到
               if(this.platform=="sdk"){
                   if(this.videoSetting.hasOwnProperty("uuid")&&this.videoSetting.uuid.length>6){
                       return this.videoSetting.uuid;
                   }else{
                       var info = ExternalInterface.callSDK(this.systemData.os, "getVideoSetting", "");
                       this.videoSetting.refresh(info);
                       if(this.videoSetting.hasOwnProperty("uuid")&&this.videoSetting.uuid.length>6){
                           return this.videoSetting.uuid;
                       }
                   }
               }
               if (this._uuid == "") {
                   this._uuid = videoSdkTool.creatUuid();
               }
               return this._uuid + "_" + this.videoSetting.definitionCount;
           },
           clearUuid:function () {
               this._uuid = "";
           },
           lc:function () {
               if (this._lc == null) {
                   this._lc = videoSdkTool.creatUuid();
                   videoSdkTool.setLocal(LECOOKIE, this._lc);
               }
               return this._lc;
           },
           getTypeFrom:function () {
               var a = videoSdkTool.getUrlParams("ch");
               if (a) return a.toString();
               try {
                   if(this.userInfo().userId!=""){
                       return  "bcloud_" + this.userInfo().userId;
                   }
               } catch (e) {}
               return "letv";
           },
           apprunid:function () {
               return this._apprunid;
           },
           auid:function () {
               return this.systemData.deviceId;
           },
           pcode:function () {
               return "-";
           },
           videoInfo:function () {
               switch (this.platform) {
                   case "sdk":
                       var info = ExternalInterface.callSDK(this.systemData.os, "getVideoSetting", "");
                       if (!info.hasOwnProperty("cid") || info.cid == "") info.cid = 100;
                       if (info.hasOwnProperty("liveid")) {
                           info.lid = info.liveid;
                           delete info.liveid;
                       }
                       if (info.hasOwnProperty("time")&&info.time=="") {
                           info.time ="0";
                       }
                       this.videoSetting.refresh(info);
                       return info;
                       break;
                   case "html5":
                       var info = this.api.getVideoInfo();
                       this.videoSetting.refresh(info);
                       return info;
                       break;
               }
           },
           userInfo:function () {
               switch (this.platform) {
                   case "sdk":
                       if (this.userData.userId == "") {
                           var info = ExternalInterface.callSDK(this.systemData.os, "getUserSetting", "");
                           this.userData.refresh(info);
                       }
                       return this.userData;
                       break;
                   case "html5":
                       return this.userData;
                       break;
               }
           }
       }
       return model;
   }();/**
    * Created with JetBrains WebStorm.
    * User: xuyafeng
    * Date: 16-8-2
    * Time: 下午1:59
    * To change this template use File | Settings | File Templates.
    */
   /**
    * Created with JetBrains WebStorm.
    * User: xuyafeng
    * Date: 15-12-3
    * Time: 上午11:05
    * To change this template use File | Settings | File Templates.
    */
   /**
    * Created with JetBrains WebStorm.
    * User: xuyafeng
    * Date: 15-9-11
    * Time: 上午11:29
    * To change this template use File | Settings | File Templates.
    */
   var UrlProxy = function () {
       function cloudVodProxy(model) {
           this.model = model;
           this.model.defaultDefinitionList = [];
       }
       ClassTool.inherits(cloudVodProxy, Proxy);
       cloudVodProxy.prototype.load = function (data) {
           var model = this.model;
   
          // videoSetting.pic = data.videoinfo.pic;
          // videoSetting.vid = data.videoinfo.vid;
          // videoSetting.cid = data.videoinfo.cid;
         //  videoSetting.pid = data.videoinfo.pid;
         //  videoSetting.title = data.videoinfo.name;
        //   videoSetting.duration = data.videoinfo.duration;
        //   videoSetting.defaultDefinition = data.videoinfo.medialist[0].vtype;
        //   videoSetting.isdrm = data.videoinfo.isdrm;
        //   videoSetting.ark = data.videoinfo.ark;
        //   videoSetting.mmsid = data.videoinfo.mmsid;
        //   videoSetting.pano= data.videoinfo.pa;
           var playerData = {};
           playerData.mloadingUrl = "";
           playerData.logo ={
               pic:""
           };
           //playerData.watermark = "";
           model.playerConfig.refresh(playerData);
           var videoSetting = {};
           videoSetting.ark= 0;
           videoSetting.gslb = false;
           var media = {},key="13";
           media[key]={};
           media[key].vtype = "13";
           media[key].definition = "原画";
           media[key].urls = [model.config.url];
           videoSetting.isdrm = 0;
          // media[key].videoType = item.urllist[0].videotype;
           //设置码流列表
           model.defaultDefinitionList.push(key);
           videoSetting.media = media;
           model.videoSetting.refresh(videoSetting);
           this.dispatchEvent(new Event(LoadEvent.LOADCMP, [data]));
   
       }
       cloudVodProxy.prototype.reload = function () {
           this.unload();
           this.superClass.load.call(this);
       }
       return cloudVodProxy;
   }();/**
    * Created with JetBrains WebStorm.
    * User: xuyafeng
    * Date: 15-12-3
    * Time: 上午11:05
    * To change this template use File | Settings | File Templates.
    */
   /**
    * Created with JetBrains WebStorm.
    * User: xuyafeng
    * Date: 15-9-11
    * Time: 上午11:29
    * To change this template use File | Settings | File Templates.
    */
   var CloudVodProxy = function () {
       var CONST_CONFIG={
           PET:MD5.hash("gpc_pet"),
           PLAYERINFO:MD5.hash("gpc_playerInfo")
       }
       function cloudVodProxy(model) {
           this.model = model;
           this.model.defaultDefinitionList = [];
       }
       ClassTool.inherits(cloudVodProxy, Proxy);
       cloudVodProxy.prototype.load = function (data) {
           this.curTime = 0;
           this.superClass.load.call(this,data);
       }
       /*
        * override 组合数组
        * */
       cloudVodProxy.prototype.getRequestList = function () {
           var timeout = 5000,
               maxCount = 3,
               retryTime = 0,
               result = [],
               replace = "//api.letvcloud.com/",
               //ipList = ["//106.39.244.239/", "//111.206.211.221/", "//223.95.79.18/"],
               ipList = ["//36.110.219.232/", "//111.206.208.64/", "//123.59.126.233/"],
               param ={
                   cf:this.getCf(),
                   ran:this.getCurTime(),
                   pver:this.model.playerConfig.version,
                   bver:encodeURIComponent(videoSdkTool.getBrowserVersion()),
                   uuid: this.model.uuid(),
                   pf:"html5",
                   spf:this.getSpf()
               },
               url = DomainTool.getDomain("http://api.letvcloud.com",this.model.config.lang) + "/gpc.php?format=jsonp&ver=2.4";
           var addParamList = ["ark", "uu", "vu", "payer_name", "check_code", "pu","lang","cuid","utoken"];//{vu:option.vu, uu:option.uu,payer_name:option.payer_name,check_code:option.check_code};
           for (var i = 0; i < addParamList.length; i++) {
               var key = addParamList[i];
               if (this.model.config.hasOwnProperty(key)) {
                   param[key] = this.model.config[key];
               }
           }//,"uu"+param.uu,"bver"+param.bver, sign= md5(cf+uu+vu+ran+key)
   
           param.pet = Math.max(0,videoSdkTool.getLocal(CONST_CONFIG.PET,false)+0);
           param.sign  = this.getSign([param.cf,param.uu,param.vu,param.ran]);
           for(var key in param){
               url+="&"+key+"="+param[key];
           }
   
           url +="&page_url=" + encodeURIComponent(window.location.href);
          // result.push({url:url, timeout:timeout, maxCount:maxCount, retryTime:retryTime});
           result.push({url:url, timeout:timeout, maxCount:maxCount, retryTime:retryTime});
           for (var i = 0; i < ipList.length; i++) {
               if (result[0].url.indexOf(replace) != -1) {
                   var newUrl = url.replace(replace, ipList[i]);
                   result.push({url:newUrl, timeout:timeout, maxCount:maxCount, retryTime:retryTime});
               }
           }
           return result;
       }
   
   
       cloudVodProxy.prototype.getSign = function (arr) {
           //window.console && window.console.log(arr);
           //window.console && window.console.log("cf ran uu ber vu"+arr.join("")+"----------key:fbeh5player12c43eccf2bec3300344");
           return MD5.hash(arr.join("")+"fbeh5player12c43eccf2bec3300344");
       }
       cloudVodProxy.prototype.getCurTime = function (arr) {
           if(this.curTime!= 0){
               return this.curTime;
           }
           return parseInt(videoSdkTool.now()*0.001);
       }
       cloudVodProxy.prototype.getCf = function () {
           switch(videoSdkTool.getDevice()){
               case "ipad":
               case "iphone":
                   return "html5_ios";
                   break;
           }
           return "html5";
       }
       cloudVodProxy.prototype.getSpf = function () {
           var pf = videoSdkTool.getDevice();
           var platObj = {
               androidPhone:0,
               iphone:1,
               letvTv:2,
               ipad:3,
               androidPad:4
           };
           if (platObj.hasOwnProperty(pf)) {
               return platObj[pf];
           }
           return 0;
       }
       /*
        * override 加载后处理 数据处理
        * */
       cloudVodProxy.prototype.loadCmp = function (data, arg) {
           if (this.isClose) return;
           var model = this.model;
           this.log("gpc ok data:"+jsonTool.jsonToString(data)+"----time:"+ jsonTool.jsonToString(arg));
           //解析gpc数据
           if (data.code == 0) {
               data = data.data;
               var uesrData = {};
               uesrData.userId = data.userinfo.userid;
               model.userData.refresh(uesrData);
               var playerData = {};
               var pet = videoSdkTool.getLocal(CONST_CONFIG.PET,false);
               if(pet==data.playerinfo.pet||!data.playerinfo.hasOwnProperty("logo")){
                   var playerinfo = jsonTool.stringToJson(videoSdkTool.getLocal(CONST_CONFIG.PLAYERINFO));
                   data.playerinfo = playerinfo;
               }else{
                   videoSdkTool.setLocal(CONST_CONFIG.PLAYERINFO, jsonTool.jsonToString(data.playerinfo),false)
               }
               var newKeys ={buttonColor:"fault",progressBarColor:"active"};
               var playerData = {};
               playerData.mloadingUrl = data.playerinfo.loadingpic;
               playerData.logo = data.playerinfo.logo;
               playerData.watermark = data.playerinfo.watermark;
               model.playerConfig.refresh(playerData);
               if(!model.outConfig.hasOwnProperty("nskin")&&data.playerinfo.hasOwnProperty("nskin")){
                   model.config.nskin =data.playerinfo.nskin;
               }
               //将消息给配置
               for(var key in data.playerinfo.onoff){
                   if(newKeys.hasOwnProperty(key)){
                       data.playerinfo.onoff[newKeys[key]] = data.playerinfo.onoff[key];
                       delete data.playerinfo.onoff[key];
                       key =newKeys[key];
                   }
                   if(!model.outConfig.hasOwnProperty(key)){
                       if(model.config.hasOwnProperty(key)){
                           if(typeof model.config[key] == "boolean"){
                               model.config[key] =  data.playerinfo.onoff[key]=="1";
                           }
                       }else{
                           model.config[key] =  data.playerinfo.onoff[key];
                       }
                   }
               }
               //国外版本，皮肤一律使用新皮肤
               if(model.config.lang!="zh_CN") {
                   model.config.nskin= 7;
                   model.config.share =false;
               }
               var videoSetting = {};
               videoSetting.pic = data.videoinfo.pic;
               //"vid","pid","cid","title","duration","liveid","sid","volume","definition","defaultDefinition","fullscreen","percent","time","url","videoWidth","videoHeight"
               videoSetting.vid = data.videoinfo.vid;
               videoSetting.cid = data.videoinfo.cid;
               videoSetting.pid = data.videoinfo.pid;
               videoSetting.title = data.videoinfo.name;
               videoSetting.duration = data.videoinfo.duration;
               videoSetting.defaultDefinition = data.videoinfo.medialist[0].vtype;
               videoSetting.isdrm = data.videoinfo.isdrm;
               videoSetting.ark = data.videoinfo.ark;
               videoSetting.mmsid = data.videoinfo.mmsid;
               videoSetting.pano= data.videoinfo.pa;
               videoSetting.needbuy=data.videoinfo.needbuy;
               videoSetting.tryLookTime=data.videoinfo.tryLookTime;
               if(data.videoinfo.hasOwnProperty("businessline")){
                   videoSetting.p = data.videoinfo.businessline;
               }
               if(data.videoinfo.hasOwnProperty("point")){
                   videoSetting.point = data.videoinfo.point;
               }
               if(data.videoinfo.hasOwnProperty("seekRange")){
                   if(!model.outConfig.hasOwnProperty("seekRange")){
                       model.config.seekRange =  data.videoinfo.seekRange;
                   }
               }
               var media = {};
               for (var i =0;i< data.videoinfo.medialist.length;i++) {
                   var key = "",item = data.videoinfo.medialist[i];
                   /*if(item.definition == "标清"){
                    key = "low";
                    }*/
                   key = item.vtype;
                   media[key] = {};
                   media[key].urls = [];
                   for (var j = 0; j < item.urllist.length;j++) {
                       media[key].urls.push(this.checkGslbUrl(BaseCode.decode(item.urllist[j].url)));
                   }
                   media[key].videoWidth = item.vwidth;
                   media[key].videoHeight = item.vheight;
                   media[key].gbr = item.gbr;
                   media[key].vtype = item.vtype;
                   media[key].definition = item.definition;
                   media[key].videoType = item.urllist[0].videotype;
                   //设置码流列表
                   model.defaultDefinitionList.push(key);
               }
               videoSetting.media = media;
               videoSdkTool.setLocal(CONST_CONFIG.PET, data.playerinfo.pet,false)
               model.videoSetting.refresh(videoSetting);
   
               this.dispatchEvent(new Event(LoadEvent.LOADCMP, [data, arg]));
           } else {
               if(data.code=="10071"){
                   this.curTime = data.timestamp;
                   this.reload();
               }else{
                   this.dispatchEvent(new Event(LoadEvent.LOADERROR, [
                       {code:ERR.VOD_MMSID_ANALY, message:data.message},//data.message
                       arg
                   ]));
               }
           }
       }
       cloudVodProxy.prototype.reload = function () {
           this.unload();
           this.superClass.load.call(this);
       }
       /*
        *  在ios设备上强制设置tss = ios；
        * */
       /*
        *  在ios设备上强制设置tss = ios；
        * */
       cloudVodProxy.prototype.checkGslbUrl = function (url) {
           switch(videoSdkTool.getDevice()){
               case "ipad":
               case "iphone":
                   if(url.indexOf("&tss=ios&")==-1){
                       if(url.indexOf("&tss=no&")!=-1){
                           url = url.replace("&tss=no&","&tss=ios&");
                       }else{
                           url +="&tss=ios";
                       }
                   }
                   break;
           }
           return url;
       }
       cloudVodProxy.prototype.loadError = function (data, arg) {
           if (this.isClose) return;
           this.dispatchEvent(new Event(LoadEvent.LOADERROR, [
               {code:ERR.VOD_CONFIG_IO,errInfo:"url:"+this.getUrl()},
               arg
           ]));
       }
       return cloudVodProxy;
   }();/**
    * Created with JetBrains WebStorm.
    * User: xuyafeng
    * Date: 15-9-11
    * Time: 上午11:29
    * To change this template use File | Settings | File Templates.
    */
   var CloudMmsProxy = function () {
       function cloudVodProxy(model) {
           this.model = model;
           this.model.defaultDefinitionList = [];
       }
       var CONST_CONFIG={
           PET:MD5.hash("mms_pet"),
           PLAYERINFO:MD5.hash("mms_playerInfo")
       }
       ClassTool.inherits(cloudVodProxy, Proxy);
       /*
        * override 组合数组
        * */
       cloudVodProxy.prototype.getRequestList = function () {
           var timeout = 5000,
               maxCount = 3,
               retryTime = 0,
               result = [],
               replace = "//api.mms.lecloud.com/",
               ipList = [], ////106.39.244.239,111.206.211.221,223.95.79.18
               MMS = DomainTool.getDomain("http://api.mms.lecloud.com/v2/mms/play",this.model.config.lang);//"http://api.mms.lecloud.com/v2/mms/play";
           var addParamList = ["cf", "uu", "vu", "format", "callback", "pageurl", "pver", "ran", "ver", "p", "pu", "pet", "userId", "utoken"];//{vu:option.vu, uu:option.uu,payer_name:option.payer_name,check_code:option.check_code};
           var params = {};
           //CONST_CONFIG.PET = this.model.config.uu +  CONST_CONFIG.PET;
           //获得params
           for (var i = 0; i < addParamList.length; i++) {
               var key = addParamList[i];
               if (this.model.config.hasOwnProperty(key)) {
                   params[key] = this.model.config[key]
               }
           }
           params.cf = this.getCf();
           params.p = this.model.config.p;
           params.format = "jsonp";
           params.pver = this.model.playerConfig.version;
           params.ran = this.getCurTime();
           params.pet = Math.max(0,videoSdkTool.getLocal(CONST_CONFIG.PET,false)+0);
           params.ver = "1.0";
           result.push({url:videoSdkTool.bindFun(getUrl, this), timeout:timeout, maxCount:maxCount, retryTime:retryTime});
           for (var i = 0; i < ipList.length; i++) {
               result.push({url:result[0].url, timeout:timeout, maxCount:maxCount, retryTime:retryTime,args:ipList[i]});
           }
           return result;
           function getUrl(ip) {
               params.callback = 'vbk' + videoSdkTool.now() + Math.floor(Math.random() * 100);
               var url = MMS;
               url += "?cf=" + params.cf;
               for (var key in params) {
                   if (key != "cf") {
                       url += "&" + key + "=" + encodeURIComponent(params[key]);
                   }
               }
               params.pageurl = window.location.href;
               var sign = this.getSign(params);//MD5.hash(this.getCf()+this.model.config.uu+this.model.config.vu+ran+"04c5e1e616f668bc559af2afa98b9a25");
               //pageurl 扔到最好，防止cdn搞没
               url += "&sign=" + sign + "&pageurl=" + encodeURIComponent(params.pageurl);
               if (typeof ip != "undefined") {
                   url = url.replace(replace, ip);
               }
               return url;
           }
       }
       cloudVodProxy.prototype.getSign = function (opts) {
   //        cf =  "html5_pc", "html5_ios", "html5_android“  h5开头的其他值
   //        sign= md5(所有参数key按照字符序排序之后拼接对应的value+key);
           var keys = [];
           for (var key in opts) {
               keys.push(key);
           }
           keys.sort();
          // console.log("md5前keys-----", keys);
           var values = "";
           for (var i = 0; i < keys.length; i++) {
               values += opts[keys[i]];
           }
         //console.log("md5前-----", values + "04c5e1e616f668bc559af2afa98b9a25");
           return MD5.hash(values + "04c5e1e616f668bc559af2afa98b9a25");
       }
       cloudVodProxy.prototype.getCf = function () {
           //h5-win h5-mac h5-iostv h5-androidtv h5-android h5-ios h5-ipad
           switch (videoSdkTool.getDevice()) {
               case "ipad":
                   return "h5-ipad";
               case "iphone":
                   return "h5-ios";
                   break;
               case "androidPad":
                   return "h5-androidpad";
                   break;
               case "androidPhone":
                   return "h5-android";
                   break;
               case "wph":
               case "pc":
                   return "h5-win"
                   break;
               case "mac":
                   return "h5-mac"
                   break;
           }
           if (this.model.config.hasOwnProperty("cf")) {
               return this.model.config.cf;
           }
           return "other";
       }
       cloudVodProxy.prototype.getSpf = function () {
           var pf = videoSdkTool.getDevice();
           var platObj = {
               androidPhone:0,
               iphone:1,
               letvTv:2,
               ipad:3,
               androidPad:4
           };
           if (platObj.hasOwnProperty(pf)) {
               return platObj[pf];
           }
           return 0;
       }
       cloudVodProxy.prototype.getCurTime = function (arr) {
           if (this.curTime) {
               return this.curTime;
           }
           return parseInt(videoSdkTool.now() * 0.001);
       }
       /*
        * override 加载后处理
        * */
       cloudVodProxy.prototype.loadCmp = function (data, arg) {
           if (this.isClose) return;
           var model = this.model;
           //解析gpc数据
           if (data.code == 0) {
               data = data.data;
               var uesrData = {};
               uesrData.userId = data.userinfo.userid;
               model.userData.refresh(uesrData);
               //从本地获取播放器配置信息。这玩意是要命呢。
   
               var pet = videoSdkTool.getLocal(CONST_CONFIG.PET,false);
               if(pet==data.playerinfo.pet||!data.playerinfo.hasOwnProperty("logo")){
                   var playerinfo = jsonTool.stringToJson(videoSdkTool.getLocal(CONST_CONFIG.PLAYERINFO));
                   data.playerinfo = playerinfo;
               }else{
                   videoSdkTool.setLocal(CONST_CONFIG.PLAYERINFO, jsonTool.jsonToString(data.playerinfo),false)
               }
               var playerData = {};
               playerData.mloadingUrl = data.playerinfo.loadingpic;
               playerData.logo = data.playerinfo.logo;
               playerData.watermark = data.playerinfo.watermark;
               model.playerConfig.refresh(playerData);
   
               //将消息给配置
               var newKeys ={buttonColor:"fault",progressBarColor:"active"};
               for(var key in data.playerinfo.onoff){
                   if(newKeys.hasOwnProperty(key)){
                       data.playerinfo.onoff[newKeys[key]] = data.playerinfo.onoff[key];
                       delete data.playerinfo.onoff[key];
                       key =newKeys[key];
                   }
                   if(!model.outConfig.hasOwnProperty(key)){
                       model.config[key] =  data.playerinfo.onoff[key];
                   }
               }
               //国外版本，皮肤一律使用新皮肤
               if(model.config.lang!="zh_CN") {
                   model.config.share =false;
               }
               model.config.nskin=8;
               var videoSetting = {};
               //"vid","pid","cid","title","duration","liveid","sid","volume","definition","defaultDefinition","fullscreen","percent","time","url","videoWidth","videoHeight"
               videoSetting.vid = data.videoinfo.vid;
               videoSetting.cid = data.videoinfo.cid;
               videoSetting.pid = data.videoinfo.pid;
               videoSetting.title = data.videoinfo.name;
               videoSetting.duration = data.videoinfo.duration;
               videoSetting.defaultDefinition = data.videoinfo.medialist[0].vtype;
               videoSetting.isdrm = data.videoinfo.isdrm;
               if(data.videoinfo.hasOwnProperty("ark")){
                   videoSetting.ark = data.videoinfo.ark;
               }else if(data.videoinfo.hasOwnProperty("sspAd")){//ssp
                   var sspAd={};
                   sspAd.sspId=data.videoinfo.sspAd.sspMediaId;
                   if(data.videoinfo.sspAd.hasOwnProperty("slots")){
                       for(var i=0;i<data.videoinfo.sspAd.slots.length;i++){
                           if(data.videoinfo.sspAd.slots[i].hasOwnProperty("rollType")){
                               if(data.videoinfo.sspAd.slots[i].rollType=="PRE"){
                                   sspAd.preSlotId=data.videoinfo.sspAd.slots[i].slotId;
                               }else if(data.videoinfo.sspAd.slots[i].rollType=="PAUSE"){
                                   sspAd.pauseSlotId=data.videoinfo.sspAd.slots[i].slotId;
                               }
                           }
                       }
                   }
                   videoSetting.sspAd = sspAd;
               }
               videoSetting.mmsid = data.videoinfo.mmsid;
               videoSetting.pano= data.videoinfo.pa;
               videoSetting.needbuy=data.videoinfo.needbuy;
               videoSetting.tryLookTime=data.videoinfo.tryLookTime;
               if (data.videoinfo.hasOwnProperty("businessline")) {
                   videoSetting.p = data.videoinfo.businessline;
               }
               var media = {};
               for (var i = 0; i < data.videoinfo.medialist.length; i++) {
                   var key = "", item = data.videoinfo.medialist[i];
                   /*if(item.definition == "标清"){
                    key = "low";
                    }*/
                   key = item.vtype;
                   media[key] = {};
                   media[key].urls = [];
                   for (var j = 0; j < item.urllist.length; j++) {
                       media[key].urls.push(item.urllist[j].url);
                   }
                   media[key].videoWidth = item.vwidth;
                   media[key].videoHeight = item.vheight;
                   media[key].gbr = item.gbr;
                   media[key].vtype = item.vtype;
                   media[key].definition = item.definition;
                   media[key].videoType = item.urllist[0].videotype;
                   //设置码流列表
                   model.defaultDefinitionList.push(key);
               }
               videoSetting.media = media;
               /*var testStr = "";
                for(k in videoSetting.media.low){
                testStr += "&"+k+"="+videoSetting.media.low[k]+";";
                }
                alert(testStr);*/
               videoSetting.pic = data.videoinfo.pic['485*303'];
               model.videoSetting.refresh(videoSetting);
               videoSdkTool.setLocal(CONST_CONFIG.PET, data.playerinfo.pet,false);
               this.dispatchEvent(new Event(LoadEvent.LOADCMP, [data, arg]));
           } else {
               if (data.code == "10071") {
                   this.curTime = data.timestamp;
                   this.reload();
               } else {
                   this.dispatchEvent(new Event(LoadEvent.LOADERROR, [
                       {code:ERR.VOD_MMSID_ANALY, message:data.message},
                       arg
                   ]));
               }
           }
       }
       cloudVodProxy.prototype.reload = function () {
           this.unload();
           this.superClass.load.call(this);
       }
       /*
        *  在ios设备上强制设置tss = ios；
        * */
       cloudVodProxy.prototype.checkGslbUrl = function (url) {
           switch (videoSdkTool.getDevice()) {
               case "ipad":
               case "iphone":
                   if (url.indexOf("&tss=ios&") == -1) {
                       if (url.indexOf("&tss=no&") != -1) {
                           url = url.replace("&tss=no&", "&tss=ios&");
                       } else {
                           url += "&tss=ios";
                       }
                   }
                   break;
           }
           return url;
       }
       cloudVodProxy.prototype.loadError = function (data, arg) {
           if (this.isClose) return;
           this.dispatchEvent(new Event(LoadEvent.LOADERROR, [
               {code:ERR.VOD_CONFIG_IO},
               arg
           ]));
       }
       return cloudVodProxy;
   }();/**
    * Created with JetBrains WebStorm.
    * User: xuyafeng
    * Date: 15-10-29
    * Time: 下午5:46
    * To change this template use File | Settings | File Templates.
    */
   var GslbProxy = function () {
       function cloudVodProxy(model) {
           this.model = model;
       }
   
       ClassTool.inherits(cloudVodProxy, Proxy);
       /*
        * override 组合数组
        * */
       cloudVodProxy.prototype.getRequestList = function () {
           var timeout = 10000, maxCount = 3, retryTime = 0, result = [];
           var replace = ""
           var ipList = videoSdkTool.clone(this.model.videoSetting.urls);
           videoSdkTool.addUrlParams(ipList, {jsonp:"?", _r:"jsonp", format:1, expect:3});
           for (var i = 0; i < ipList.length; i++) {
               var newUrl = this.checkGslbUrl(ipList[i]);
               result.push({url:newUrl, timeout:timeout, maxCount:maxCount, retryTime:retryTime});
           }
           return result;
       }
       cloudVodProxy.prototype.checkGslbUrl =function(url){
           if(this.model.vodPlayType=="ios"){
               if(url.indexOf("&tss=ios&")==-1){
                   if(url.indexOf("&tss=no&")!=-1){
                       url = url.replace("&tss=no&","&tss=ios&");
                   }else{
                       url +="&tss=ios";
                   }
               }
           }
           if(this.model.vodPlayType=="mp4"){
               if(url.indexOf("&tss=no&")==-1){
                   if(url.indexOf("&tss=ios&")!=-1){
                       url = url.replace("&tss=ios&","&tss=no&");
                   }else{
                       url +="&tss=no";
                   }
               }
           }
           return url;
       }
       /*
        * override 加载后处理
        * */
       cloudVodProxy.prototype.loadCmp = function (data, arg) {
           if (this.isClose) return;
           this.log("gslb data:"+jsonTool.jsonToString(data)+" time"+jsonTool.jsonToString(arg));
           var model = this.model;
           //解析gpc数据
           if (data.status == 200) {
               if (data.ercode = "0") {
                   var purls = [data.location];
                   for (var i = 0; i < data.nodelist.length; i++) {
                       if (data.nodelist[i].location != purls[0]) {
                           purls.push(data.nodelist[i].location);
                       }
                   }
                   this.dispatchEvent(new Event(LoadEvent.LOADCMP, purls));
               } else {
                   this.dispatchEvent(new Event(LoadEvent.LOADERROR, [
                       {code:ERR.GSLB_ANALY, message:"调度错误：" + data.ercode,errInfo:"url:"+this.getUrl()+" respponse:"+ jsonTool.jsonToString(data)},
                       arg
                   ]));
               }
           } else {
               this.dispatchEvent(new Event(LoadEvent.LOADERROR, [
                   {code:ERR.GSLB_ANALY, message:"调度错误"},
                   arg
               ]));
           }
       }
       cloudVodProxy.prototype.loadError = function (data, arg) {
           if (this.isClose) return;
           this.dispatchEvent(new Event(LoadEvent.LOADERROR, [
               {code:ERR.GSLB_IO,message:Message.GSLB_IO,errInfo:"url:"+this.getUrl()},
               arg
           ]));
       }
       return cloudVodProxy;
   }();/**
    * Created with JetBrains WebStorm.
    * User: xuyafeng
    * Date: 15-8-25
    * Time: 下午4:07
    * To change this template use File | Settings | File Templates.
    * 上报控制类
    */
   
   var Reporter = function () {
   //    var config = {
   //        envUrl: "http://apple-www.letv.com/env/",
   //        playUrl: "http://apple-www.letv.com/cloud_pl/",
   //        erUrl:"http://apple-www.letv.com/er/",
   //        VERSION:"3.0.5",
   //        heartTime:60000
   //    };
       var config = {
           envUrl:"http://apple-www.letv.com/env/",
           playUrl:"http://apple-www.letv.com/cloud_pl/", //cloud_pl
           erUrl:"http://apple-www.letv.com/er/",
           VERSION:"3.7.5",
           heartTime:60000
       };
   //     var config = {
   //         envUrl:"http://develop.bigdata.letv.com/{###}/env/",
   //         playUrl:"http://develop.bigdata.letv.com/{###}/cloud_pl/", //cloud_pl
   //         erUrl:"http://develop.bigdata.letv.com/{###}/er/",
   //         VERSION:"3.7.5",
   //         //heartTime:180000
   //         heartTime:60000//3.7.5
   //     };
   
       var ACTION = {
           INIT:"init",
           PLAY:"play",
           TIME:"time",
           BLOCK:"block",
           EBLOCK:"eblock",
           FINISH:"finish",
           END:"end",
           BG:"bg",
           TG:"tg",
           PA:"pa",
           DRAG:"drag",
           CP:"cp",
           RESUME:"resume"//3.7.5
       }
       /*3	云视频	30	pc端	300	FLASH 播放器	11月29日修改
        31	html5	310	在pc平台播放		　
        311	在ios平台播放
        312	在安卓平台播放
        32	云视频sdk	321	在ios平台播放		　
        322	在安卓平台播放
        */
       var pMap = {
           "pc":{
               value:30,
               sub:{
                   value:300
               }
           },
           "sdk":{
               value:32,
               sub:{
                   "value":321,
                   "ios":{value:321,domain:"https://apple-www.le.com"},
                   "android":{value:322}
               }
           },
           "html5":{
               value:31,
               sub:{
                   "value":310,
                   "ios":{value:311},
                   "android":{value:312},
                   "pc":{value:310}
               }
           },
           "wx":{
               value:31,
               sub:{
                   "value":310,
                   "ios":{value:311},
                   "android":{value:312},
                   "pc":{value:310}
               }
           }
       };
       var cdeAppid = {
           "android":600,
           "ios":601
       }
   
       function ReporterParam() {
           this.pt = 0;
           this.lastTime = 0;
           this.isPauseRecord = false;
           this.isStartPlay = false;
           this.state = "";
           this.replaytype = 1;
       }
   
       function VideoReporter(model) {
           this.model = model;
           this.reset();
           // this.startHeartTimer();
       }
   
       VideoReporter.prototype = {
           init:function () {
              // debugger;
               this.model.reportParam.p1 = 3;
               this.model.reportParam.p2 = pMap[this.model.platform.toLowerCase()].value;
               if (pMap[this.model.platform.toLowerCase()].sub.hasOwnProperty(this.model.systemData.os.toLowerCase())) {
                   this.replaceDomain(pMap[this.model.platform.toLowerCase()].sub[this.model.systemData.os.toLowerCase()]);
                   this.model.reportParam.p3 = pMap[this.model.platform.toLowerCase()].sub[this.model.systemData.os.toLowerCase()].value;
               } else {
                   this.model.reportParam.p3 = pMap[this.model.platform.toLowerCase()].sub.value;
               }
           },
           replaceDomain:function (data) {
               if(data.hasOwnProperty("domain")){
                   for(var key in config){
                       if(typeof config[key]=="string"){
                           if(data.domain.substr(0,4)==="http"){
                               config[key]= config[key].replace(/^http:\/\/apple-www.letv.com/g,data.domain);
                           }else{
                               config[key]= config[key].replace(/apple-www.letv.com/g,data.domain);
                           }
                       }
                   }
               }
           },
           reset:function () {
               var m = this;
               if (m.heartTimer) {
                   m.heartTimer.stop();
                   m.heartTimer = null;
               }
               m.reportParam = new ReporterParam();
           },
           onStateChanged:function (type, data) {
               var m = this;
               data = jsonTool.stringToJson(data);
               logTool.log("[Stat K 日志数据] " + " type:" + type + " data:" + data);
               switch (type) {
                   case "init":
                       m.reportParam.isStartPlay = false;
                       //初始化
                       m.model.init(data);
                       m.init();
                       m.sendEnvStat();
                       //上报环境
                       break;
                   case "start":
                       m.reportParam.isStartPlay = false;
                       m.sendPlayStat(ACTION.INIT);
                       break;
                   case "play":
                       if (!m.reportParam.isStartPlay) {
                           m.sendPlayStat(ACTION.PLAY, data);
                           m.startHeartTimer();
                           m.resumePtStat();
                           m.reportParam.isStartPlay = true;
                       }
                       break;
                   case "connect":
                       break;
                   case "bufferEmpty":
                       if (m.reportParam.state != type && m.reportParam.isStartPlay) {
                           m.pausePtStat();
                           m.sendPlayStat(ACTION.BLOCK);
                       }
                       break;
                   case "bufferFull":
                       if (m.reportParam.state == "bufferEmpty" && m.reportParam.isStartPlay) {
                           m.resumePtStat();
                           m.sendPlayStat(ACTION.EBLOCK);
                       }
                       if (!m.reportParam.isStartPlay) {
                           //如果换成
                           m.reportParam.isStartPlay = true;
                       }
                       break;
                   case "seek":
                       if (m.reportParam.isStartPlay) {
                           m.pausePtStat();
                           m.sendPlayStat(ACTION.DRAG, {py:{dr:m.model.videoInfo().time + "_" + data.time}});
                       }
                       break;
                   case "pause":
                       if (m.reportParam.state != type && m.reportParam.isStartPlay) {
                           m.pausePtStat();
                           m.sendPlayStat(ACTION.PA);
                       }
                       break;
                   case "resume":
                       if (m.reportParam.isStartPlay) {
                           m.resumePtStat();
                           m.sendPlayStat(ACTION.RESUME);//3.7.5
                       }
                       break;
                   case "definition":
                       if (m.reportParam.isStartPlay) {
                           m.pausePtStat();
                           m.model.videoSetting.definitionCount++;
                           m.reportParam.replaytype = 2;
                           m.sendPlayStat(ACTION.TG);
                       }
                       break;
                   case "stopPlay":
                       if (m.reportParam.isStartPlay) {
                           m.reportParam.isStartPlay = false;
                           m.pausePtStat();
                           m.pauseHeadStat();
                           m.sendPlayStat(ACTION.END);
                       }
                       break;
                   case "playStop":
                       if (m.reportParam.isStartPlay) {
                           m.reportParam.isStartPlay = false;
                           m.pauseHeadStat();
                           m.sendPlayStat(ACTION.END);
                           m.sendPlayStat(ACTION.FINISH);
                       }
                       break;
                   case "hide":
                       if (m.heartTimer != null && m.reportParam.isStartPlay) {
                           m.pausePtStat(true);
                           m.heartTimer.stop();
                       }
                       break;
                   case "show":
                       if (m.heartTimer != null && m.reportParam.isStartPlay) {
                           m.resumePtStat(true);
                           m.heartTimer.start();
                       }
                       break;
                   case "error":
                       //错误的化停止心跳
                       m.reportParam.isStartPlay = false;
                       m.sendErrorStat(data);
                       if (m.heartTimer != null) {
                           m.heartTimer.stop();
                       }
                       break;
               }
               m.reportParam.state = type;
           },
           startHeartTimer:function () {
               //开始心跳计时
               var m = this;
               //logTool.log("[Stat K] startHeartTimer" + " t------>:" + m.heartTimer);
               if (m.heartTimer) {
                 //  logTool.log("[Stat K] startHeartTimer" + " t--------1>:" + !m.heartTimer.running);
                   if (!m.heartTimer.running) {
                       m.setDelay();
                       m.heartTimer.start();
                   }
               } else {
                   m.heartTimer = new Timer(config.heartTime, m, m.heartHanlder);
                   m.setDelay();
                   //logTool.log("[Stat K] startHeartTimer" + " t--------2>:");
                   m.heartTimer.start();
               }
           },
           pauseHeadStat:function () {
               var m = this;
               m.heartHanlder();
               if (m.heartTimer) {
                   m.heartTimer.stop();
               }
           },
           setDelay:function () {
               var m = this;
               if (m.heartTimer) {
                   switch (m.heartTimer.currentCount) {
                       case 0:
                           m.heartTimer.delay = 15000;
                           break;
                       case 1:
                           m.heartTimer.delay = 60000;
                           break;
                       default:
                           m.heartTimer.delay = config.heartTime;
                           break;
                   }
               }
           },
           heartHanlder:function () {
               var m = this;
               // console.log(this);
               //logTool.log("[Stat K] heartHanlder" + " t------------------------------------------------------------>:" + new Date().toLocaleTimeString());
               m.pausePtStat(true);
               m.resumePtStat(true);
               m.setDelay();
               m.sendPlayStat(ACTION.TIME);
               m.reportParam.pt = 0;
           },
           pausePtStat:function (auto) {
               if (typeof auto == "undefined") {
                   auto = false;
               }
               var nowTime = videoSdkTool.now();
               if (!this.reportParam.isPauseRecord && this.reportParam.lastTime != 0) {
                   this.reportParam.pt += (nowTime - this.reportParam.lastTime);
               }
               if (this.reportParam.lastTime == 0) this.reportParam.pt = 0;
               //logTool.log("[Stat K] pausePtStat" + " pt:" + this.reportParam.pt + "| " + this.reportParam.isPauseRecord + "| " + this.reportParam.lastTime + "|" + nowTime);
               this.reportParam.lastTime = nowTime;
               if (!auto) {
                   this.reportParam.isPauseRecord = true;
               }
           },
           resumePtStat:function (auto) {
               if (typeof auto == "undefined") {
                   auto = false;
               }
               var nowTime = videoSdkTool.now();
               this.reportParam.lastTime = nowTime;
               if (!auto) {
                   this.reportParam.isPauseRecord = false;
               }
               //logTool.log("[Stat K] resumePtStat" + " pt:" + this.reportParam.pt + " | " + this.reportParam.isPauseRecord + "| " + this.reportParam.lastTime);
           },
           checkValue:function (value,replace) {
               return ((typeof value ==="undefined")||(value==="")||(value===null))?((typeof replace ==="undefined")?"-":replace):value;
           },
           //发送play报数
           sendEnvStat:function () {
               var url = config.envUrl, model = this.model;
               url += "?ver=" + this.checkValue(config.VERSION);
               url += "&p1=" + this.checkValue(this.model.reportParam.p1);
               url += "&p2=" + this.checkValue(this.model.reportParam.p2);
               url += "&p3=" + this.checkValue(this.model.reportParam.p3);
               if (this.model.platform == "html5"||this.model.platform == "wx") {
                   url += "&lc=" + this.checkValue(model.lc());
                   url += "&app_name=bcloud_h5";//3.7.5
               }
               if (this.model.platform == "sdk") {
                   url += "&auid=" + this.checkValue(model.auid());
                   url += "&app_name=0";//3.7.5
               }
               url += "&uuid=" + this.checkValue(model.uuid());
               url += "&mac=" + this.checkValue(model.systemData.mac);
               url += "&nt=" + this.checkValue(model.systemData.nt,"none");
               url += "&os=" + this.checkValue(model.systemData.os);
               url += "&osv=" + this.checkValue(model.systemData.osv);
               url += "&app=" + this.checkValue(model.systemData.appv);
               url += "&bd=" + encodeURIComponent(this.checkValue(model.systemData.bd));
               url += "&xh=" + encodeURIComponent(this.checkValue(model.systemData.xh));
               url += "&ro=" + encodeURIComponent(this.checkValue(model.systemData.ro));
               url += "&src=pl";
               url += "&ch=" + this.checkValue(model.getTypeFrom());
               url += "&cs=" + encodeURIComponent(this.checkValue(model.systemData.cs));
               url += "&ssid=" + encodeURIComponent(this.checkValue(model.systemData.ssid));
               url += "&lo=" + encodeURIComponent(this.checkValue(model.systemData.lo));
               url += "&la=" + encodeURIComponent(this.checkValue(model.systemData.la));
               url += "&apprunid=" + this.checkValue(model.apprunid());
               url += "&ctime=" + videoSdkTool.now();//3.7.5
               url += "&r=" + Math.round((Math.random()+1)*Math.pow(10,11));
               this.report(url);
           },
           //发送play报数
           sendPlayStat:function (action, value) {
               var url = config.playUrl, model = this.model;
               url += "?ver=" + this.checkValue(config.VERSION);
               url += "&p1=" + this.checkValue(this.model.reportParam.p1);
               url += "&p2=" + this.checkValue(this.model.reportParam.p2);
               url += "&p3=" + this.checkValue(this.model.reportParam.p3);
               url += "&ac=" + this.checkValue(action);
               url += "&prg=" + this.checkValue(model.videoInfo().time);
               if (action == ACTION.TIME) {
                   // if (this.reportParam.pt > 180000) {
                   //     this.reportParam.pt = 180000;
                   // }
                   if (this.reportParam.pt > 60000) {//3.7.5
                       this.reportParam.pt = 60000;
                   }
                   //如果统计的时长为负数，则认为是错误的，计算为0
   
                   if (this.reportParam.pt < 0) {
                       this.reportParam.pt =0;
                   }
                   url += "&pt=" + this.checkValue(Math.abs(Math.round(this.reportParam.pt * 0.001)));
               }
               if (this.model.platform == "html5"||this.model.platform == "wx") {
                   url += "&lc=" + this.checkValue(model.lc());
                   url += "&app_name=bcloud_h5";//3.7.5
               }
               if (this.model.platform == "sdk") {
                   url += "&auid=" + this.checkValue(model.auid());
                   url += "&app_name=0";//3.7.5
               }
               url += "&uuid=" + this.checkValue(model.uuid());
               //点播
               if (model.playType == "vod") {
                   url += "&cid=" + this.checkValue(model.videoSetting.cid);
                   if (model.videoSetting.pid != "") {
                       url += "&pid=" + this.checkValue(model.videoSetting.pid);
                   }
                   url += "&vid=" + this.checkValue(model.videoSetting.vid);
                   url += "&ty=0";
                   url += "&vlen=" + this.checkValue(model.videoSetting.duration);
               }
               if (model.playType == "live") {
                   url += "&lid=" + this.checkValue(model.videoSetting.lid);
                   url += "&sid=" + this.checkValue(model.videoSetting.sid);
                   url += "&ty=1";
                   url += "&vlen=6000";
                   if (model.videoSetting.hasOwnProperty("activityId")) {
                       url += "&zid=" + this.checkValue(model.videoSetting.activityId);
                   }
               }
               url += "&ch=" + this.checkValue(model.getTypeFrom());
               url += "&vt=" + this.checkValue(model.videoSetting.vtype,"unknown");
               // pv
               url += "&pv=" + encodeURIComponent(this.checkValue(this.model.systemData.appv));
               //py
               if (this.model.platform == "sdk") {
                   if (value) {
                   }else {
                       value = {};
                   }
                   if (!value.hasOwnProperty("py")) {
                       value.py = {};
                   }
                   //移动端app必须上报replaytype（重新播放类型，直播，轮播，点播都要上报），key值为replaytype，value为1,2,3，replaytype=1时，点击播放；replaytype=2时，切换码流播放；replaytype=3时，切到后台回来继续播放
                   value.py.replaytype = this.reportParam.replaytype;
               }
               if(this.model.videoSetting.hasOwnProperty("p")){
                   if(!value) value ={};
                   if(!value.hasOwnProperty("py")){
                       value.py = {};
                   }
                   value.py.p = this.model.videoSetting.p;
               }
               if (value != null && value.hasOwnProperty("py")) {
                   url += ("&py=" + encodeURIComponent(this.checkValue(videoSdkTool.objectParseToString(value["py"]))));
               }
               // pcode
               if (this.model.platform == "sdk") {
                   url += "&pcode=" + this.checkValue(this.model.pcode());
               }
               url += "&nt=" + this.checkValue(model.systemData.nt,"none");
               url += "&ap=" + this.checkValue(this.model.config.autoplay);
               if (action == ACTION.INIT && this.model.platform == "sdk") {
                   url += "&cdev=" + this.checkValue(model.systemData.cdev);
                   url += "&caid=" + this.checkValue(cdeAppid[model.systemData.os.toLowerCase()]);
               }
               if (action == ACTION.PLAY) {
                   url += "&pay=0";// + Math.abs(Math.round(this.reportParam.pt * 0.001));
                   if (value && value.hasOwnProperty("cv")) {
                       url += "&stc=" + encodeURIComponent(this.checkValue(videoSdkTool.objectParseToString(value.cv.stc)));
                       url += "&joint=" + this.checkValue(value.cv.joint);
                   }
               }
               url += "&prl=0";
               url += "&ctime=" + this.checkValue(videoSdkTool.now());
               url += "&custid=" + this.checkValue(model.userInfo().userId);
               url += "&ipt=0";
               url += "&owner=1";
               url += "&apprunid=" + this.checkValue(model.apprunid());
               if (this.model.platform == "sdk") {
                 //  url += "&url=" + encodeURIComponent(model.videoSetting.url);
               }else{
                   url += "&url=" + encodeURIComponent(this.checkValue(window?window.location.href:""));
                   url += "&ref=" + encodeURIComponent(this.checkValue(document?document.referrer:""));
               }
               url += "&mac=" + this.checkValue(model.systemData.mac);//3.7.5
               url += "&key=letv01";//3.7.5
   
               url += "&r=" + Math.round((Math.random()+1)*Math.pow(10,11));
               this.report(url);
           },
           //发送play报数
           sendErrorStat:function (err) {
               //{errcode:"错误码","message":"错误的信息"}
               var url = config.erUrl, model = this.model;
               url += "?ver=" + this.checkValue(config.VERSION);
               url += "&p1=" + this.checkValue(this.model.reportParam.p1);
               url += "&p2=" + this.checkValue(this.model.reportParam.p2);
               url += "&p3=" + this.checkValue(this.model.reportParam.p3);
               url += "&et=pl";
               url += "&err=" + this.checkValue(err.errcode);
               if (this.model.platform == "html5"||this.model.platform == "wx") {
                   url += "&lc=" + this.checkValue(model.lc());
                   url += "&app_name=bcloud_h5";//3.7.5
               }
               if (this.model.platform == "sdk") {
                   url += "&auid=" + this.checkValue(model.auid());
                   url += "&app_name=0";//3.7.5
               }
               url += "&mac=" + this.checkValue(model.systemData.mac);
               url += "&nt=" + this.checkValue(model.systemData.nt,"none");
               url += "&os=" + this.checkValue(model.systemData.os);
               url += "&osv=" + this.checkValue(model.systemData.osv);
               url += "&app=" + this.checkValue(model.systemData.appv);
               url += "&bd=" + this.checkValue(model.systemData.bd);
               url += "&xh=" + this.checkValue(model.systemData.xh);
               url += "&ro=" + this.checkValue(model.systemData.ro);
               if (model.playType == "vod") {
                   //点播
                   url += "&cid=" + this.checkValue(model.videoSetting.cid);
                   if (model.videoSetting.pid != "") {
                       url += "&pid=" + this.checkValue(model.videoSetting.pid);
                   }
                   url += "&vid=" + this.checkValue(model.videoSetting.vid);
               }
               if (model.playType == "live") {
                   //url += "&lid=" + this.checkValue(model.videoSetting.lid);//3.7.5不再上报
                   //url += "&sid=" + this.checkValue(model.videoSetting.sid);//3.7.5不再上报
               }
               var py = {
                   ch:this.checkValue(model.getTypeFrom()),
                   custid:this.checkValue(model.userInfo().userId)
               }
               if(this.model.videoSetting.hasOwnProperty("p")){
                   py.p = this.checkValue(this.model.videoSetting.p);
               }
               var keyList = ["uu", "vu", "liveId", "streamId", "activityId"];
               for (var i = 0; i < keyList.length; i++) {
                   if (model.config.hasOwnProperty(keyList[i])) {
                       py[keyList[i]] = model.config[keyList[i]];
                   }
               }
               url += ("&ep=" + encodeURIComponent(videoSdkTool.objectParseToString(py)));
               //url += "&ap=" + this.checkValue(model.config.autoplay);//3.7.5不再上报
               url += "&uuid=" + this.checkValue(model.uuid());
               url += "&apprunid=" + this.checkValue(model.apprunid());
               url += "&r=" + Math.round((Math.random()+1)*Math.pow(10,11));
               this.report(url);
           },
           report:function (rurl) {
               var url = DomainTool.getDomain(rurl,this.model.config.lang,this.isMustHttps());
               logTool.log("[Stat K] " + " url:" + url);
               switch(this.model.platform){
                   case "html5":
                       var img = new Image(1, 1);
                       img.onload = img.onerror = img.onabort = function () {
                           img.onload = img.onerror = img.onabort = null;
                           img = null;
                       };
                       img.src = url;
                       break;
                   case "wx":
                       wx.request({url: url})
                       break;
                   case "sdk":
                       ExternalInterface.callSDK(this.model.systemData.os, "logRequest", {url:url});
                       break;
               }
           },
           isMustHttps:function(){
               if(this.model.platform=="wx"||this.model.platform=="sdk"){
                   return true;
               }
               return false;
           }
       }
       return VideoReporter;
   }();/**
    * Created with JetBrains WebStorm.
    * User: xuyafeng
    * Date: 15-9-25
    * Time: 下午4:39
    * To change this template use File | Settings | File Templates.
    */
   var ModelHandler = function () {
       //处理直播开始的信息
       function modelvod(model) {
           this.model = model;
       }
   
       ClassTool.inherits(modelvod, ClassObject);
       modelvod.prototype.setUp = function (option, el) {
           if(!this.model.config.hasOwnProperty("url")){
               if (option.hasOwnProperty("uu") && option.hasOwnProperty("vu") && !!option.uu && !!option.vu) {
                   this.model.vodPlayType = GlobalHandler.checkPlayType();
                   this.vodproxy = this.model.videoSetting.p=="101"?new CloudVodProxy(this.model):new CloudMmsProxy(this.model);
                   this.vodproxy.addEventListener(LoadEvent.LOADCMP, this.gpcCmp, this);
                   this.vodproxy.addEventListener(LoadEvent.LOADERROR, this.errorHanlder, this);
                   this.vodproxy.load();
               } else {
                   this.dispatchEvent(new Event(LoadEvent.LOADERROR, [
                       {code:ERR.PARAMS}
                   ]));
                   return;
               }
           }else{
               var request = new UrlProxy(this.model);
               request.addEventListener(LoadEvent.LOADCMP, this.gpcCmp, this);
               request.load();
           }
       }
       modelvod.prototype.destroy = function (data) {
           this.vodproxy&& this.vodproxy.unload();
       }
       modelvod.prototype.errorHanlder = function (e) {
           this.dispatchEvent(new Event(LoadEvent.LOADERROR,e.args[1]));
       }
       modelvod.prototype.gpcCmp = function (data) {
           this.refreshLoadingData(data);
           this.dispatchEvent(new Event(LoadEvent.LOADCMP, data));
       }
       modelvod.prototype.refreshLoadingData = function () {
           if (this.model.config.hasOwnProperty("loadingurl")) {
               if (this.model.config.loadingurl == 0) {
                   this.model.playerConfig.mloadingUrl = this.model.playerConfig.loadingUrl;
               } else {
                   this.model.playerConfig.mloadingUrl = this.model.config.loadingurl;
               }
           }
       }
       return modelvod;
   }();/**
    * Created with JetBrains WebStorm.
    * User: xuyafeng
    * Date: 15-9-10
    * Time: 下午2:25
    * To change this template use File | Settings | File Templates.
    */
   var BasePlayer = function () {
       var PlatState = {
           INIT:0,
           PLAY:1,
           PAUSE:2,
           EMPTY:3,
           STOP:4,
           SEEK:5
       }
   
       function basePlayer() {
       };
       ClassTool.inherits(basePlayer, ClassObject);
       basePlayer.prototype.init = function () {
           this.playUrlList = [];
           this.autoplay = false;
           this.startPlay = false;
           //第一次时间改变
           this.isFtc = false;
           // 0 初始化 1 播放 2暂停 3 卡顿 4 结束
           this.playState = PlatState.INIT;
           //渲染器
           this.render = null;
           this.emptyDelay = 1000;
       }
       basePlayer.prototype.setConfig = function (option) {
       }
       /*
        *  设置音量
        * */
       basePlayer.prototype.errorHandler = function (e) {
           if(this.config.liveStream=="rtmp" && e && e.code && (e.code=="493"||e.code=="494")){
               if (!e.hasOwnProperty("changeStream")) {
                   e.changeStream = true;
               }
               this.dispatchEvent(new Event(MediaEvent.EVENT, MediaEvent.ERROR, [e]));
               return;
           }
           if (this.playUrlList.length > 1 && e && e.code && e.code != 4) {
               this.playUrlList.shift();
               this.log("播放失败，" + " errCode:" + e.code + ",切换下一个地址:" + this.playUrlList[0]);
               this.changeurl(this.playUrlList[0]);
           } else {
               if (!e.hasOwnProperty("retryCdn")) {
                   e.retryCdn = true
               }
               ;
               if (!e.hasOwnProperty("code")) {
                   e.code = ERR.PLAY_TIMEOUT;
               }
               this.log("播放失败:"+ " errCode:" + e.code + ",url:" + this.playUrlList[0]);
               this.dispatchEvent(new Event(MediaEvent.EVENT, MediaEvent.ERROR, [
                   e
               ]));
           }
       }
       basePlayer.prototype.onPlaySeekHandler = function () {
           this.emptyST&&clearTimeout(this.emptyST);
           if (this.startPlay) {
               this.playState = PlatState.SEEK;
               this.dispatchEvent(new Event(MediaEvent.EVENT, MediaEvent.SEEK, this.getTime()));
           }
       }
       /*
        *  可以播放时候出来
        * */
       basePlayer.prototype.onPlayFullHandler = function () {
           if (!this.startPlay) {
              // this.log(t);
               this.startPlay = true;
               //  this.onMetaDataHandler({width:this.video.videoWidth, height:this.video.videoHeight, duration:this.video.duration});
               this.dispatchEvent(new Event(MediaEvent.EVENT, MediaEvent.START));
               this.render && this.render.start();
           }
           if (this.playState != PlatState.PLAY) {
               this.playState = PlatState.PLAY;
               this.dispatchEvent(new Event(MediaEvent.EVENT, MediaEvent.BUFFEREFULL, this.getTime()));
           }
           this.emptyST&&clearTimeout(this.emptyST);
       }
       /*
        *  播放卡顿处理
        * */
       basePlayer.prototype.onPlayEmptyHandler = function () {
           var m = this;
           m.emptyST&&clearTimeout(m.emptyST);
           if (m.startPlay && m.playState != PlatState.EMPTY) {
               if(m.playState != PlatState.SEEK){
                   m.playState = PlatState.EMPTY;
                   m.emptyST = setTimeout(function(){m.dispatchEvent(new Event(MediaEvent.EVENT, MediaEvent.BUFFEREMPTY, m.getTime()));}, m.emptyDelay);
               }else{
                   m.playState = PlatState.EMPTY;
                   m.dispatchEvent(new Event(MediaEvent.EVENT, MediaEvent.SEEKEMPTY, m.getTime()));
               }
           }
       }
       /*
        *  播放卡顿处理
        * */
       basePlayer.prototype.onPlaStopHandler = function () {
           this.emptyST&&clearTimeout(this.emptyST);
           if (this.playState != PlatState.STOP) {
               this.playState = PlatState.STOP;
               this.dispatchEvent(new Event(MediaEvent.EVENT, MediaEvent.COMPLETE));
               //this.dispatchEvent(new Event(MediaEvent.EVENT, MediaEvent.STOP, true));
           }
       }
   
       basePlayer.prototype.onPlayHandler = function () {
           this.emptyST&&clearTimeout(this.emptyST);
           this.playState = PlatState.PLAY;
           this.dispatchEvent(new Event(MediaEvent.EVENT, MediaEvent.PLAY, this.getTime()));
       }
   
       basePlayer.prototype.onPauseHandler = function () {
           this.emptyST&&clearTimeout(this.emptyST);
           this.playState = PlatState.PAUSE;
           this.dispatchEvent(new Event(MediaEvent.EVENT, MediaEvent.PAUSE, this.getTime()));
       }
   
       basePlayer.prototype.onPlayIngHandler = function () {
           var t = this.getTime();
           if (t >= 0 && !this.isFtc) {
               //qq浏览器得到0即认为是开始
               if (t > 0) {
                   this.log("第一次获得非0的播放时间" + t);
                   this.isFtc = true;
                   this.onPlayFullHandler();
                   for(var i=0;i<document.getElementsByClassName("my_video").length;i++){
                       document.getElementsByClassName("my_video")[i].muted = false;
                       if(this.config.start>0){
                           this.seek(this.config.start)
                       }
                   }
               } else {
                   //特殊处理。。。。
                   if (videoSdkTool.getDevice() == "iphone" && videoSdkTool.getBrowser() == "qq") {
                       this.onPlayFullHandler();
                   }
               }
           }
           if (this.startPlay) {
               this.dispatchEvent(new Event(MediaEvent.EVENT, MediaEvent.PLAYING, t));
           }
       }
   
       basePlayer.prototype.onLoadIngHandler = function () {
           this.dispatchEvent(new Event(MediaEvent.EVENT, MediaEvent.LODING, this.getLoadPercent()));
       }
       basePlayer.prototype.onMetaDataHandler = function (info) {
           var m = this;
           m.videoWidth = info.width || 0;
           m.videoHeight = info.height || 0;
           if(this.mduration && (info.duration==0||!isFinite(info.duration))){
               //如果传来的总时长没有，则使用系统默认的时间
               info.duration = this.mduration;
           }
          // this.log("onMetaDataHandler===>"+info.width+" "+ info.height+" "+info.duration);
           if (m.videoWidth > 0 && m.videoHeight>0 && !m.hasMetadata) {
               m.setSize();
               m.hasMetadata = true;
               m.setX5AutoOrientation(m.config);
               m.dispatchEvent(new Event(MediaEvent.EVENT, MediaEvent.METADATA, {videoWidth:m.videoWidth, videoHeight:m.videoHeight, duration:m.duration}));
           }
   
           if (info.duration > 0 && isFinite(info.duration)) {
               if (m.duration != info.duration) {
                   m.duration = info.duration;
                   m.dispatchEvent(new Event(MediaEvent.EVENT, MediaEvent.DURATION, {duration:m.duration}));
               }
           }
       }
       return basePlayer;
   }();/**
    * Created with JetBrains WebStorm.
    * User: xuyafeng
    * Date: 15-9-10
    * Time: 下午2:26
    * To change this template use File | Settings | File Templates.
    *  webview中用html5的video方式播放视频时，在ipad上是默认原来大小的，而在iphone上是默认全屏播放的。
    论坛中搜索，都没给出答案，google－》stackoverflow，找到最终解决方法：
    HTML里video必须加上webkit-playsinline属性
    <video id="player" width="480" height="320" webkit-playsinline>
    Obj-C里，webview设置allowsInlineMediaPlayback属性为YES
    webview.allowsInlineMediaPlayback = YES;
    * @ https://developer.apple.com/library/iad/documentation/AudioVideo/Conceptual/Using_HTML5_Audio_Video/ControllingMediaWithJavaScript/ControllingMediaWithJavaScript.html#//apple_ref/doc/uid/TP40009523-CH3-SW11
    */
   var H5SamplePlayer = function () {
       var videoIndex = 0;
       //"webkitbeginfullscreen", "webkitendfullscreen",
       var EventList = [ "error", "emptied", "abort", "playing", "play", "pause", "ended", "canplay", "waiting", "loadeddata", "loadedmetadata", "timeupdate", "seeked", "seeking", "progress", "durationchange"];
   
       function samplePlayer() {
           var me = this;
           this.type = "video";
           this._videoRect ={};
           this.videoHandlerBack = function () {
               me.videoHandler.apply(me, arguments);
           }
       }
   
       ClassTool.inherits(samplePlayer, BasePlayer);
       samplePlayer.prototype.destroy = function () {
           // this.superClass.destroy.call(this);
           this.removeEvents();
           this.stream && this.stream.close();
           this.render && this.render.close();
       }
       samplePlayer.prototype.setPoster = function (pic) {
           this.videoEL.poster = pic;
       }
       /*
        *  安装video标签，被设置属性
        * */
       samplePlayer.prototype.setUp = function (option, outEl) {
           videoIndex++;
           var id = "LecoudPlayer" + new Date().getTime() + "" + videoIndex,
               html = '<div id="v{id}" style="left:0px;top:0px;width:100%;height:100%;display: block;position: relative;">' +
                   '<video  id="{id}" class="my_video" controls="controls" muted  style="width:100%;height:100%;font-size: 12px;"></video>' +
                   '</div>';////; border:1px solid red;;border:1px solid yellow; border:1px solid yellow;border:1px solid red;object-fit:scale-down !important;border:1px solid yellow;border:1px solid red;
           var paramsList = ["preload", "controls", "width", "height"];//preload="none" //object-fit: fill !important;
           //preload none：不进行预加载。使用此属性值，可能是页面制作者认为用户不期望此视频，或者减少HTTP请求。  metadata：部分预加载。使用此属性值，代表页面制作者认为用户不期望此视频，但为用户提供一些元数据（包括尺寸，第一帧，曲目列表，持续时间等等）。auto：全部预加载。
           html = html.replace(/{id}/g, id);
           outEl.innerHTML = html;
           this.outEl = outEl;
           this.video = this.videoEL = document.getElementById(id);
           this.videoBox = document.getElementById("v" + id);
           this.config = option;
           // 是否是开始seek；
           this.isEndStartSeek = this.config.start > 0 ? false : true;
           if (option.hasOwnProperty("pic")) {
               this.videoEL.poster = option["pic"];
           }
           if (option.hasOwnProperty("autoplay") && option.autoplay == "1") {
               this.videoEL.autoplay = "autoplay";
               this.autoplay = true;
           } else {
               this.autoplay = false;
           }
           if (option.hasOwnProperty("videoWidth")&&option.videoWidth>0&&option.hasOwnProperty("videoHeight")&&option.videoHeight>0) {
               this.videoWidth = option.videoWidth;
               this.videoHeight = option.videoHeight;
           }
   
           if (option.hasOwnProperty("playsinline") && option.playsinline == "1") {
               if (this.videoEL.WebKitPlaysInline) {
                   this.videoEL.WebKitPlaysInline = true
               } else {
                   this.videoEL.setAttribute("webkit-playsinline", "");
                   this.videoEL.setAttribute("playsinline", "")
               }
           }
           //解决安卓手机微信自动横屏问题
           if(option.hasOwnProperty("x5Type") && option.x5Type =="h5" && /android/.test(videoSdkTool.getDevice())){
               this.videoEL.setAttribute("x5-video-player-type","h5");
               if(option.hasOwnProperty("x5Fullscreen") && option.x5Fullscreen=="1"){
                   this.videoEL.setAttribute("x5-video-player-fullscreen","true");
               }else{
                   this.videoEL.setAttribute("x5-video-player-fullscreen","false");
               }
               if(option.hasOwnProperty("x5Orientation")){
                   this.videoEL.setAttribute("x5-video-orientation",option["x5Orientation"]);
               }
           }
           if(option.hasOwnProperty("videoAtrr")){
               if(typeof option.videoAtrr =="object"){
                   for(var key in option.videoAtrr){
                       this.videoEL.setAttribute(key,option.videoAtrr[key]);
                   }
               }
           }
           this.setX5AutoOrientation(option);
           for (var i = 0; i < paramsList.length; i++) {
               if (option.hasOwnProperty(paramsList[i])) {
                   if (paramsList[i] == "width" || paramsList[i] == "height") {
                   } else {
                       this.videoEL[paramsList[i]] = option[paramsList[i]];
                   }
               }
           }
           this.isShow = true;
           this.vArea = this.videoBox;
           this.renderType ="";
           if(this.outEl.offsetWidth>0&this.outEl.offsetHeight>0){}else{
               //如果播放器一开始不可见的化，将video外层设置为一个近100%的值。当显示的时候，再设置为100%；因为ios上video如果一开始不显示，然后又显示的化，视频如果不触摸的化不会渲染
               this.videoBox.style.width="99.5%";
               this.videoBox.style.height="99.5%"
           }
           this._videoRect ={x:0,y:0,width:this.outEl.offsetWidth,height:this.outEl.offsetHeight};
       };
       samplePlayer.prototype.setX5AutoOrientation = function (option) {
           if(option.hasOwnProperty("x5Type") && option.x5Type =="h5" && /android/.test(videoSdkTool.getDevice())){
               if(option.hasOwnProperty("x5AutoOrientation") && option.x5AutoOrientation){
                   if(this.videoWidth>this.videoHeight){
                       this.videoEL.setAttribute("x5-video-orientation","landscape");
                   }else{
                       this.videoEL.setAttribute("x5-video-orientation","portrait");
                   }
               }
           }
       };
       samplePlayer.prototype.enableControls = function () {
           this.video.controls = true;
       }
       samplePlayer.prototype.disableControls = function () {
           this.video.controls = false;
       }
       samplePlayer.prototype.setContainer = function (el) {
           this.vArea = el;
       };
       samplePlayer.prototype.setLoop = function (loop) {
       }
       samplePlayer.prototype.hide = function (f) {
           if (!this.isShow) return;
           if (f) {
               this.videoBox.style.display = "none";
           } else {
               this.tmpwidth = this.videoBox.style.width;
               this.tmpheight = this.videoBox.style.height;
               this.videoBox.style.width = "1px";
               this.videoBox.style.height = "1px";
               this.videoBox.style.left = "-1000px";
               this.videoBox.style.top = "-1000px";
           }
           this.isShow = false;
       }
       samplePlayer.prototype.show = function () {
           if (this.isShow) return;
           this.videoBox.style.display = "";
           this.videoBox.style.width = this.tmpwidth;
           this.videoBox.style.height = this.tmpheight;
           this.videoBox.style.left = "0px";
           this.videoBox.style.top = "0px";
           this.isShow = true;
       }
       samplePlayer.prototype.setSize = function () {
          var m =this;
         if(m.outEl.offsetWidth>0&m.outEl.offsetHeight>0){
             m.display =true;
         }else{
             m.display =false;
         }
         m.setVideoRect();
         if(m.isShow){
             if(!m.config.dvideoSize){
                  if(m.videoWidth>0&&m.videoHeight>0&m.outEl.offsetWidth>0&m.outEl.offsetHeight>0){
                      m.videoBox.style.width =m._videoRect.width +"px";
                      m.videoBox.style.height = m._videoRect.height +"px";
                      m.videoBox.style.top = m._videoRect.y+"px";
                      m.videoBox.style.left = m._videoRect.x+"px";
                  }
             }else{
                 if(m.display){
                     m.videoBox.style.width = "100%";
                     m.videoBox.style.height = "100%";
                 }
             }
         }
           // this.log("变化 宽高----------------------------------------------------------------------------------》")
           m.render && this.render.setSize(m.vArea.offsetWidth, m.vArea.offsetHeight);
       }
       samplePlayer.prototype.setVideoRect = function () {
           var m =this;
           if(m.renderType=="pano"){
               this._videoRect={x:0,y:0,width:m.vArea.offsetWidth,height:m.vArea.offsetHeight};
           }else{
               if(m.videoWidth>0&&m.videoHeight>0&m.videoBox.offsetWidth>0&m.videoBox.offsetHeight>0){
                   //处理视频位移问题。
                   //设置视频标签位置
                   var x, y,w,h;
                   if(m.videoWidth/m.videoHeight>m.videoBox.offsetWidth/m.videoBox.offsetHeight){
                       w = m.videoBox.offsetWidth;
                       h= m.videoHeight*m.videoBox.offsetWidth/m.videoWidth;
                   }else{
                       h = m.videoBox.offsetHeight;
                       w = m.videoWidth*m.videoBox.offsetHeight/m.videoHeight;
                   }
                   y = (m.videoBox.offsetHeight - h)*.5;
                   x = (m.videoBox.offsetWidth - w)*.5;
                   this._videoRect={x:x,y:y,width:w,height:h};
               }
           }
       }
       samplePlayer.prototype.addEvents = function () {
           /*
            * oncanplay	script	当文件就绪可以开始播放时运行的脚本（缓冲已足够开始时）。
            oncanplaythrough	script	当媒介能够无需因缓冲而停止即可播放至结尾时运行的脚本。
            ondurationchange	script	当媒介长度改变时运行的脚本。
            onemptied	script	当发生故障并且文件突然不可用时运行的脚本（比如连接意外断开时）。
            onended	script	当媒介已到达结尾时运行的脚本（可发送类似“感谢观看”之类的消息）。
            onerror	script	当在文件加载期间发生错误时运行的脚本。
            onloadeddata	script	当媒介数据已加载时运行的脚本。
            onloadedmetadata	script	当元数据（比如分辨率和时长）被加载时运行的脚本。
            onloadstart	script	在文件开始加载且未实际加载任何数据前运行的脚本。
            onpause	script	当媒介被用户或程序暂停时运行的脚本。
            onplay	script	当媒介已就绪可以开始播放时运行的脚本。
            onplaying	script	当媒介已开始播放时运行的脚本。
            onprogress	script	当浏览器正在获取媒介数据时运行的脚本。
            onratechange	script	每当回放速率改变时运行的脚本（比如当用户切换到慢动作或快进模式）。
            onreadystatechange	script	每当就绪状态改变时运行的脚本（就绪状态监测媒介数据的状态）。
            onseeked	script	当 seeking 属性设置为 false（指示定位已结束）时运行的脚本。
            onseeking	script	当 seeking 属性设置为 true（指示定位是活动的）时运行的脚本。
            onstalled	script	在浏览器不论何种原因未能取回媒介数据时运行的脚本。
            onsuspend	script	在媒介数据完全加载之前不论何种原因终止取回媒介数据时运行的脚本。
            ontimeupdate	script	当播放位置改变时（比如当用户快进到媒介中一个不同的位置时）运行的脚本。
            onvolumechange	script	每当音量改变时（包括将音量设置为静音）时运行的脚本
            * */
           var videoEle = this.video;
           for (var i = 0; i < EventList.length; i++) {
               videoEle.addEventListener(EventList[i], this.videoHandlerBack, true);
           }
       };
       samplePlayer.prototype.removeEvents = function () {
           var videoEle = this.video;
           for (var i = 0; i < EventList.length; i++) {
               videoEle.removeEventListener(EventList[i], this.videoHandlerBack, true);
           }
       };
   
       samplePlayer.prototype.videoHandler = function () {
           var event = arguments[0];
           var m = this;
           //this.log(event.type + "- ---" + this.getTime()+"m.video.videoWidth:"+m.video.videoWidth+" m.video.duration"+m.video.duration);
           switch (event.type) {
   //                1 = MEDIA_ERR_ABORTED - 取回过程被用户中止
   //                2 = MEDIA_ERR_NETWORK - 当下载时发生错误
   //                3 = MEDIA_ERR_DECODE - 当解码时发生错误
   //                4 = MEDIA_ERR_SRC_NOT_SUPPORTED - 不支持音频/视
               case "error":
                   if (videoSdkTool.getBrowser() == "firefox" && m.video.error == null) {
                       return;
                   }
                   if (m.video.error && m.video.error.code == 4) {
                       if (m.getTime() > 0 && m.startPlay) {
                           //某些浏览器下，长时间播放，能播放也会上报错误，error = 4
                           return;
                       }
                   }
                   var err = {code:ERR.PLAY_TIMEOUT};
                   if (this.video.error && this.video.error.code) {
                       err.code = "49" + this.video.error.code;
                   }
                   m.errorHandler(err);
                   break;
               case "playing":
                   //
                   if (!this.startPlay) {
                       m.onMetaDataHandler({width:m.video.videoWidth, height:m.video.videoHeight, duration:m.video.duration});
                   }
                   m.autoSeek();
                   if (m.isEndStartSeek) {
                       m.onPlayFullHandler();
                   }
   
                   if(m.isStartSeek){
                       m.isEndStartSeek = true;
                   }
                   break;
               case "emptied":
               case "waiting":
                   m.onPlayEmptyHandler();
                   break;
               case "seeked":
                   m.isEndStartSeek = true;
                   m.onPlayFullHandler();
                   break;
               case "seeking":
                   m.onPlaySeekHandler();
                   break;
               case "play":
                   m.onPlayHandler();
                   break;
               case "pause":
                   m.onPauseHandler();
                   break;
               case "ended":
                   m.onPlaStopHandler();
                   break;
               case "timeupdate":
                   if(!this.display) this.setSize();
                   //seek之后再处理播放时间变化
                   if (m.isEndStartSeek) {
                       m.onPlayIngHandler();
                   }
                   break;
               case "progress":
                   m.onLoadIngHandler();
                   break;
               case "durationchange":
               case "loadedmetadata":
                   m.onMetaDataHandler({width:m.video.videoWidth, height:m.video.videoHeight, duration:m.video.duration});
                   break;
           }
       }
       samplePlayer.prototype.autoSeek = function () {
           var m = this;
          this.log("autoSeek:" + m.config.start + "--" + m.startPlay + "-" + m.isEndStartSeek);
           if (m.config.start != 0) {
               if (!m.startPlay && !m.isEndStartSeek) {
                   setTimeout(function () {
                       m.isStartSeek = true;
                       m.seek(m.config.start);
                   }, 0);
               }else{
                   m.isStartSeek = true;
               }
           } else {
               m.isStartSeek = true;
           }
       }
       samplePlayer.prototype.getLoadPercent = function () {
           if(this.video.getLoadPercent){
               return this.video.getLoadPercent();
           }
           var timeRange = this.video.buffered;        
           for (var i = 0; i < timeRange.length; i++) {
               if (this.getTime() < timeRange.end(i)) {
                   return Math.min(1, timeRange.end(i) / this.video.duration);
               }
           }
           return 0;
       }
   
       //samplePlayer.prototype.play = function (urls, time, play, type,callback) {
       samplePlayer.prototype.play = function (opt) {
           var m = this;
           m.renderType = opt.type;
           m.hasMetadata = false;
           m.playUrlList =opt.urls;
           m.config.start = opt.start;
           m.url = m.playUrlList[0];//"http://10.75.133.191/test.mp4"//
           m.isEndStartSeek = m.config.start > 0 ? false : true;
           m.isStartSeek = false;
           m.startPlay = false;
           this.isFtc = false;
           if (!this.render) this.render = new RenderEngine();
           this.render.init({type:opt.type, video:this.videoEL, el:this.vArea, onstart:function () {
               m.log("渲染引擎初始化完毕，回调播放, url:" + m.url);           
               //准备开始播放了
               m.prePlay(m.url,m.autoplay || opt.play,opt);
           }, onerror:function (c) {
               m.log("渲染引擎初始化失败");
               c.retryCdn = false;
               m.errorHandler(c);
           }
           });
       }
       //准备播放
       //url:是否准备播放
       samplePlayer.prototype.prePlay = function (url,autoplay,opt) {
           var m = this;
           if (!m.stream) m.stream = new StreamEngine();
           m.stream.init({video:m.videoEL,el:m.vArea,url:url,config:opt,onstart:function () {
               m.log("播放引擎初始化完毕，回调播放, url:" + m.url);
               m.video = m.stream.getVideo();
               m.addEvents();
               // 播放引擎提供src 
               m.video.src = m.url;
               if(videoSdkTool.getDevice() == "pc" || videoSdkTool.getDevice() == "mac"){
                   if(window.navigator.userAgent.toLowerCase().match(/MicroMessenger/i) == 'micromessenger' || videoSdkTool.getBrowser()=="qqwebview"){
                       if (m.autoplay || play) {
                           m.video.load && m.video.load();
                           m.autoSeek();
                           m.resume(opt.callback)
                       }
                   }else{
                       if(Hls.isSupported()) {
                           var video = document.getElementsByClassName('my_video')[0];
                           var hls = new Hls();
                           hls.loadSource(m.url);
                           hls.attachMedia(video);
                           hls.on(Hls.Events.MANIFEST_PARSED,function() {
                             video.play();
                           });
                       }
                   }
               } else{
                   if (m.autoplay || play) {
                       m.video.load && m.video.load();
                       m.autoSeek();
                       m.resume(opt.callback)
                   }
                }
   
           }, onerror:function (c) {
               if(c.message=="flv"){
                   opt.useFlv=false;
                   m.stream.close();
                   m.prePlay(url,autoplay,opt);                
               }else{
                   m.log("播放引擎初始化失败");
                   c.retryCdn = false;
                   m.errorHandler(c);
               }
           }
           });
       }
       //ios 8 默认浏览器下非微信下，如果修改div大小和位置来解决问题。
       samplePlayer.prototype.resume = function (callback) {
           var m =this;
           if(this.video.play){
               var result =  this.video.play();
               if(result&&result.then){
                   result.then(function(e){
                       callback&&callback()
                   }());
                   if(result.catch){
                       result.catch(function(e){
                           m.log(e);
                       });
                   }
               }else{
                   callback&&callback();
               }
           }
       }
   
       samplePlayer.prototype.pause = function () {
           this.video.pause();
       }
   
       samplePlayer.prototype.getTime = function () {
           if(this.video.getTime){
               return this.video.getTime();
           }
           return  this.video.currentTime;
       }
   
       samplePlayer.prototype.seek = function (t) {
           if(this.video.seek){
               return this.video.seek(t);
           }
           this.log("seek:" + t);
           this.video.currentTime = t;
       }
   
       samplePlayer.prototype.changeurl = function (url) {
           this.url = url;
           this.video.src = this.url;
           this.config.start = this.getTime();
           this.isEndStartSeek = this.config.start > 0 ? false : true;
           //继续播放
           this.video.load();
           this.resume();
       }
       samplePlayer.prototype.setVol = function (v) {
           this.videoEL.volume = v;
       }
       samplePlayer.prototype.getVol = function () {
           return this.videoEL.volume;
       }
       /*
        *  停止播放
        * */
       samplePlayer.prototype.stop = function () {
           this.destroy();
       }
   
       samplePlayer.prototype.getVideoRect = function (type) {
           //如果只获得width和height 则返回video的大小
           if(type=="wh"){
               return {'w':this.video.offsetWidth, 'h':this.video.offsetHeight};
           }
           this._videoRect.hasMetadata=this.hasMetadata;
           return this._videoRect;
       }
       samplePlayer.prototype.setPlaybackRate = function (r) {
           this.videoEL.playbackRate = r;
       }
       samplePlayer.prototype.rotateVideo = function (t) {
           var m=this;
           var th,tw;
           if(t%90==0){
               if((t/90)%2==0){
                   th=this.outEl.parentNode.offsetHeight;
                   tw=this.outEl.parentNode.offsetWidth;
               }else{
                   th=this.outEl.parentNode.offsetWidth;
                   tw=this.outEl.parentNode.offsetHeight;
               }
           }else{
               return;
           }
           m.outEl.style.height =th +"px";
           m.outEl.style.width = tw +"px";
           m.outEl.style.top = "50%";
           m.outEl.style.left = "50%";
           m.outEl.style.marginTop = -th/2+"px";
           m.outEl.style.marginLeft = -tw/2+"px";
           m.outEl.style.position = "absolute";
           m.outEl.style.transform = "rotate("+t+"deg)";
           if(m.videoBox.lastElementChild.tagName.toLowerCase()=="canvas"){//全景
               m.videoBox.lastElementChild.style.height="100%" ;
               m.videoBox.lastElementChild.style.width="100%" ;
           }
           this.setVideoRect();
       }
       samplePlayer.prototype.setX5Orientation=function (o) {
           if(this.config.hasOwnProperty("x5Type") && this.config.x5Type =="h5"&& /android/.test(videoSdkTool.getDevice())){
               this.videoEL.setAttribute("x5-video-orientation",o);
           }
       }
       return samplePlayer;
   }();/**
    * Created with JetBrains WebStorm.
    * User: xuyafeng
    * Date: 15-12-17
    * Time: 下午4:13
    * To change this template use File | Settings | File Templates.
    *
    */
   var RenderEngine = function () {
       var REConf ={
           pano:{
               name:"PanoRender",
               check:videoSdkTool.checkPano,
               err:{code:"",message:""}
           }
       }
       function engine(options){}
       ClassTool.inherits(engine,Plugin);
       engine.prototype.init = function (options) {
           this.isStart = false;
           this.options = options;
           //如果引擎已经纯且和当前引擎是一个类型的化
           this.log("初始化渲染引擎"+ this.eg);
           if(this.eg){
               if(options.type!=this.eg.type){
                   this.eg =null;
               }else{
                   this.eg.reset(options);
               }
           }else{
               this.initPlugin(options,this.pluginOk,REConf);
               //initPlugin无返回值
           }
       };
       /*
       *  插件加载完毕
       * */
       engine.prototype.pluginOk = function (p) {
           if(p){
               this.eg = new p(this.options);
           }else{
               this.eg = null;
           }
       };
       /*
       *  渲染开始
       * */
       engine.prototype.start = function () {
           if(!this.isStart){
               this.isStart =true;
               if(this.eg){
                   this.eg.start();
               }
           }
       };
       /*
       *  渲染关闭
       * */
       engine.prototype.close = function () {
           this.log("关闭渲染引擎"+ this.eg);
           if(this.eg){
               //渲染引擎关闭
               this.eg.close();
               this.eg=null;
           }
           this.isStart =false;
       };
       /*
       *  重置渲染大小
       * */
       engine.prototype.setSize = function (w,h) {
           if(this.eg){
               //渲染引擎关闭
               this.eg.setSize(w,h);
           }
       };
       return engine;
   }();var StreamEngine = function () {
       var REConf ={
           hls:{
               name:"media.mediaPlay.hls",
               check:function(){
                   return true;    
               },//videoSdkTool.checkPano,
               err:{code:"",message:""}
           },
           flv:{
               name:"media.mediaPlay.flv",
               check:function(){
                   return true;
               },
               err:{code:"",message:""}
           }
       }
       function engine(options){
       }
       ClassTool.inherits(engine,Plugin);
       engine.prototype.init = function (options) {
           this.isStart = false;
           this.getPlayType(options);
           this.options = options;
   
           if( options.type=="") {
               this.eg = options.video;
               if (options.hasOwnProperty("onstart")) {
                   options.onstart && options.onstart();
               }
               return;
           }
           //如果引擎已经存在且和当前引擎是一个类型的话
           this.log("初始化播放引擎"+ this.eg);
           if(this.eg){
               if(options.type!=this.eg.type){
                   this.eg = options.video;
               }else{
                   this.eg.reset(options);
               }
           }else{
               //this.eg = this.initPlugin(options,this.pluginOk,REConf);
               this.initPlugin(options,this.pluginOk,REConf);
           }
       };
       // options type:type, video:m.video,el:m.vArea,url:url
       engine.prototype.getPlayType = function (options) {
            if(options.config.useFlv){
                options.type = "flv";//REConf键值对中的"键"
            }else if(options.config.useHls){
                options.type = "hls";
            }else{
                options.type = "";
            }
       };
       engine.prototype.getVideo = function (p) {
           return this.eg;
       };
       
       /*
       *  插件加载完毕
       * */
       engine.prototype.pluginOk = function (p) {
           if(p){
               this.eg = new p(this.options);
               this.eg.init();
           }else{
               this.eg = null;
           }
       };
       /*
       *  渲染开始
       * */
       engine.prototype.start = function () {
           if(!this.isStart){
               this.isStart =true;
               if(this.eg){
                  // this.eg.start();
               }
           }
       };
       /*
       *  渲染关闭
       * */
       engine.prototype.close = function () {
           this.log("关闭播放引擎"+ this.eg);
           if(this.eg){
               //流引擎关闭
               if(this.eg.close){
                   this.eg.close();
               }else{
                   this.eg.pause&&this.eg.pause();
                   this.eg.src="";
               }
               this.eg=null;
           }
           this.isStart =false;
       };
       /*
       *  重置渲染大小
       * */
       engine.prototype.setSize = function (w,h) {
           if(this.eg){
               //渲染引擎关闭
             //  this.eg.setSize(w,h);
           }
       };
       return engine;
   }();/**
    * Created with JetBrains WebStorm.
    * User: xuyafeng
    * Date: 15-9-10
    * Time: 下午2:23
    * To change this template use File | Settings | File Templates.
    */
   /*
    *  h5底层播放器，
    *  根据视频地址和当前环境使用不同的播放方式
    *  可以播放基本的video标签
    *  支持360全景
    *  支持pc端mediasource 功能。自动适配
    * */
   var MediaPlayer = function () {
       function MediaPlayer(option) {
           this.init(option);
       }
   
       ClassTool.inherits(MediaPlayer, ClassObject);
       MediaPlayer.prototype.init = function (option) {
           this.time = 0;
           this.config = option;
       }
       /*
        *  安装播放
        * */
       MediaPlayer.prototype.setUp = function (videoSetting, container) {
           var conf = videoSdkTool.clone(this.config),
               me = this,
               addProperty = ["pic", "volume","videoWidth","videoHeight","liveStream"];
           //接受model的videoSeting
           this.loop = false;
           this.el = container;
           //设置总时长
           //设置声音
           me.volume = videoSetting.volume;
           for (var i = 0; i < addProperty.length; i++) {
               var key = addProperty[i];
               if (!conf.hasOwnProperty(key) && videoSetting.hasOwnProperty(key)) {
                   conf[key] = videoSetting[key];
               }
           }
           this.creatPlayer(conf, container);
           //this.player.mduration = videoSetting.duration;
       }
       /*
        *  开始时候创建播放器
        * */
       MediaPlayer.prototype.creatPlayer = function (conf, container) {
           if (this.player) {
               this.player.removeEventListener(MediaEvent.EVENT, this.MediaHanlder, this)
               this.player.destroy();
               this.player = null;
           }
           this.player = this.getPlayer(conf);
           this.player.init();
           this.player.setUp(conf, container);
       }
       /*
        *  之后用于切换播放器使用，在开始播放时候会进行播放器判断，判断使用那种类型
        * */
       MediaPlayer.prototype.setMedia = function (videoSetting) {
           //暂时不处理
       }
   
       MediaPlayer.prototype.hide = function (f) {
           this.player.hide(f);
       }
       MediaPlayer.prototype.show = function () {
           this.player.show();
       }
       /*
        *  设置 播放属性
        * */
       MediaPlayer.prototype.setConfig = function (option) {
       }
   
       MediaPlayer.prototype.setContainer = function (el) {
           if(el==null) return;
           this.player.setContainer(el);
       }
   
       /*
        *  安装播放
        * */
       MediaPlayer.prototype.getPlayer = function (option) {
           return new H5SamplePlayer();//PanoPlayer();//;//
       }
       /*
        * 设置媒体信息,开始播放 ,传递播放信息，以及开始事件
        * */
      // MediaPlayer.prototype.startPlay = function (videoInfo, start,play ,type,callback) {
       MediaPlayer.prototype.startPlay = function (opt) {
           var defOpt ={start:0,play:false,type:"",callback:null}
           for(var key in defOpt){
               if(!opt.hasOwnProperty(key)){
                   opt[key] = defOpt[key];
               }
           }
           this.destroy();
           this.setVol(this.volume);
           this.player.addEventListener(MediaEvent.EVENT, this.MediaHanlder, this);
           //获得外部传来的播放总时间
           this.player.mduration = opt.duration;
           this.player.play(opt);
       }
       MediaPlayer.prototype.setSize = function () {
           this.player.setSize();
       }
       /*
        *  恢复播放
        * */
       MediaPlayer.prototype.play = function (callback) {
           this.player.resume(callback);
       }
       MediaPlayer.prototype.setVol = function (v) {
           this.player.setVol(v);
           this.volume =v;
           this.dispatchEvent(new Event(MediaEvent.EVENT, MediaEvent.VOL, v));
       }
       /*
        * 暂停播放
        * */
       MediaPlayer.prototype.pause = function () {
           this.player.pause();
       }
       MediaPlayer.prototype.destroy = function () {
           this.closeVideo();
           this.loop = false;
           this.player.setLoop(false);
           this.player.destroy();
       }
   
       /*
        * 停止播放
        * */
       MediaPlayer.prototype.closeVideo = function () {
           this.player.removeEventListener(MediaEvent.EVENT, this.MediaHanlder, this)
           this.player.stop();
       }
       MediaPlayer.prototype.getTime = function () {
           return parseInt(this.player.getTime());
       }
   
       MediaPlayer.prototype.seek = function (t) {
           if (t >= 0 && t - this.player.duration <= 0) {
               this.player.seek(t);
               if(t < this.player.duration){
                   this.player.resume();
               }
           }
       }
       MediaPlayer.prototype.getBufferPercent = function (t) {
           return 1;
       }
       MediaPlayer.prototype.getLoadPercent = function (t) {
           return  this.player.getLoadPercent();
       }
   
       MediaPlayer.prototype.setLoop = function (loop) {
           this.loop = loop;
           this.player.setLoop(loop);
       }
       MediaPlayer.prototype.MediaHanlder = function (e) {
           switch (e.args[1]) {
               //case MediaEvent.STOP:
               case MediaEvent.COMPLETE:
                   if (this.loop) {
                       this.seek(0);
                       return;
                   }
                   break;
           }
           this.dispatchEvent(e);
       }
       MediaPlayer.prototype.changeurl = function (url) {
           this.player.changeurl(url);
       }
       MediaPlayer.prototype.getVideoRect = function (type) {
           return this.player.getVideoRect(type);
       }
       MediaPlayer.prototype.replay = function () {
           this.player.seek(0);
           this.dispatchEvent(new Event(MediaEvent.EVENT, MediaEvent.REPLAY, this.getTime()));
       }
       MediaPlayer.prototype.getVideoEl = function () {
           return this.player.videoEL;
       }
       MediaPlayer.prototype.setPoster = function (pic) {
           return this.player.setPoster(pic);
       }
       MediaPlayer.prototype.setPlaybackRate= function (r){
           this.player.setPlaybackRate(r);
           this.dispatchEvent(new Event(MediaEvent.EVENT, MediaEvent.SPLAYRATE, r));
       }
       MediaPlayer.prototype.rotateVideo= function (t){
           this.player.rotateVideo(t);
       }
       MediaPlayer.prototype.setX5Orientation=function (o) {
           this.player.setX5Orientation(o);
       }
       return MediaPlayer;
   }();/**
    * Created with JetBrains WebStorm.
    * User: xuyafeng
    * Date: 16-5-17
    * Time: 下午10:29
    * To change this template use File | Settings | File Templates.
    * 水印类
    * 水印规则：开始时候默认显示水印图大小，之后窗体变化大小，则修改等比例水印的大小。
    * 需要记录开始时候窗体的大小。
    * 需要记录视频的显示区域。
    */
   SOTool.shareObj("media.watermask", function () {
       function watermask(option) {
           this.init(option);
           this.model = option;
       }
       //继承
       ClassTool.inherits(watermask, ClassObject);
       watermask.prototype.init = function (option) {
           this.waterList =[];
           this.config ={
               chackTime:60000
           }
           this.model = option;
           this._index =0;
   //        this.waterModelWidth =640;
   //        this.waterModelHeight =360;
   
       }
       /*
        *  安装水印
        * */
       watermask.prototype.setUp = function (mediaplayer) {
           this.setWaterData();
           var data = this.model.playerConfig.watermark;
           this.clear();
           this.player = mediaplayer;
           this.el = mediaplayer.getVideoEl().parentNode.parentNode;
           this.waterData = videoSdkTool.clone(data);
           this._index =0;
   
           //设置总时长
           //设置声音
           var _self =this;
           if(this.waterData){
               for(var i=0;i<this.waterData.length;i++){
                   var img = UiTool.$C("img");
                   img.num = i;
                   if(this.waterData[i].hasOwnProperty("position")&&this.waterData[i].hasOwnProperty("url")){
                       if(!this.waterData[i].hasOwnProperty("x")) this.waterData[i].x=15
                       if(!this.waterData[i].hasOwnProperty("y")) this.waterData[i].y=15;
                       if(!this.waterData[i].hasOwnProperty("width")) this.waterData[i].width=640;
                       if(!this.waterData[i].hasOwnProperty("height")) this.waterData[i].height=360;
                   }else{
                       continue;
                   }
                   img.onload =function(){
                        var canvas = UiTool.$C("canvas");
                       _self.waterData[this.num].img = this;
                       _self._renderWater(canvas,_self.waterData[this.num]);
                       _self.waterList.push(canvas);
                       _self.start();
                   }
                   img.src = this.waterData[i].url;
               }
           }
       }
       watermask.prototype.isPano = function () {
           if (this.model.config.hasOwnProperty("pano") && this.model.config.pano == "1" || this.model.videoSetting.pano == "1") {
               return true;
           }
           return false;
       }
       watermask.prototype.setWaterData = function(){
           if(this.isPano()){
               this.model.videoSetting.videoOrgHeight = this.model.playerConfig.pHeight;
               this.model.videoSetting.videoOrgWidth = this.model.playerConfig.pWidth;
           }else{
               if(this.model.videoSetting.videoWidth/this.model.videoSetting.videoHeight<this.model.playerConfig.pWidth/this.model.playerConfig.pHeight)
               {
                   this.model.videoSetting.videoOrgHeight = this.model.playerConfig.pHeight;
                   this.model.videoSetting.videoOrgWidth = this.model.videoSetting.videoWidth*this.model.playerConfig.pHeight/this.model.videoSetting.videoHeight;
               }else{
                   this.model.videoSetting.videoOrgWidth = this.model.playerConfig.pWidth;
                   this.model.videoSetting.videoOrgHeight = this.model.videoSetting.videoHeight*this.model.playerConfig.pWidth/this.model.videoSetting.videoWidth
               }
           }
       }
       /*
       * 清除水印
       * */
       watermask.prototype.clear = function () {
           if(this.waterList){
               for(var i=0;i<this.waterList.length;i++){
                   if(this.waterList[i].parentNode==this.el){
                       this.el.removeChild(this.waterList[i]);
                       this.waterList[i] =null;
                   }
               }
               this.waterList =[];
           }
       }
       watermask.prototype.start = function () {
           if(this.waterList.length>1){
               //delay, me, handler, maxNum
               this.changeTimer = new Timer(this.config.chackTime,this,show);
               this.changeTimer.start();
           }
           show.call(this)
           function show(){
               _self =this;
               for(var i=0;i<_self.waterList.length;i++){
                   if(i!=_self._index){
                       _self.waterList[i].style.display ="none";
                   }else{
                       _self.waterList[i].style.display ="";
                   }
               }
               _self._index++;
               if(_self._index==_self.waterList.length){
                   _self._index=0;
               }
           }
       }
       watermask.prototype.setSize = function (w, h) {
           //this.clear();
           //把 水印列表重新渲染
           for(var i=0;i<this.waterList.length;i++){
               this._renderWater(this.waterList[i],this.waterData[i]);
           }
       }
       watermask.prototype.destroy = function (canvas, data) {
           this.clear();
           this.waterData = null;
       }
       /*
       *  渲染水印
       * */
       watermask.prototype._renderWater = function (canvas, data) {
           //根据data设置
           var img = data.img;
           var scale =1;
           if(this.model.playerConfig.pWidth/this.model.playerConfig.pHeight<data.width/data.height){
               scale =Math.min(1,this.model.playerConfig.pWidth/data.width);
           }else{
               scale =Math.min(1,this.model.playerConfig.pHeight/data.height);
           }
           var videoRect = this.player.getVideoRect();///m.model.playerConfig.pwidth m.model.playerConfig.pHeight 播放器原始尺寸
           if(!videoRect.hasMetadata)
               return;
           if(this.isPano()){
               var xScale = 1;
               var yScale = 1;
           }else{
               var xScale = videoRect.width/this.model.videoSetting.videoOrgWidth;
               var yScale = videoRect.height/this.model.videoSetting.videoOrgHeight;
           }
           if( canvas.fScale){
               scale = canvas.fScale;
           }else{
               if(this.model.playerConfig.pWidth/this.model.playerConfig.pHeight<xScale*img.width/(yScale*img.height)){
                   scale =Math.min(scale,0.5*videoRect.width/img.width);//水印宽度不能大于显示区域的半/
               }else{
                   scale =Math.min(scale,0.5*videoRect.height/img.height);
               }
           }
           canvas.style.position ="absolute";
           switch(data.position+''){
               case "1":
                   canvas.style.top = videoRect.y+yScale*scale*data.y +"px";
                   canvas.style.left = videoRect.x+xScale*scale*data.x +"px";
                   break;
               case "2":
                   canvas.style.top = videoRect.y+yScale*scale*data.y +"px";
                   canvas.style.right =(this.el.offsetWidth - videoRect.width)*.5+xScale*scale*data.x +"px";
                   break;
               case "3":
                   canvas.style.bottom =(this.el.offsetHeight - videoRect.height)*.5+ yScale*scale*data.y +"px";
                   canvas.style.left = videoRect.x+xScale*scale*data.x +"px";
                   break;
               case "4":
                   canvas.style.bottom =(this.el.offsetHeight - videoRect.height)*.5 + yScale*scale*data.y +"px";
                   canvas.style.right = (this.el.offsetWidth - videoRect.width)*.5+xScale*scale*data.x +"px";
                   break;
           }
           canvas.fScale = scale;
           //控制宽高
           canvas.width = xScale*scale*img.width;
           canvas.height = yScale*scale*img.height;
           //   canvas.getContext('2d').clear();
           canvas.getContext('2d').drawImage(img,0,0,img.width,img.height,0,0,canvas.width,canvas.height);
           this.el.appendChild(canvas);
       }
       return watermask;
   }());/**
    * Created with JetBrains WebStorm.
    * User: xuyafeng
    * Date: 16-2-6
    * Time: 上午10:35
    * To change this template use File | Settings | File Templates.
    * 播放地址处理类
    */
   
   var PlayUrlProxy = function () {
       function playurl(model) {
           this.model = model;
       }
   
       ClassTool.inherits(playurl, ClassObject);
       playurl.prototype.translate = function () {
             this.gslbLoader = new GslbProxy(this.model);
             if(this.model.videoSetting.gslb){
                 this.gslbLoader.addEventListener(LoadEvent.LOADCMP, this.gslbCmp, this);
                 this.gslbLoader.addEventListener(LoadEvent.LOADERROR, this.gslbErr, this);
                 this.gslbLoader.load();
             }else{
                 //地址处理完毕
                 this.dispatchEvent(new Event(LoadEvent.LOADCMP,this.leUrlsHandler()));
             }
       }
       playurl.prototype.gslbCmp = function (e) {
           this.dispatchEvent(new Event(LoadEvent.LOADCMP, e.args[1]));
       }
       /*
        * override 组合数组
        * */
       playurl.prototype.gslbErr = function (e) {
           //调度失败。使用302方式播放
           this.dispatchEvent(new Event(LoadEvent.LOADCMP, this.leUrlsHandler()));
       }
       playurl.prototype.leUrlsHandler = function (e) {
           var list = videoSdkTool.clone(this.model.videoSetting.urls);
           //if(!this.model.videoSetting.gslb){
               //乐视调度使用302方式播放
           for(var i= 0;i<list.length;i++){
               list[i] =  this.gslbLoader.checkGslbUrl( list[i]);
           }
          // }
           return list;
       }
       return playurl;
   }();/**
    * Created with JetBrains WebStorm.
    * User: xuyafeng
    * Date: 15-9-21
    * Time: 上午10:04
    * To change this template use File | Settings | File Templates.
    */
   var ReportPlayer = function () {
       function reportPlayer() {
           this.superClass.constructor.apply(this, arguments);
       };
       ClassTool.inherits(reportPlayer, Control);
       //orride
       reportPlayer.prototype.init = function (facade, model) {
           this.facade = facade;
           this.model = model;
           this.model.record = {};
           this.reportApi = new Reporter(model);
           this.reportApi.onStateChanged("init", {deviceId:this.model.lc(), os:videoSdkTool.getOs(), osv:"-", width:window.screen.width, height:window.screen.height, appv:this.model.playerConfig.version});
       }
   
       reportPlayer.prototype.setUp = function (option, el) {
           if(!this.model.config.report) return;
   
           this.model.videoSetting.errCode=0;
           this.facade.addEventListener(PlayerEvent.EVENT, this.videoSateHandler, this);
       }
       reportPlayer.prototype.destroy = function () {
           if(!this.model.config.report) return;
           this.superClass.destroy.apply(this, arguments);
           this.reportApi.reset();
           this.facade.removeEventListener(PlayerEvent.EVENT, this.videoSateHandler, this);
       }
       reportPlayer.prototype.videoSateHandler = function (e) {
           if(!this.model.config.report) return;
           switch (e.args[1]) {
               case PlayerEvent.VIDEO_DATA_CMP:
                   if (this.model.record.ms != 0) {
                       this.model.record.mr = videoSdkTool.now() - this.model.record.ms;
                       this.model.record.ms = 0;
                   }
                   this.reportApi.onStateChanged("start", {});
                   break;
               //卡顿
               case MediaEvent.BUFFEREMPTY:
                   this.reportApi.onStateChanged("bufferEmpty");
                   break;
               //缓冲区满
               case MediaEvent.BUFFEREFULL:
                   this.reportApi.onStateChanged("bufferFull");
                   break;
               //播放
               case MediaEvent.PLAY:
                   this.reportApi.onStateChanged("resume");
                   break;
               case MediaEvent.START:
                   if (this.model.record.vs != 0) {
                       this.model.record.pr = videoSdkTool.now() - this.model.record.vs;
                       this.model.record.vs = 0;
                   }
                   this.reportApi.onStateChanged("play", {cv:{stc:{mr:this.model.record.mr, adr:this.model.record.adr, pr:this.model.record.pr,gslbr:this.model.record.gslbr}, joint:this.model.joint}});
                   break;
               case MediaEvent.STOP:
                   var auto = e.args[2];
                   if (auto) {
                       this.reportApi.onStateChanged("playStop");
                   } else {
                       this.reportApi.onStateChanged("stopPlay");
                   }
                   break;
               case MediaEvent.PAUSE:
                   this.reportApi.onStateChanged("pause");
                   break;
               case MediaEvent.SEEK:
                   this.reportApi.onStateChanged("seek",{time:e.args[2]});
                   break;
               case PlayerEvent.VPH:
                   this.reportApi.onStateChanged("hide");
                   break;
               case PlayerEvent.VPS:
                   this.reportApi.onStateChanged("show");
                   break;
               case MediaEvent.DEFSTART:
                   this.reportApi.onStateChanged("definition");
                   break;
               // 播放失败error
               case PlayerEvent.ERROR:
               case MediaEvent.ERROR:
                   var eArgs = e.args[2][0];
                   this.model.videoSetting.errCode = eArgs.code;
                   this.reportApi.onStateChanged("error", {errcode:eArgs.code});
                   this.report({logcontent:eArgs.errInfo ||""});
                   break;
               case AdEvent.HEADEND:
               case AdEvent.NOAD:
                   if (this.model.record.as != 0) {
                       this.model.record.adr = videoSdkTool.now() - this.model.record.as;
                       this.model.record.as = 0;
                   }
                   this.model.record.vs = videoSdkTool.now();
                   break;
               case PlayerEvent.VIDEO_DATA_START:
                   this.model.record.ms = videoSdkTool.now();
                   break;
               case PlayerEvent.GSLB_START:
                   this.model.record.gslbs = videoSdkTool.now() ;
                   break;
               case PlayerEvent.GSLB_CMP:
                   if (this.model.record.gslbs != 0) {
                       this.model.record.gslbr = videoSdkTool.now() - this.model.record.gslbs;
                       this.model.record.gslbs = 0;
                   }
                   this.model.record.vs = videoSdkTool.now();
                   break;
               case PlayerEvent.VIDEO_LIVESTOP:
                   this.reportApi.onStateChanged("stopPlay");
                   break;
           }
       };
       /**
       *  上报服务器相关数据
       *  @see http://wiki.letv.cn/pages/viewpage.action?pageId=44511527
       *
       *  参数名      是否可空      说明      来源      备注
        vid	是	云点播的视频ID，或者云直播的直播ID	播放器自动获取
        sid	否	点播视频的码率信息，或者云直播的流ID	播放器自动获取
        code	否	错误编码，必须预先定义，否则不接受	播放器自动获取
        msg	是	反馈的错误信息	用户填写
        ver	否	播放器版本	播放器自动获取
        os	否	操作系统，如ios,android,xp,ipad等	播放器自动获取
        logfile	是	播放器的日志文件	播放器自动获取
        uip	是	用户的IP地址	服务器端自动获取
        contact	是
        联系方式，格式如下：
        手机-> tel:138xxxxxxxxx
        QQ -> qq:1231212
        用户填写
        referrer	是	播放器所在页面地址	播放器自动获取
        playurl	否	视频地址	播放器自动获取
        net	是	网络情况，如：3g,4g,wifi等	播放器自动获取
       * */
   //    reportPlayer.prototype.report = function (err) {
   //        if (typeof err == "undefined") {err=this.model.videoSetting.errCode;}
   //        var reportParams ={};
   //        reportParams.vid =this.model.playType=="vod"?this.model.videoSetting.vid:this.model.videoSetting.lid;
   //        reportParams.sid = "";
   //        reportParams.code = err;
   //        reportParams.msg = this.model._apprunid;
   //        var verArr= this.model.playerConfig.version.split("_");
   //        reportParams.ver =verArr[1]+verArr[verArr.length-1] ;
   //        reportParams.os = videoSdkTool.getOs();
   //        reportParams.logfile = logTool.getLog();
   //        reportParams.contact = this.model.lc();
   //        reportParams.referrer = window.location.href;
   //        reportParams.playurl = this.model.videoSetting.url;
   //        reportParams.net = "no";
   //        ReportTool.report("http://log.live.lecloud.com/feedback",reportParams);
   //    }
       reportPlayer.prototype.report = function (option) {
           //#客户端上报接口详细描述：
   //上报接口：http://log.cdn.letvcloud.com/sdk/epl?ver=1.0&uuid=values&ec=450&url= values &ret= values&p3= values &cvid= values &vtyp= values  &mtyp= values &cuid= values&leid=values&pver= values
   //    上报方式：post请求
   //上报参数：
   //ver日志版本：1.0
   //uuid（播放唯一码）：本次生成唯一标识
   //ec（ 错误码）：分类说明，参见1，客户端UI上的提示需要在错误码后面加上“_http状态码+600”，上报时值需要上报错误码即可，eg：客户端展示是50_1004,代表直播代理接口请求发生404错误，上报错误平台时的错误码是50
   //p3：pc，h5，android，iOS
   //cvid：播放内容标识：点播是vid，直播是流id
   //vtyp：播放类型：直播live\点播vod\轮播broadcast
   //mtyp：媒资类型（letv：乐视，cloud：云计算，saas：云计算saas，oth：第三方）
   //cuid（客户ID）
   //leid：乐视网id，如果是pc是cookieID，如果是移动设备是设备号
   //pver( 播放器版本)：
   //type：(上报方式) 1：自动，0：手动
   //logcontent：(错误信息) 手动上报时就是播放过程日志，自动上报时是当前请求出错接口名和返回内容
          // if (typeof err == "undefined") {err=this.model.videoSetting.errCode;}
           var err= this.model.videoSetting.errCode;
           if(option&&option.hasOwnProperty("code")){
               err = option.code;
           }
           var reportParams ={};
           reportParams.ver = "1.0";
           reportParams.uuid = this.model.uuid();
           reportParams.ec = err;
           reportParams.p3 = "h5";
           reportParams.cvid = this.model.playType=="vod"?this.model.videoSetting.vid:this.model.videoSetting.sid;
           reportParams.vtyp = this.model.playType;
           reportParams.mtyp = "cloud";
           reportParams.cuid = this.model.userData.userId;
           reportParams.leid = this.model.lc();
           reportParams.pver = this.model.playerConfig.version;
           reportParams.type = 1;
           reportParams.logcontent ="";
           for(var key in option){
               reportParams[key] = option[key];
           }
           ReportTool.report(DomainTool.getDomain("http://log.cdn.letvcloud.com/sdk/epl",this.model.config.lang),reportParams);
       }
       reportPlayer.prototype.showLog = function () {
           ReportTool.print(logTool.getLog(),this.model.lc());
       }
       reportPlayer.prototype.getLog = function () {
           return logTool.getLog();
       }
       return reportPlayer;
   }();/**
    * Created with JetBrains WebStorm.
    * User: xuyafeng
    * Date: 15-9-14
    * Time: 下午2:54
    * To change this template use File | Settings | File Templates.
    */
   var AdCtrl = function () {
       //  var AdJsUrl = "http://js.letvcdn.com/lc02_p/201509/24/13/50/adPlayer_v2.0.js";
       function AdData() {
           // isvip isTrylook pname style gdur cont ark streamid  lc uuid vid cid lc ch islive p1 p2 p3 up mmsid  pid uname ver
           this.isvip = 0;
           this.up = 0;
           this.isTrylook = false;
           this.pname = "";
           this.gdur = 0;
           this.ark = 0;
       }
       function adCtrl() {
           this.superClass.constructor.apply(this, arguments);
       }
   
       ClassTool.inherits(adCtrl, Control);
       adCtrl.prototype.setUp = function (player, el) {
           var m =this;
           m.player = player;
           m.videoOutEl = el;
           if(m.model.config.hasOwnProperty("onPlayerReady")){
               if(typeof m.model.config.onPlayerReady != 'function'){
                   m.model.config.onPlayerReady =window[m.model.config.onPlayerReady];
               }
               if(typeof m.model.config.onPlayerReady == 'function'){
                   try{
                       var adt = setTimeout(function(){
                           m.startLeAd.call(m);
                       },5000);
                       m.model.config.onPlayerReady({video:m.player.player.video,el:this.videoOutEl},function(type,data){
                               switch(type){
                                   case "adstart":
                                       clearTimeout(adt);
                                       break;
                                   case "adend":
                                       m.startLeAd.call(m);
                                       break;
                               }
                       });
                   }catch(e){
                       m.startLeAd.call(m);
                   }
               }else{
                   m.startLeAd.call(m);
               }
           }else{
               m.startLeAd.call(m);
           }
       }
       adCtrl.prototype.startLeAd = function () {
           var m =this;
           if (!m.checkAd()) {
               m.facade.dispatchEvent(new Event(AdEvent.EVENT, AdEvent.NOAD, "skip"));
               return;
           }
           if(this.model.videoSetting.hasOwnProperty("ark")){
               if (typeof H5AD == 'undefined' || typeof H5AD != 'function'){
                   videoSdkTool.getJS(SOTool.PluginStack.Ad, m.initAd, m.initAd, m, "utf-8");
               }else{
                   m.initAd();
               }
           }else if(this.model.videoSetting.hasOwnProperty("sspAd")){//ssp
               if (typeof leH5AD == 'undefined' || typeof leH5AD.initH5 != 'function'){
                   videoSdkTool.getJS(SOTool.PluginStack.ssp, m.initAd, m.initAd, m, "utf-8");
               }else{
                   m.initAd();
               }
           }
           //if (typeof H5AD == 'undefined' || typeof H5AD != 'function') {
               // 初始化 H5AD.initAD函数
           //    videoSdkTool.getJS(SOTool.PluginStack.Ad, m.initAd, m.initAd, m, "utf-8");
           // } else {
           //     m.initAd();
           // }
       }
       adCtrl.prototype.checkAd = function () {
           if (this.model.config.hasOwnProperty("letvad") && this.model.config.letvad.toString() == '0') {
               return false;
           }
           //试看视频不播广告
           if (this.model.videoSetting.hasOwnProperty("needbuy")&&this.model.videoSetting.needbuy.toString() == '1') {
               return false;
           }
           //又一大坑。
           if (this.model.videoSetting.hasOwnProperty("ark")&&this.model.videoSetting.ark.toString() == '0') {
               return false;
           }
           if(!this.model.videoSetting.hasOwnProperty("ark") && !this.model.videoSetting.hasOwnProperty("sspAd")){
               return false;//既没有ark字段，又没有sspAd字段
           }
           return true;
       }
       adCtrl.prototype.initAd = function (mediaplayer, option) {
           var _this = this;
           if(_this.model.videoSetting.hasOwnProperty("ark") && typeof H5AD != 'undefined' && typeof  H5AD == 'function'){
               _this.H5AD = new H5AD();
           }else if(typeof leH5AD != 'undefined' && typeof  leH5AD.initH5 == 'function'){//ssp
               var fid = "_h5ad_"+Math.floor(Math.random()*(+new Date()));
               _this.H5AD = leH5AD.initH5(_this,fid);
           }else{
               this.facade.dispatchEvent(new Event(AdEvent.EVENT, AdEvent.NOAD, "error"));
               return;
           }
           if (typeof _this.H5AD != 'undefined' && typeof  _this.H5AD.initAD == 'function'){
               var adData = new AdData();
               //视频时长
               adData.p1 = this.model.reportParam.p1;
               adData.p2 = this.model.reportParam.p2;
               adData.p3 = this.model.reportParam.p2;
               adData.lc = this.model.lc();
               adData.uuid = this.model.uuid();
               adData.ver = this.model.playerConfig.version;
               adData.gdur = this.model.videoSetting.duration;
               adData.cont = this.videoOutEl.id;
               if (this.model.playType == "vod") {
                   adData.islive = false;
                   adData.cid = this.model.videoSetting.cid;
                   adData.vid = this.model.videoSetting.vid;
                   adData.mmsid = this.model.videoSetting.mmsid;
                   if (this.model.videoSetting.hasOwnProperty("pid")) {
                       adData.pid = this.model.videoSetting.pid;
                   }
               } else if (this.model.playType == "live") {
                   adData.islive = true;
                   adData.sid = this.model.config.activityId;
               }
               adData.ch = this.model.getTypeFrom();
               adData.ark = this.model.videoSetting.ark;
               adData.useui = 1;
               if (this.model.videoSetting.hasOwnProperty("p")) {
                   if (this.model.userData.userId == "") {
                       adData.ext = this.model.videoSetting.p;
                   } else {
                       adData.ext = this.model.videoSetting.p + "|" + this.model.userData.userId;
                   }
               }
               if (this.videoOutEl.clientWidth < 530) {
                   adData.pname = "MPlayer";
               }
               //ssp
               if(_this.model.videoSetting.hasOwnProperty("sspAd")){
                   adData.sspid=this.model.videoSetting.sspAd.sspId;//365;
                   adData.slotid=this.model.videoSetting.sspAd.preSlotId;//674;
                   adData.playid=this.model.uuid()+"_"+videoSdkTool.now();
                   adData.playInline = 1;
               }
               _this.H5AD.initAD(adData, callback);
           }
           //else {
               //this.facade.dispatchEvent(new Event(AdEvent.EVENT, AdEvent.NOAD, "error"));
           //}
           function callback(status, data) {
               //  _this.log(status);
               if (_this.player) {
               } else {
                   return;
               }
               switch (status) {
                   case 'login':
                       break;
                   case 'playAD':
                       _this.adList = data;
                       if (_this.adList && _this.adList.length == 0) {
                           setTimeout(function () {
                               _this.destroy();
                               _this.facade.dispatchEvent(new Event(AdEvent.EVENT, AdEvent.NOAD));
                           }, 0);
                       } else {
                           _this.curAdIndex = 0;
                           _this.playAD();
                           _this.facade.dispatchEvent(new Event(AdEvent.EVENT, AdEvent.HEADSTART));
                       }
                       break;
                   case 'stopAD':
                       //开始播放正片
                       setTimeout(function () {
                           _this.destroy();
                           _this.facade.dispatchEvent(new Event(AdEvent.EVENT, AdEvent.HEADEND));
                       }, 0);
                       break;
                   case 'resumeAD':
                       _this.videoPlay();
                       break;
                   case 'pauseAD':
                       _this.videoPause();
                       break;
                   case 'getCurrTime':
                       return _this.getTime() || 0;
                   case 'getVideoRect':
                       return _this.getVideoRect();
                       break;
               }
           }
       };
       adCtrl.prototype.sspPause=function (cid) {
           var _this=this;
           _this.adVideo=_this.player.player.videoEL;
           _this.adVideo.addEventListener('play',function(){
               _this.H5AD.closePauseRender(_this.H5AD);
           });
           _this.adVideo.addEventListener('pause',function(){
               var paramData = {
                   "onTime": Math.round(_this.adVideo.currentTime * 1000), //单位：ms
                   'sspid': _this.model.videoSetting.sspAd.sspId,//365
                   'slotid': _this.model.videoSetting.sspAd.pauseSlotId,//685
                   "playid":(_this.model.uuid() + "_" + videoSdkTool.now()),
                   "pauseID":cid//为暂停广告指定div
               };
               _this.H5AD.getPauseData(paramData);
           });
       }
       adCtrl.prototype.playAD = function () {
           if (this.curAdIndex < this.adList.length) {
               this.curAd = this.adList[this.curAdIndex];
               this.player.addEventListener(MediaEvent.EVENT, this.mediaHandler, this);
               this.facade.addEventListener(PlayerEvent.EVENT, this.playerHandler, this);
               var autoplay = true;
               if(this.curAdIndex==0){
                   if(this.model.config.posterType==-2){
                       //如果使用默认播放器，则需要判断是否自动播放。
                       autoplay = this.model.config.autoplay=="1";
                   }
               }
              // this.player.startPlay({urls:[this.curAd.url]}, 0,autoplay);
               this.player.startPlay({
                   urls:[this.curAd.url],
                   duration:0,
                   start:0,
                   play:autoplay
               })
           } else {
               this.destroy();
               this.facade.dispatchEvent(new Event(AdEvent.EVENT, AdEvent.HEADEND));
           }
       }
       adCtrl.prototype.mediaHandler = function (e) {
           switch (e.args[1]) {
               case MediaEvent.PLAY:
                   this.H5AD.sendEvent("AD_PLAY", {curAD:this.curAd, curIndex:this.curAdIndex });
                   break;
               case MediaEvent.PAUSE:
                   this.H5AD.sendEvent("AD_PAUSE", {curAD:this.curAd, curIndex:this.curAdIndex });
                   break;
               //case MediaEvent.STOP:
               case MediaEvent.COMPLETE:
                   this.H5AD.sendEvent("AD_ENDED", {curAD:this.curAd, curIndex:this.curAdIndex });
                   this.curAdIndex++;
                   //this.H5AD.destory(this.curAd);
                   this.playAD();
                   break;
               case MediaEvent.ERROR:
                   this.H5AD.sendEvent("AD_ERROR", {curAD:this.curAd, curIndex:this.curAdIndex });
                   this.curAdIndex++;
                   this.H5AD.destory(this.curAd);
                   this.playAD();
                   break;
           }
       }
       adCtrl.prototype.playerHandler = function (e) {
           switch (e.args[1]) {
               case PlayerEvent.VPH:
                   this.videoPause();
                   break;
           }
       }
   
       adCtrl.prototype.videoPlay = function () {
           this.player && this.player.play();
       }
       adCtrl.prototype.getTime = function () {
           if (this.player) {
               return this.player.getTime()
           }
           return 0;
       }
   
       adCtrl.prototype.videoPause = function () {
           this.player && this.player.pause();
       }
       adCtrl.prototype.getVideoRect = function () {
           return this.player ? this.player.getVideoRect("wh") : {w:0, h:0};
       }
       adCtrl.prototype.destroy = function () {
           var m =this;
           if (m.player) {
               if(!m.model.videoSetting.hasOwnProperty("ark") && m.model.videoSetting.hasOwnProperty("sspAd")) {//ssp
                   m.sspPause(m.videoOutEl.skin.id);
               }
               m.player.removeEventListener(MediaEvent.EVENT, m.mediaHandler, m);
               m.facade.removeEventListener(PlayerEvent.EVENT, m.playerHandler, m);
               m.player.closeVideo();
               m.player = null;
           }
           try{
               //调用广告的清除方法，做catch处理，防止广告报错，影响下一步
               m.H5AD && m.curAd&& m.H5AD.destory(m.curAd);
           }catch(e){
               m.log("ad error "+e);
           }
       }
       return adCtrl;
   }()/**
    * Created with JetBrains WebStorm.
    * User: xuyafeng
    * Date: 15-9-16
    * Time: 下午2:26
    * To change this template use File | Settings | File Templates.
    *
    * 皮肤控制器
    */
   var SkinPlayer = function () {
       var SKIN_CONF = {
           "7": "//{domain}/player/plugin/skin/skin.js",
           "8": "//{domain}/player/plugin/skin/nskin.js"
       }
   
       function skinPlayer() {
           this.superClass.constructor.apply(this, arguments);
       };
       ClassTool.inherits(skinPlayer, Control);
       skinPlayer.prototype.setUp = function (option, el, outEl) {//;border:1px solid blue;
           var tpl = '<div id="#{video}" style="left:0px;top:0px;position: absolute;width:{width};height:{height};z-index:1;display: block;background-color: #000000;overflow:hidden"></div>' +
               '<div id="#{skin}" style="left:0px;top:0px;position: relative;width:{width};height:{height};z-index:2;overflow: hidden;"></div>' +
               '<div id="#{error}" style="left:0px;top:0px;position: absolute;width:{width};height:{height};z-index:3;overflow: hidden;display:none;"></div>';
           var width = "100%";
           var height = "100%";
           var elp = tpl.replace(/{width}/g, width);
           var m = this;
           elp = elp.replace(/{height}/g, height);
           m.el = UiTool.$E(el);
           m.outEl = UiTool.$E(outEl);
           m.setStylebyConfig(m.model.config);
           m.skin = new DisplayObject(m.el);
           UiTool.getTemplate(m.el, elp);
           //开始侦听事件
           m.facade.addEventListener(PlayerEvent.EVENT, m.videoSateHandler, m);
       }
       /*
        *  加载皮肤
        * */
       skinPlayer.prototype.load = function (config) {
           var m = this;
           //设置皮肤地址
           SOTool.setPluginStack({name: "view.skin", url: m.getSkinUrl()});
           if (!m.model.config.skinnable) {
               for (var i = 0; i < m.el.childNodes.length; i++) {
                   var child = m.el.childNodes[i];
                   if (child == m.el.skin) {
                       m.el.removeChild(m.el.skin);
                       break;
                   }
               }
               m.facade.removeEventListener(PlayerEvent.EVENT, m.videoSateHandler, m);
               m.dispatchEvent(new Event(LoadEvent.LOADCMP));
           } else {
               SOTool.getPlugin("view.skin", function (SKIN) {
                   if (SKIN) {
                       m.skinView = new SKIN(m.facade, m.model);
                       m.skinView.addEventListener(SkinEvent.EVENT, m.skinHandler, m);
                       m.skinView.setUp(m.el.skin);
                       //  m.skinView.listNotification(MediaEvent.VOL,this.model.videoSetting.vol);
                   } else {
                       for (var i = 0; i < m.el.childNodes.length; i++) {
                           var child = m.el.childNodes[i];
                           if (child == m.el.skin) {
                               m.el.removeChild(m.el.skin);
                               break;
                           }
                       }
                   }
                   m.dispatchEvent(new Event(LoadEvent.LOADCMP));
               });
           }
       }
       skinPlayer.prototype.getSkinUrl = function () {
           //return "http://10.75.143.16/debug/skin/2.0.0/skin.js";
           if (this.model.config.hasOwnProperty("testNskin")) {
               return this.model.config['testNskin'];
           }
           if (this.model.config.hasOwnProperty("nskin") && SKIN_CONF.hasOwnProperty(this.model.config.nskin)) {
               return SKIN_CONF[this.model.config.nskin];
           }//old
           return "//{domain}/player/plugin/skin/oldskin.js"
       }
   
       //通过配置修改css样式
       skinPlayer.prototype.setStylebyConfig = function (config) {
           var styleArr = ["controls", "fullscreen"];
           var className = "vb" + videoSdkTool.creatUuid();
           this.el.className = className;
           for (var i = 0; i < styleArr.length; i++) {
               if (!config[styleArr[i]]) {
                   if (config.pageControls) {
                       SkinRender["setMedia" + styleArr[i]]("", false);
                   } else {
                       SkinRender["setMedia" + styleArr[i]](className, false);
                   }
               }
           }
           // SkinRender["setPlayerCss"](className);
       }
       skinPlayer.prototype.getVideArea = function () {
           return this.el.skin.videoArea || null;
       }
       skinPlayer.prototype.autoSize = function () {
           var m = this;
           var width = m.model.videoSetting.videoWidth;
           var height = m.model.videoSetting.videoHeight;
           if (width == 0 || height == 0) return;
           var vScale = width / height;
           switch (m.model.config.autoSize + "") {
               case "1":
                   //以宽为准设置高度
                   var outW = UiTool.$E(m.el).offsetWidth;
                   this.log("获得容器的宽度==============================" + outW);
                   if (outW == 0) {
                       outW = UiTool.$E(m.outEl).style.width;
                       if (outW.indexOf("%") == -1) {
                           outW = parseInt(outW);
                       } else {
                           outW = 0;
                       }
                   }
                   this.log("获得容器的宽度==============================" + outW);
                   if (outW > 0) {
                       if (m.model.config.changeParent) {
                           m.el.parentNode.style.height = outW / vScale + "px";
                       }
                       m.el.style.height = outW / vScale + "px";
                   }
                   break;
               case "2":
                   var outH = UiTool.$E(m.el).offsetHeight;
                   if (outH == 0) {
                       outH = UiTool.$E(m.outEl).style.height;
                       if (outH.indexOf("%") == -1) {
                           outH = parseInt(outH);
                       } else {
                           outH = 0;
                       }
                   }
                   if (outH > 0) {
                       if (m.model.config.changeParent) {
                           m.el.parentNode.style.width = outH * vScale + "px";
                       }
                       m.el.style.width = outH * vScale + "px";
                   }
                   break;
           }
       }
       skinPlayer.prototype.setSize = function () {
           if (this.el.offsetWidth > 0 && this.el.offsetHeight > 0) {
               this.display = true;
           } else {
               this.display = false;
           }
       }
       skinPlayer.prototype.addEvents = function () {
       }
       skinPlayer.prototype.removeEvents = function () {
       }
       /*
        * 清除
        * */
       skinPlayer.prototype.destroy = function () {
           this.shutDown();
           if (this.skinView) {
               this.facade.removeEventListener(PlayerEvent.EVENT, this.videoSateHandler, this);
               this.skinView.removeEventListener(SkinEvent.EVENT, this.skinHandler, this);
               this.skinView = null;
           }
       }
       skinPlayer.prototype.skinHandler = function (e) {
           this.facade.dispatchEvent(e);
       }
   
       skinPlayer.prototype.shutDown = function () {
           if (this.skinView) {
               this.skinView.shutDown();
           }
       }
       /*
        *  各种状态皮肤处理
        * */
       skinPlayer.prototype.videoSateHandler = function (e) {
           if (e.args[1] !== MediaEvent.LODING && e.args[1] != MediaEvent.PLAYING) {
               this.log(e.args[1]);
           }
           if (this.skinView) {
               this.skinView.listNotification(e.args[1], e.args[2]);
           }
       }
       /*
        *  设置视频显示百分比
        * */
       skinPlayer.prototype.setVideoPercent = function (p) {
       }
       /*
        *  设置视频宽高比
        * */
       skinPlayer.prototype.setVideoScale = function (p) {
       }
       /*
        * 设置播放器显示区域
        * */
       skinPlayer.prototype.setVideoRect = function (p) {
       }
       skinPlayer.prototype.refreshPlayerInfo = function (config) {
           if (this.skinView) {
               this.skinView.refreshPlayerInfo(config)
           }
       }
   
       return skinPlayer;
   }();/**
    * Created with JetBrains WebStorm.
    * User: xuyafeng
    * Date: 15-9-18
    * Time: 下午2:05
    * To change this template use File | Settings | File Templates.
    *    //qq GMT+813:00:52===>type:videoFull;----data0
    //  mozilla/5.0 (iphone 6; cpu iphone os 8_3 like mac os x) applewebkit/600.1.4 (khtml, like gecko) version/6.0 mqqbrowser/6.4 mobile/12f70 safari/8536.25 mttcustomua/2 0x000000015f08c180
   
    */
   var VideoPlayer = function () {
       //类的引用
       var VideoWater = SOTool.getObj("media.watermask");
   
       function videoPlayer() {
           this.superClass.constructor.apply(this, arguments);
       };
       ClassTool.inherits(videoPlayer, Control);
       videoPlayer.prototype.setUp = function (option, el) {
           var m = this;
           m.log("开始创建视频模块");
           m.el = el;
           m.skin = new DisplayObject(el);
           m.mediaPlayer = new MediaPlayer(this.getConfig());
           //水印
           m.water = new VideoWater(this.model);
   
           //默认声音
           var lcVol = videoSdkTool.getLocal("lcVol");
           m.model.videoSetting.volume = (!!lcVol) ? lcVol : 0.5;
           m.model.videoSetting.fullscreen = false;
           m.lcTime = [];
           m.setDefinitionList();
           m.getDefaultConfig(m.model.config);
           m.changeVideoInfo(m.definition);
           m.mediaPlayer.setUp(m.model.videoSetting, el);
           //display,colorKey,type,alpha
           m.facade.color.setColor(m.skin, "bgColor");
           m.isComplete = false;//
           m.facade.dispatchEvent(new Event(PlayerEvent.EVENT, PlayerEvent.INIT));
       }
       /*
        *  获得播放配置信息
        * */
       videoPlayer.prototype.getConfig = function (definition) {
           var config = videoSdkTool.clone(this.model.config);
           switch (config.posterType) {
               case "-1":
               case "-2":
                   break;
               default:
                   config.autoplay = "1";
                   config.pic = "";
                   break;
           }
           return config;
       }
       videoPlayer.prototype.changeVideoInfo = function (definition) {
           //麻溜信息处理
           this.videoInfo = videoSdkTool.clone(this.model.videoSetting.media[definition]);
           this.videoInfo.definitionName = this.videoInfo.definition;
           this.videoInfo.definition = definition;
           this.videoInfo.duration = this.model.videoSetting.duration;
           var addParams = {
               uuid: this.model.uuid(),
               p1: this.model.reportParam.p1,
               p2: this.model.reportParam.p2,
               p3: this.model.reportParam.p3
           }
           if (this.model.videoSetting.hasOwnProperty("liveId")) {
               addParams.liveid = this.model.videoSetting.liveId;
               this.videoInfo.lid = this.model.videoSetting.liveId;
           }
           if (this.model.videoSetting.hasOwnProperty("vid")) {
               addParams.vid = this.model.videoSetting.vid;
           }
           addParams.ajax = 1;
           videoSdkTool.addUrlParams(this.videoInfo.urls, addParams);
           this.model.videoSetting.refresh(this.videoInfo);
       }
       /*
        * 获得码流列表
        * */
       videoPlayer.prototype.setDefinitionList = function () {
           var definitionList = [], model = this.model;
           //初始化码流和播放列表
           for (var key in model.videoSetting.media) {
               definitionList.push(key);
           }
           //definition2TypeObj 表示def 和type的对应关系
           model.definition2TypeObj = {};
           GlobalHandler.initTypeDefObj(model.defaultDefinitionList, model.definition2TypeObj);
           // 修正码流顺序
           definitionList.sort(function (a, b) {
               //this.model.defaultDefinitionList 在媒资接口中设置
               //  return model.defaultDefinitionList.indexOf(b)- model.defaultDefinitionList.indexOf(a);
               return GlobalHandler.defList.indexOf(GlobalHandler.type2Def(a)) - GlobalHandler.defList.indexOf(GlobalHandler.type2Def(b));
           });
   
           model.videoSetting.refresh({definitionList: definitionList});
       }
   
       videoPlayer.prototype.getDefaultConfig = function (option) {
           this.definition = this.model.videoSetting.defaultDefinition || this.model.videoSetting.definitionList[0];
           this.startime = 0;
           this.getLastConfig();//获取上次退出时的设置(码率、时间)
           if (option.hasOwnProperty("rate")) {
               option.rate = GlobalHandler.def2Type(option.rate, this.model.definition2TypeObj);
           }
           if (option.hasOwnProperty("rate") && this.model.videoSetting.definitionList.indexOf(option.rate) != -1) {
               this.definition = option.rate;
           }
           if (option.hasOwnProperty("start")) {
               this.startime = option.start;
           }
       }
       //获取上次退出时的设置(码率、时间)
       videoPlayer.prototype.getLastConfig = function () {
           var lcDef = videoSdkTool.getLocal("lcDef");//码率
           if (!!lcDef) {//码率
               this.definition = GlobalHandler.def2Type(lcDef, this.model.definition2TypeObj);
           } else {//默认设为高清
               this.definition = GlobalHandler.def2Type(GlobalHandler.defList[2], this.model.definition2TypeObj);
           }
           if (this.model.playType == "vod") {
               var lcTime = videoSdkTool.getLocal("lcTime");//时间
               if (!!lcTime) {//时间
                   var timeArr = JSON.parse(lcTime);
                   var timeObj;
                   this.lcTime = timeArr;
                   for (var i = 0, len = timeArr.length; i < len; i++) {
                       timeObj = timeArr[i];
                       if (timeObj.uu == this.model.config.uu && timeObj.vu == this.model.config.vu) {
                           this.lcTimeIndex = i;
                           if (timeObj.time < this.model.videoSetting.duration - 3) {
                               this.startime = timeObj.time;
                           }
                       }
                   }
               }
           }
       }
       videoPlayer.prototype.setSize = function (w, h, f) {
           this.mediaPlayer.setSize();
           this.water && this.water.setSize();
       }
       /*
        *  创建缩略图
        * */
       videoPlayer.prototype.showPoster = function (e) {
           var m = this;
           m.hidePoster();
           m.poster = null;
           m.mediaPlayer.hide(false);
           switch (this.model.config.posterType) {
               case "-2":
                   //使用默认播放器
                   break;
               case "-1":
                   //显示播放器，但是暂停是乐视的
                   m.mediaPlayer.show();
                   break;
               case "0":
                   //不显示poster
                   break;
               default:
                   m.addPoster();
                   break;
           }
           if (m.model.config.posterType == -2) {
               m.mediaPlayer.show();
               m.mediaPlayer.setPoster(m.getPosterUrl());
               m.facade.dispatchEvent(new Event(PlayerEvent.EVENT, PlayerEvent.VIDEO_AUTH_VALID));
           } else if (this.model.config.skinnable || m.model.config.controls) {
               //添加播放按钮，//非自动播放时候
               if (this.model.config.nskin == "7") {
                   m.playBtn = UiTool.$C("canvas");
                   m.playBtn.style.cssText = "position:absolute;width:80px;height:80px;left:50%;top:50%;z-index:2;cursor:pointer;margin-left:-40px;margin-top:-40px;";
                   m.playBtn.width = 80;
                   m.playBtn.height = 80;
                   m.render();
               } else if (this.model.config.nskin == "8") {
                   m.playBtn = UiTool.$C("DIV");
                   m.playBtn.style.cssText = "position:absolute;left:50%;top:50%;z-index:2;cursor:pointer;transform:translate(-50%,-50%);";
                   m.playBtn.innerHTML = '<svg width="64" height="64" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><defs><filter x="-35%" y="-19.2%" width="170%" height="153.8%" filterUnits="objectBoundingBox" id="a"><feOffset dy="2" in="SourceAlpha" result="shadowOffsetOuter1"/><feGaussianBlur stdDeviation="2" in="shadowOffsetOuter1" result="shadowBlurOuter1"/><feColorMatrix values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.5 0" in="shadowBlurOuter1" result="shadowMatrixOuter1"/><feMerge><feMergeNode in="shadowMatrixOuter1"/><feMergeNode in="SourceGraphic"/></feMerge></filter><path id="b" d="M19.83 25.522V0H0v25.522z"/></defs><g fill-rule="evenodd"><circle fill-opacity=".87" fill="#000" cx="32" cy="32" r="32"/><g filter="url(#a)" transform="translate(24 19)"><mask id="c" fill="#fff"><use xlink:href="#b"/></mask><path d="M0 23.713V1.81C0 .345 1.715-.51 2.956.334L19.04 11.29c1.055.717 1.055 2.225 0 2.943L2.956 25.187C1.716 26.034 0 25.177 0 23.713" mask="url(#c)"/></g></g></svg>'
   
                   m.playBtn.skin = new DisplayObject(m.playBtn);
                   m.facade.color.setColor(m.playBtn.skin, "fault", "fill");
                   UiTool.addEvent(m.playBtn, "mouseover", function (e) {
                       (m.playBtn && m.playBtn.skin) && m.facade.color.setColor(m.playBtn.skin, "active", "fill");// 设置悬浮颜色
                   });
                   UiTool.addEvent(m.playBtn, "mouseout", function (e) {
                       (m.playBtn && m.playBtn.skin) && m.facade.color.setColor(m.playBtn.skin, "fault", "fill");
                   });
   
               } else {
                   m.playBtn = UiTool.$C("DIV");
                   m.playBtn.style.cssText = "position:absolute;width:75px;height:75px;left:50%;top:50%;background:rgba(1, 1, 1, 0) url(" + DomainTool.getDomain("http://yuntv.letv.com/", m.model.config.lang) + "assets/img/skin.png?v=1901) no-repeat -111px -101px;margin: -40px 0 0 -38px;z-index:2;cursor:pointer;";
               }
               m.el.appendChild(m.playBtn);
               // 必须使用点击事件 而不是touch 事件，因为有些系统只有响应click才能播放。其他事件不播放
               UiTool.addEvent(m.playBtn, "click", function (e) {
                   m.startAuth.call(m);
               });
           }
       }
   
       videoPlayer.prototype.render = function () {
           if (this.playBtn) {
               var context = this.playBtn.getContext('2d');
               context.beginPath();
               context.arc(40, 40, 37, 0, 2 * Math.PI, true);
               context.closePath();
               context.fillStyle = UiTool.hexToRgba("#000000", 0.5);
               context.fill();
               context.lineWidth = 5;
               context.strokeStyle = this.facade.color.colorConfig.active;
               //context.stroke();
               context.lineWidth = 1;
               context.strokeStyle = this.facade.color.colorConfig.fault;
               context.beginPath();
               context.moveTo(32, 25);
               context.lineTo(55, 40);
               context.lineTo(32, 55);
               context.closePath();
               context.stroke();
               context.fillStyle = UiTool.hexToRgba(this.facade.color.colorConfig.fault, 1);
               context.fill();
           }
       }
       /**
        *  添加缩略图
        * */
       videoPlayer.prototype.addPoster = function (e) {
           var m = this;
           if (m.poster) {
               m.poster.style.display = "";
               m.el.appendChild(m.poster);
           } else {
   
               var posterModeArr = ["", "contain", "cover", "100% 100%"]
               m.poster = UiTool.$C("DIV");
               m.poster.src = m.getPosterUrl();
               if (m.poster.src) {
                   m.poster.style.cssText = "position:absolute;width:100%;height:100%; top: 0px;left: 0px;background:rgba(1, 1, 1, 0) url(" + m.poster.src + ") no-repeat 50% 50%;background-size:" + posterModeArr[this.model.config.posterType] + ";z-index:2;cursor:pointer;";
                   m.el.appendChild(m.poster);
               }
           }
       }
       videoPlayer.prototype.hidePoster = function (e) {
           var me = this;
           if (me.poster && me.el && me.poster.parentNode == me.el) {
               me.el.removeChild(me.poster);
               me.poster = null;
           }
           if (me.playBtn && me.el && me.playBtn.parentNode == me.el) {
               me.el.removeChild(me.playBtn);
               me.playBtn = null;
           }
       }
       /*
        * 开始播放，
        * 隐藏封面，
        * 显示播放器。
        * 播放器调用播放（某些浏览器必须先调用播放，才能启动播放）。
        *
        * */
       videoPlayer.prototype.startAuth = function (e) {
           var m = this;
           m.hidePoster();
           if (m.model.config.onlyPic) {
               m.mediaPlayer.hide();
           } else {
               m.mediaPlayer.show();
           }
           if (m.model.config.posterType + 0 < 0) {
               m.mediaPlayer.setPoster(m.getPosterUrl());
           } else {
               m.mediaPlayer.setPoster("");
           }
           //解决新版谷歌浏览器上报bcloud.js?ver=2016-07-12 17:07:47.002:4786 Uncaught (in promise) DOMException错误的问题
           m.mediaPlayer.play(function () {
               m.facade.dispatchEvent(new Event(PlayerEvent.EVENT, PlayerEvent.VIDEO_AUTH_VALID));
           });
       }
       /*
        *  正片开始播放
        *  设置码流列表
        *  侦听播放器时间
        *
        * */
       videoPlayer.prototype.startPlay = function (vArea) {
           this.log("开始尝试播放");
           //开始播放时候重新设置码流和码流列表的值。
           this.isStartPlay = false;
   
           this.setDefinitionList();
           // this.getDefaultConfig(this.model.config);
   
           this.mediaPlayer.addEventListener(MediaEvent.EVENT, this.mediaHandler, this);
   
           this.facade.addEventListener(SkinEvent.EVENT, this.skinSateHandler, this);
   
           this.facade.addEventListener(PlayerEvent.EVENT, this.videoSateHandler, this);
   
           this.mediaPlayer.setContainer(vArea);
   
           this.mediaPlayer.setLoop(this.model.config.loop);
   
           this.playVideo(this.startime);
           this.facade.dispatchEvent(new Event(PlayerEvent.EVENT, MediaEvent.CONNECT));
       }
       /*
        *  private
        * 启动调度（目前默认不启动调度）
        * */
       videoPlayer.prototype.startGslb = function (t) {
           this.gslbplayTime = t;
           this.gslbLoader = new PlayUrlProxy(this.model);
           this.gslbLoader.addEventListener(LoadEvent.LOADCMP, this.gslbCmp, this);
           this.gslbLoader.addEventListener(LoadEvent.LOADERROR, this.gslbErr, this);
           this.gslbLoader.translate();//load();
           this.facade.dispatchEvent(new Event(PlayerEvent.EVENT, PlayerEvent.GSLB_START));
       }
       /*
        *  private
        *  调度完成
        * */
       videoPlayer.prototype.gslbCmp = function (e) {
           var m = this;
           m.videoInfo.urls = e.args[1];
   
           //播放时候单独处理
           if (m.model.config.onlyPic) {
               m.mediaPlayer.show();
               setTimeout(videoSdkTool.bindFun(m.play, m), 10);
           } else {
               m.play();
           }
   
       }
       videoPlayer.prototype.play = function () {
           var m = this;
           var autoplay = true;
           if (m.model.joint == 0 && !m.isStartPlay && m.model.config.posterType == -2) {
               //如果 使用默认播放器。且没有播放广告的化。检查是否自动播放
               autoplay = m.model.config.autoplay == "1";
           }
           //是否不支持m3u8
           var canPlayType = m.mediaPlayer.player.videoEL.canPlayType && m.mediaPlayer.player.videoEL.canPlayType("application/x-mpegURL") == "";
           var hasFlvStream = m.model.videoSetting.hasOwnProperty("playTypes") && m.model.videoSetting.playTypes.match(/3/) && (m.model.videoSetting.playTypes.charAt(0) == "1");
           m.mediaPlayer.startPlay({
               urls: m.videoInfo.urls,
               duration: m.videoInfo.duration,
               start: m.gslbplayTime,
               play: autoplay,
               type: m.getPlayerType(),
               useHls: m.model.playType == "live" && canPlayType && (videoSdkTool.getDevice() == "pc" || videoSdkTool.getDevice() == "mac"),//直播，不支持m3u8，且是pc
               useFlv: m.model.playType == "live" && hasFlvStream && (m.model.livePlayType == "flv") && (videoSdkTool.getDevice() == "pc" || videoSdkTool.getDevice() == "mac"),
               callback: function () {
                   m.facade.dispatchEvent(new Event(PlayerEvent.EVENT, PlayerEvent.GSLB_CMP));
               }
           });
           m.mediaPlayer.setLoop(this.model.config.loop);
       }
       /*
        *  private
        *  调度失败
        * */
       videoPlayer.prototype.gslbErr = function (e) {
           this.facade.dispatchEvent(new Event(PlayerEvent.EVENT, PlayerEvent.ERROR, e.args[2]));
       }
       /*
        *  设置是否自动播放，正片开始之后起作用
        * */
       videoPlayer.prototype.setAutoReplay = function (loop) {
           this.mediaPlayer.setLoop(loop);
       }
       /*
        * 切换码流
        * */
       videoPlayer.prototype.setDefinition = function (type) {
           if (this.definition != type && this.model.videoSetting.definitionList.indexOf(type) != -1) {
               this.log("切换码流-----------------------------" + type);
               this.definition = type;
               this.isStartPlay = false;
               videoSdkTool.setLocal("lcDef", GlobalHandler.type2Def(type), {expires: new Date("2099,11,31")});
               var time = 0;
               if (this.model.playType == "vod") {
                   time = this.mediaPlayer.getTime();
               }//直播为0，点播为getTime()
               this.playVideo(time);
               
               this.facade.dispatchEvent(new Event(PlayerEvent.EVENT, MediaEvent.DEFSTART));
           }
       }
       /*
        *  private
        * */
       videoPlayer.prototype.playVideo = function (t) {
           if (this.getPlayerType() == "pano") {
               if (!videoSdkTool.checkPano()) {
                   this.facade.dispatchEvent(new Event(PlayerEvent.EVENT, PlayerEvent.VIDEO_INFO, [
                       {code: 490, message: "该设备还不支持3d功能,建议使用windows和安卓系统下的谷歌浏览器体验该功能"}
                   ]));
                   return;
               }
           }
   
           this.changeVideoInfo(this.definition);
           if (this.mediaPlayer.getVideoEl()) {
               this.mediaPlayer.getVideoEl().setAttribute("data-rate", GlobalHandler.type2Def(this.model.videoSetting.definition));
           }
           this.startGslb(t);
       }
       /*
        * 获得码流列表
        * */
       videoPlayer.prototype.getDefinitionList = function () {
           return this.model.videoSetting.definitionList;
       }
       /*
        *  PlayerEvent处理
        * */
       videoPlayer.prototype.videoSateHandler = function (e) {
           switch (e.args[1]) {
               case PlayerEvent.VPH:
                   if (this.isStartPlay) {
                       this.mediaPlayer.pause();
                   }
                   break;
               case PlayerEvent.VPS:
                   break;
               case MediaEvent.START:
                   this.isStartPlay = true;
                   //开始播放时候播放器显示出来
                   this.mediaPlayer.show();
                   //由于有些浏览器暂停时会弹出新的播放器，原来的
                   if (this.model.config.onlyPic) {
                       this.addPoster();
                   }
                   //给model 计算原始视频的显示大小显示水印
                   //显示水印
                   this.water.setUp(this.mediaPlayer);
   //                var v=this.mediaPlayer.getVideoEl();;
   //                var c=document.getElementById("myCanvas");
   //                ctx=c.getContext('2d');
   //               window.setInterval(function()
   //                {ctx.drawImage(v,0,0)},20)
                   break;
               case MediaEvent.STOP:
                   this.isStartPlay = false;
                   break;
               case PlayerEvent.ERROR:
               case MediaEvent.ERROR:
                   this.isStartPlay = false;
               case PlayerEvent.VIDEO_INFO:
                   //显示皮肤，则需要隐藏掉播放器。
                   if (this.model.config.skinnable) {
                       this.mediaPlayer.hide(false);
                   }
                   break;
               case PlayerEvent.FULLSCREEN:
                   if (this.model.config.onlyPic && !this.model.videoSetting.fullscreen) {
                       this.mediaPlayer.hide();
                   }
                   break;
               case PlayerEvent.PRESIZE:
                   this.setSize();
                   break;
               case MediaEvent.METADATA:
                   this.setSize();
                   break;
           }
       }
       /*
        *  SkinEvent处理
        * */
       videoPlayer.prototype.skinSateHandler = function (e) {
           switch (e.args[1]) {
               case SkinEvent.PLAY:
                   if (this.model.config.onlyPic) {
                       var _m = this;
                       _m.mediaPlayer.show();
                       setTimeout(function () {
                           _m.mediaPlayer.play();
                       }, 10);
                   } else {
                       this.mediaPlayer.play();
                   }
                   break;
               case SkinEvent.PAUSE:
                   this.mediaPlayer.pause();
                   break;
               case SkinEvent.SEEK:
                   this.mediaPlayer.seek(e.args[2]);
                   break;
               case SkinEvent.VOLUME:
                   this.model.videoSetting.volume = e.args[2];
                   this.mediaPlayer.setVol(this.model.videoSetting.volume);
                   videoSdkTool.setLocal("lcVol", e.args[2], {expires: new Date("2099,11,31")});
                   break;
               case SkinEvent.SETDEFINITION:
                   this.setDefinition(e.args[2]);
                   break;
               case SkinEvent.REPLAY:
                   this.mediaPlayer.replay();
                   break;
               case SkinEvent.POINT:
                   this.facade.dispatchEvent(new Event(PlayerEvent.EVENT, PlayerEvent.POINT, e.args[2]));
                   break;
               case SkinEvent.DELPOINT:
                   this.facade.dispatchEvent(new Event(PlayerEvent.EVENT, PlayerEvent.DELPOINT, e.args[2]));
                   break;
               case SkinEvent.PLAYBACKRATE:
                   this.mediaPlayer.setPlaybackRate(e.args[2]);
                   break;
               case SkinEvent.ROTATE:
                   this.mediaPlayer.rotateVideo(e.args[2]);
                   this.water.setWaterData();
                   this.water.setSize();
                   break;
           }
       }
       /*
        *  获得播放器类型
        * */
       videoPlayer.prototype.getPlayerType = function () {
           if (this.model.config.hasOwnProperty("pano") && this.model.config.pano == "1" || this.model.videoSetting.pano == "1") {
               return "pano";
           }
           return "";
       }
       /*
        *  MediaEvent处理
        * */
       videoPlayer.prototype.mediaHandler = function (e) {
           switch (e.args[1]) {
               case MediaEvent.ERROR:
                   if (this.model.playType == "vod") {
                       //播放失败后，检测当前播放的类型
                       //如果当前播放的是ios，则切换到mp4播放
                       if (this.model.vodPlayType && this.model.vodPlayType == "ios" && e.args[2][0].retryCdn) {
                           //尝试mp4播放
                           this.model.vodPlayType = "mp4";
                           videoSdkTool.setLocal("playType", this.model.vodPlayType);
                           this.log("重新调度");
                           this.startGslb(0);
                           return;
                       }
                   }
                   if (this.model.playType == "live") {
                       if (e.args[2][0].changeStream) {
                           this.model.videoSetting.liveStream = "hls";
                           this.facade.dispatchEvent(new Event(PlayerEvent.EVENT, PlayerEvent.CHANGESTREAM, e.args[2]));
                           return;
                       }
                   }
                   break;
               case MediaEvent.PLAYING:
                   if (this.model.videoSetting.needbuy == 1 && Math.floor(e.args[2]) > (this.model.videoSetting.tryLookTime+70)) {
                       this.mediaPlayer.pause();
                       this.destroy();
                       return;
                   }
                   if (this.model.playType == "vod" && this.model.videoSetting.needbuy == 0 && this.model.videoSetting.duration > 600000) {//大于6分钟的视频
                       if (typeof this.lcTimeIndex != "undefined") {
                           this.lcTime[this.lcTimeIndex].time = Math.floor(e.args[2]);
                       } else {
                           this.lcTime = this.lcTime.concat({
                               uu: this.model.config.uu,
                               vu: this.model.config.vu,
                               time: Math.floor(e.args[2])
                           });
                           this.lcTimeIndex = this.lcTime.length - 1;
                       }
                       videoSdkTool.setLocal("lcTime", JSON.stringify(this.lcTime), {expires: new Date("2099,11,31")});
                   }
                   break;
               case MediaEvent.COMPLETE:
                   this.isComplete = true;
                   if (this.model.config.hasOwnProperty("callbackJs")) {
                       var type = e.args[1], data = e.args[2];
                       if (WIN[this.model.config.callbackJs]) {
                           e.args[2] = WIN[this.model.config.callbackJs](type, data);
                       }
                   }
                   if (e.args[2] && e.args[2].hasOwnProperty("nextvid") && e.args[2].nextvid != "") {//有下一个视频
                       this.facade.dispatchEvent(new Event(PlayerEvent.NEXT, e.args[1], e.args[2]));
                   } else {//没有下一个视频
                       if(this.model.videoSetting.needbuy == 1) {
   
                           this.facade.dispatchEvent(new Event(PlayerEvent.EVENT, MediaEvent.STOP, false));
   
                       }else{
                           this.facade.dispatchEvent(new Event(PlayerEvent.EVENT, MediaEvent.STOP, true));//true播放停止
                       }
   
                   }
                   break;
           }
           this.facade.dispatchEvent(new Event(PlayerEvent.EVENT, e.args[1], e.args[2]));
       }
       videoPlayer.prototype.getPosterUrl = function (e) {
           var m = this;
           if (m.model.config.hasOwnProperty("pic")) {
               return m.model.config.pic;
           }
           if (m.model.videoSetting.hasOwnProperty("pic")) {
               return m.model.videoSetting.pic;
           }
           return "";
       }
       videoPlayer.prototype.destroy = function (e) {
           this.facade.removeEventListener(SkinEvent.EVENT, this.skinSateHandler, this);
           this.facade.removeEventListener(PlayerEvent.EVENT, this.videoSateHandler, this);
           this.mediaPlayer.removeEventListener(MediaEvent.EVENT, this.mediaHandler, this);
           this.mediaPlayer.destroy();
           this.water && this.water.destroy();
           if (!this.isComplete) {
               this.facade.dispatchEvent(new Event(PlayerEvent.EVENT, MediaEvent.STOP, false));//false停止播放
           }
       }
       videoPlayer.prototype.refreshPlayerInfo = function (p) {
           if (this.model.config.nskin == "7") {
               this.render();
           }
           this.water.setUp(this.mediaPlayer);
       }
       return videoPlayer;
   }();/**
    * Created with JetBrains WebStorm.
    * User: xuyafeng
    * Date: 15-10-21
    * Time: 上午9:56
    * To change this template use File | Settings | File Templates.
    */
   /*
    *  此类用于处理全局
    *  全屏
    * 播放器变化 等超做
    * */
   var GlobalPlayer = function () {
   //    function creatFullEL() {
   //        var div = UiTool.$C("DIV");
   //        div.style.cssText = "background: #000;width:100%;height:100%;position:fixed;top:0;left:0;z-index:1000;overflow:hidden;";
   //        return div;
   //    }
   //
   //    var fullScreenEl = creatFullEL();
   
       function control() {
           this.superClass.constructor.apply(this, arguments);
       };
       ClassTool.inherits(control, Control);
       control.prototype.setUp = function (p) {
           this.player = p;
           this.addEvents();
       }
       control.prototype.addEvents = function () {
           var m = this;
           m.addVideoEvent = false;
           m.facade.addEventListener(SkinEvent.EVENT, m.skinSateHandler, m);
           m.facade.addEventListener(PlayerEvent.EVENT, m.videoSateHandler, m);
           m.fullChangeFun = videoSdkTool.bindFun(m.fullChange, m);
           m.resizeFun = videoSdkTool.bindFun(m.resize, m);
           UiTool.addEvent(document, "fullscreenchange,webkitfullscreenchange,mozfullscreenchange,MSFullscreenChange", m.fullChangeFun);
           UiTool.addEvent(window, "resize", this.resizeFun);
   
           //判断页面是否关闭
           UiTool.addEvent(window,"pagehide",videoSdkTool.bindFun(this.pageHide,this));
           //判断是否在后台运行
           var prefix;
           ['webkit', 'moz', 'o', 'ms'].forEach(function (p) {
               if (typeof document[ p + 'Hidden' ] != 'undefined') {
                   prefix = p;
               }
           });
           UiTool.addEvent(document, prefix + "visibilitychange", function () {
               if (document[ prefix + 'VisibilityState' ] == 'hidden') {
                   m.facade.dispatchEvent(new Event(PlayerEvent.EVENT, PlayerEvent.VPH));
               } else if (document[ prefix + 'VisibilityState' ] == 'visible') {
                   m.facade.dispatchEvent(new Event(PlayerEvent.EVENT, PlayerEvent.VPS));
               }
           })
       }
   
       control.prototype.videoSateHandler = function (e) {
           switch (e.args[1]) {
               case PlayerEvent.INIT:
                   this.addVideoEvents();
                   break;
           }
       }
       control.prototype.pageHide = function (e) {
           this.facade.dispatchEvent(new Event(PlayerEvent.EVENT, PlayerEvent.WPH));
       }
       control.prototype.fullChange = function () {
           if (this.model.videoSetting) {
               this.model.videoSetting.fullscreen = UiTool.isFullScreen();
               if (!this.model.videoSetting.fullscreen) {
                   this.cancelFullscreen();
                   this.resizeFun();
               }
               this.facade.dispatchEvent(new Event(PlayerEvent.EVENT, PlayerEvent.FULLSCREEN,this.model.videoSetting.fullscreen));
           }
       }
       control.prototype.resize = function () {
           this.facade.dispatchEvent(new Event(PlayerEvent.EVENT, PlayerEvent.PRESIZE));
       }
       control.prototype.cancelFullscreen = function () {
           var skin = this.player.skinplugin.skin;
           if (skin.hasAttribute("tmpStyle")) {
               skin.setStyle({cssText:skin.getAttribute("tmpStyle")});
               skin.removeAttribute("tmpStyle")
           }
           if (this.bodyTmpOverFlow) document.body.style.overflow = this.bodyTmpOverFlow;
       }
       /**
        *  通过video侦听全屏和退出全屏
        * */
       control.prototype.addVideoEvents = function (e) {
           var videoEl = this.player.videoplugin.mediaPlayer.getVideoEl();
           var m =this;
           if(!m.addVideoEvent){
               videoEl.addEventListener("webkitbeginfullscreen", function(){
                   m.model.videoSetting.fullscreen = true;
                   m.facade.dispatchEvent(new Event(PlayerEvent.EVENT, PlayerEvent.FULLSCREEN,m.model.videoSetting.fullscreen));
               });
               videoEl.addEventListener("webkitendfullscreen", function(){
                   m.model.videoSetting.fullscreen = false;
                   m.facade.dispatchEvent(new Event(PlayerEvent.EVENT, PlayerEvent.FULLSCREEN,m.model.videoSetting.fullscreen));
                   m.resizeFun();
               });
               m.addVideoEvent = true;
           }
       }
       control.prototype.skinSateHandler = function (e) {
           switch (e.args[1]) {
               case SkinEvent.FULLSCREEN:
                   var videoEl = this.player.videoplugin.mediaPlayer.getVideoEl();
                   // if (this.model.config.dfull) {
                   //     if (videoEl && videoEl.webkitEnterFullscreen && videoSdkTool.getBrowser()!="chrome" && videoSdkTool.getBrowser()!="qqwebview" && videoSdkTool.getBrowser()!="safari"&& videoSdkTool.getBrowser()!="weixin") {
                   //         videoEl.webkitEnterFullscreen();
                   //         return;
                   //     }
                   // }
                   if (this.model.config.dfull) {
                       if(videoSdkTool.getDevice() == "iphone" || videoSdkTool.getDevice() == "ipad"){
                           if (videoEl && videoEl.webkitEnterFullscreen){
                               videoEl.webkitEnterFullscreen();
                               return;
                           }
                       }else {
                           if (videoEl && videoEl.webkitEnterFullscreen && videoSdkTool.getBrowser()!="chrome" && videoSdkTool.getBrowser()!="qqwebview" && videoSdkTool.getBrowser()!="safari" && videoSdkTool.getBrowser()!="weixin") {
                               videoEl.webkitEnterFullscreen();
                               return;
                           }
                       }
                   }
                   if (this.model.videoSetting.fullscreen) {
                       this.model.videoSetting.fullscreen = false;
                       this.cancelFullscreen();
                       if (UiTool.supportFullScreen() && this.model.config.dfull) {
                           UiTool.cancelFullScreen();
                       }
                   } else {
                       this.model.videoSetting.fullscreen = true;
                       this.player.skinplugin.skin.setAttribute({tmpStyle:this.player.skinplugin.el.style.cssText});
                       if (UiTool.supportFullScreen() && this.model.config.dfull) {
                           UiTool.fullScreen(this.player.skinplugin.el);
                       } else {
                           this.bodyTmpOverFlow = document.body.style.overflow;
                           document.body.style.overflow = "hidden";
                       }
                       this.player.skinplugin.skin.setStyle({cssText:"background: #000;width:100%;height:100%;position:fixed;top:0;left:0;z-index:1000;overflow:hidden;"});
                   }
                   this.resizeFun();
                   break;
           }
       }
       return control;
   }();/**
    * Created with JetBrains WebStorm.
    * User: xuyafeng
    * Date: 15-12-30
    * Time: 下午4:10
    * To change this template use File | Settings | File Templates.
    */
   /**
    * Created with JetBrains WebStorm.
    * User: xuyafeng
    * Date: 15-9-14
    * Time: 下午2:54
    * To change this template use File | Settings | File Templates.
    */
   var ErrorPlayer = function () {
       function errorCtrl() {
           this.superClass.constructor.apply(this, arguments);
       }
   
       ClassTool.inherits(errorCtrl, Control);
       errorCtrl.prototype.setUp = function (option, el,api) {
           this.el = el;
           this._api =api;
           this.skin = new DisplayObject(this.el);
           this.playingStop = false;
           this.error = null;
           this.facade.addEventListener(PlayerEvent.EVENT, this.videoSateHandler, this);
       }
       errorCtrl.prototype.videoSateHandler = function (e) {
           var me = this;
           //e.event.args [,状态，参数]；控制相关ui操作
           switch (e.args[1]) {
               case MediaEvent.START:
               case MediaEvent.BUFFEREFULL:
                   //隐藏loading
                   this.skin.setVisible(false);
                   break;
               case MediaEvent.ERROR:
               case PlayerEvent.ERROR:
               case PlayerEvent.VIDEO_INFO:
                   this.skin.setVisible(true);
                   if (!this.model.config.skinnable||!this.model.config.showError) {return;}
                   var data = e.args[2];
   //                if(data.hasOwnProperty("message")){
   //                    data.message =
   //                }else{
   //
   //                }
                   this.show(data);
                   break;
               case MediaEvent.STOP:
                   this.playingStop = true;
                   this.skin.setVisible(false);
                   break;
               case MediaEvent.PLAYING:
                   if (this.playingStop) {
                       this.skin.setVisible(false);
                   }
                   this.playingStop = false;
                   break;
               case PlayerEvent.VIDEO_LIVESTOP:
                   this.playingStop = true;
                   break;
           }
       }
       /*
       *  错误显示
       * */
       errorCtrl.prototype.show = function (data) {
           var me = this;
           if (!me.error) {
               SOTool.getPlugin("ErrorInfo", function (PC) {
                   if (PC) {
                       me.error = new PC();
                       me.error.show(data, me.el,{api:me._api,model:me.model,facade:me.facade});
                   }
               });
           }else{
               me.error.show(data, me.el,{api:me._api,model:me.model,facade:me.facade});
           }
       }
   
   
       errorCtrl.prototype.report = function () {
           var me = this;
       }
       return errorCtrl;
   }();
   //ReportTool.report("http://log.cdn.letvcloud.com/sdk/epl",{ver:"1.0",uuid:this.model.uuid(),ec:"",p3:"h5",cvid:this.model.videoSetting.vid,vtype:"live",mtyp:"cloud",cuid:"",leid:,})
   
   /**
    * Created with JetBrains WebStorm.
    * User: xuyafeng
    * Date: 15-9-11
    * Time: 下午4:14
    * To change this template use File | Settings | File Templates.
    */
   var Api = function () {
       function bindFun(funName, me, player) {
           if (typeof player.api[funName] == "undefined") {
              // return;
              // throw new Error(funName + "is not apply");
           }else{
               me[funName] = function () {
                   return player.api[funName].apply(player.api, arguments)
               }
           }
   
       }
       function api(player) {
           for (var i = 0; i < ApiList.length; i++) {
               var funName = ApiList[i];
               bindFun(funName, this, player);
           }
       }
       return  api;
   }();/**
    * Created with JetBrains WebStorm.
    * User: xuyafeng
    * Date: 15-9-22
    * Time: 上午10:47
    * To change this template use File | Settings | File Templates.
    */
   var FlashSdk = function () {
       function bindFun(funName, me, player) {
           me[funName] = function(){
               return player[funName].apply(player,arguments);
           }
       }
       function sdk(p) {
           var m =this;
           for (var i = 0; i < ApiList.length; i++) {
               var Fname = ApiList[i];
               bindFun(Fname,m,p.plugin);
           }
           //flash 方法重写
           m.playNewId =function (arg) {
               return p.plugin.setLejuData(arg);
           };
           m.getDefinitionList = function () {
               return p.plugin.getDefinitionList();
           }
           m.callFlash = function (arg) {
               return p.plugin[p.action](arg.value);
           };
       }
       return sdk;
   }();/**
    * Created with JetBrains WebStorm.
    * User: xuyafeng
    * Date: 15-9-22
    * Time: 上午10:47
    * To change this template use File | Settings | File Templates.
    */
   var H5Sdk = function () {
       function sdk(p) {
           this._pl = p;
       }
   
       // playNewId
       sdk.prototype.playNewId = function (p) {
           return this._pl.playNewId(p);
       }
       sdk.prototype.getVideoSetting = function () {
   //        cid 当前视频所在的频道ID(类型:String)
   //        pid 当前视频所在的剧集ID(类型:String)
   //        vid 当前视频VID(类型:String)
   //        mmsid 当前视频媒资ID(类型:String)
   //        pic 当前视频缩略图地址(类型:String)
   //        title 当前视频名称(类型:String)
   //        url 当前视频所在乐视播放页地址(类型:String)
   //        chapter 当前视频序列号(类型:int)
   //        nextvid 下一集视频VID(类型:String)
   //        nextpic 下一集视频缩略图地址(类型:String)
   //        nexttitle 下一集视频名称(类型:String)
   //        nexturl 下一集视频所在乐视播放页地址(类型:String)
   //        nextchapter 下一集视频序列号(类型:int)
   //        duration 当前视频总时长(单位:秒)(类型:int)
   //        total 当前视频所在的剧集列表视频总数(类型:int)
   //        percent 当前播放器显示百分比(0~1)(类型:Number)
   //        rotation 当前视频旋转角度(类型:int)
   //        fullscreen 视频是否处于全屏状态(类型:Boolean)
   //        color 视频色值数组(类型:Array)
   //        volume 当前视频音量倍数(类型:Number)
   //        jump 播放是否设置自动跳过片头片尾(类型:Boolean)
   //        continuePlay 视频是否自动连播(类型:Boolean)
   //        gpu 频是否默认开启硬件渲染(类型:Boolean)
   //        gpuing 视频是否正在启用硬件图形渲染(类型:Boolean)
   //        definition 视频当前清晰度(类型:String)
   //        defaultDefinition 播放器默认清晰(类型:String)
   //        accDecoding 视频是否正在启用硬件解码(类型:Boolean)
   //        trylook 当前视频是否为试看视频(类型:Boolean)
   //        fullScale 视频是否处于满屏比例(类型:Boolean)
   //        originalScale 当前视频的默认比例(类型:Number)
   //        playerErrorCode 播放器最近一次错误码(类型:String)
   //        playerErrorTime 最近一次视频错误时的记录时间(类型:Number)
   //        originalRect 视频原始尺寸(类型:Rectangle)
           var model = videoSdkTool.clone(this._pl.model.videoSetting), result = {};
           for (var i = 0; i < GlobalHandler.settingList().length; i++) {
               var key = GlobalHandler.settingList()[i];
               if (model.hasOwnProperty(key)) {
                   if (key == "definition") {
                       result[key] = this.getDefinition();
                   } else if (key == "defaultDefinition") {
                       result[key] = this.getDefaultDefinition();
                   } else {
                       result[key] = model[key];
                   }
               } else {
                   result[key] = "";
               }
           }
           return result;
       }
       sdk.prototype.getVideoTime = function () {
           if (this._pl.videoplugin) {
               return this._pl.videoplugin.mediaPlayer.getTime();
           }
           return 0;
       }
       sdk.prototype.pauseVideo = function () {
           this._pl.facade.dispatchEvent(new Event(SkinEvent.EVENT, SkinEvent.PAUSE));
       }
       sdk.prototype.resumeVideo = function () {
           this._pl.facade.dispatchEvent(new Event(SkinEvent.EVENT, SkinEvent.PLAY));
       }
       sdk.prototype.seekTo = function (t) {
           this._pl.facade.dispatchEvent(new Event(SkinEvent.EVENT, SkinEvent.SEEK, t));
       }
       sdk.prototype.setPoint = function (p) {
           this._pl.facade.dispatchEvent(new Event(SkinEvent.EVENT, SkinEvent.POINT, p));
       }
       sdk.prototype.removePoint = function (p) {
           this._pl.facade.dispatchEvent(new Event(SkinEvent.EVENT, SkinEvent.DELPOINT, p));
       }
       sdk.prototype.replayVideo = function () {
           this._pl.facade.dispatchEvent(new Event(SkinEvent.EVENT, SkinEvent.REPLAY));
       }
       sdk.prototype.closeVideo = function () {
           this._pl.closeVideo();
       }
       sdk.prototype.setVolume = function (v) {
           this._pl.facade.dispatchEvent(new Event(SkinEvent.EVENT, SkinEvent.VOLUME, v));
       }
       sdk.prototype.shutDown = function () {
           this._pl.shutDown();
       },
           sdk.prototype.startUp = function () {
               this._pl.startUp();
           },
           sdk.prototype.getBufferPercent = function () {
               if (this._pl.videoplugin) {
                   return this._pl.videoplugin.mediaPlayer.getBufferPercent();
               }
               return 0;
           }
       sdk.prototype.setDefinition = function (d) {
           d =  GlobalHandler.def2Type(d,this._pl.model.definition2TypeObj);
           this._pl.facade.dispatchEvent(new Event(SkinEvent.EVENT, SkinEvent.SETDEFINITION, d));
       }
       sdk.prototype.getDefinition = function () {
           var d = this._pl.model.videoSetting.definition;
           return  GlobalHandler.type2Def(d);
       },
           sdk.prototype.getDefaultDefinition = function () {
               var d = this._pl.model.videoSetting.defaultDefinition;
               return  GlobalHandler.type2Def(d);
           },
           sdk.prototype.getDefList=function () {
               var dlist = [];
               for (var i = 0; i < this._pl.model.defaultDefinitionList.length; i++) {
                   var d =  GlobalHandler.type2Def(this._pl.model.defaultDefinitionList[i]);
                   dlist.push(d);
               }
               // dlist.reverse();
               return dlist;
           },
           sdk.prototype.getDefinitionList = function () {
               var dlist = [];
               for (var i = 0; i < this._pl.model.videoSetting.definitionList.length; i++) {
                   var d =  GlobalHandler.type2Def(this._pl.model.videoSetting.definitionList[i]);
                   dlist.push(d);
               }
              // dlist.reverse();
               return dlist;
           },
           sdk.prototype.setVideoPercent = function (p) {
               this._pl.skinplugin.setVideoPercent(p);
           }
       sdk.prototype.getVideoPercent = function () {
           //this._pl.skinplugin.setVideoPercent(p);
       }
       sdk.prototype.setVideoScale = function (s) {
           this._pl.skinplugin.setVideoScale(s);
           return 0;
       }
       sdk.prototype.getVideoScale = function () {
           return 0;
       },
           sdk.prototype.resetVideoScale = function () {
               this._pl.skinplugin.setVideoScale(0);
               return 0;
           },
           sdk.prototype.fullVideoScale = function () {
               this._pl.skinplugin.setVideoScale(1);
           },
           sdk.prototype.setVideoRect = function (o) {
               this._pl.skinplugin.setVideoScale(o);
           },
           sdk.prototype.getLoadPercent = function () {
               if (this._pl.videoplugin) {
                   return this._pl.videoplugin.mediaPlayer.getLoadPercent();
               }
           },
           sdk.prototype.getDownloadSpeed = function () {
               return 0;
           },
           sdk.prototype.getPlayRecord = function () {
               if (this._pl.videoplugin) {
                   return this._pl.videoplugin.getPlayRecord();
               }
           },
           sdk.prototype.getPlayState = function () {
               if (this._pl.videoplugin) {
                   return this._pl.videoplugin.getPlayState();
               }
           },
           sdk.prototype.setVideoColor = function () {
               return -1;
           },
           sdk.prototype.getVideoColor = function () {
               return -1;
           },
           sdk.prototype.getVersion = function () {
               return this._pl.version;
           },
           sdk.prototype.setAutoReplay = function (loop) {
               return this._pl.videoplugin.setAutoReplay(loop);
           }
       sdk.prototype.feedback = function (o) {
           return this._pl.feedback(o);
       }
       sdk.prototype.getLog = function (f) {
           return this._pl.getLog(f)
       }
       sdk.prototype.getServerTime = function (f) {
       }
       sdk.prototype.setPlayerInfo = function (f) {
           this._pl.setPlayerInfo(f);
       }
       sdk.prototype.setHorseRaceLampInfo = function (f) {
         //  this._pl.setPlayerInfo(f);
       }
       sdk.prototype.setFullScreen = function (r) {
           this._pl.facade.dispatchEvent(new Event(SkinEvent.EVENT, SkinEvent.FULLSCREEN, r));
       }
       sdk.prototype.setPlaybackRate = function (r) {
           this._pl.facade.dispatchEvent(new Event(SkinEvent.EVENT, SkinEvent.PLAYBACKRATE, r));
       }
       sdk.prototype.setX5FullScreen=function (o) {
           if(o){
               this._pl.videoplugin.mediaPlayer.setX5Orientation("landscape");
           }else{
               this._pl.videoplugin.mediaPlayer.setX5Orientation("portrait");
           }
       }
       return sdk;
   }();/**
    * Created with JetBrains WebStorm.
    * User: xuyafeng
    * Date: 16-2-5
    * Time: 下午5:08
    * To change this template use File | Settings | File Templates.
    * 负责配置信息的处理 model.config
    */
   var PlayerConf = {
       configConver: function (option,outConfig) {
           var optionArr={lang:["zh_CN","en_US"]};
           var dOption ={
               report:true,//是非上报数据
               dfull:true,//是否是否使用默认全屏
               fullscreen:true,//是否需要全屏功能
               skinnable:true, //是非显示皮肤
               controls:false,//是非显示video默认控制条
               loop:false, //是非自动重播
               definition:true,//是非显示码率按钮
               autoSize:"0",//是否自动设置宽高
               changeParent:false,//是否修改外层宽高
               posterType:"1",//封面图类型，兼容旧的播放设计，新的必然微1
               playsinline:"1",//ios playsinline设置
               autoplay:"0",//是非自动播放
               onlyPic:false,//是非只显示图片
               playIngBg:false,//是否显示进度条中背景。主要用来控制pc端鼠标点击可以seek，移动端用来扩大触摸面积
               dvideoSize:true,//是否使用播放器默认的自动改变大小的功能（有些浏览器默认的播放器是满屏的。不会自己做等比例存处理）
               mustAutoplay:false,//是否强制自动播放
               next:false,//是非有下一集按钮
               setBtn:false,//是否有设置按钮
               seek:true,//是否显示seek按钮
               share:false,//是否显示分享按钮
               controlBarVisible:true,//是否显示下部控制条
               bigPlayBtnVisible:true,//是否显示大按钮
               lang:"zh_CN",//语言
               pageControls:false,//是否使用默认css去掉控件
               endToLiveback:false,//是否开启直播秒转，默认不开启
               x5Type:"x5",//设置为h5时启用安卓微信同层播放器
               x5Fullscreen:"1",
               x5Orientation:"landscape|portrait",
               x5AutoOrientation:false,
               showError:true,
               rotateBtn:true
           }
   
           //必然不显示设置按钮
           option.setBtn = false;
           //必然不显示分享
           option.share = false;
           //不通参数的处理
           if (option.hasOwnProperty("pa")) {
               option.pano = option.pa;
               delete option.pa;
           }
           if (option.hasOwnProperty("auto_play")) {
               option.autoplay = option.auto_play;
               delete option.auto_play;
           }
           if (option.hasOwnProperty("autoReplay")) {
               option.loop = option.autoReplay=="1";
               delete option.autoReplay;
           }
           if(option.hasOwnProperty("url")){
               option.report =false;
               option.nskin = 7;
               option.definition =false;
           }
   
           //报错外部设置的设置
           if(parseInt(option.posterType)<0&&!option.hasOwnProperty("controls")&&!option.hasOwnProperty("skinnable")){
               option.controls ="1";
               option.skinnable ="0";
           }
           outConfig.skinnable = 1;
           outConfig.controls = 1;
           for(var key in option){
               if(optionArr.hasOwnProperty(key)){
                   for(var i=0;i<optionArr[key].length;i++){
                       if(key==optionArr[key][i]){
                           break;
                       }
                   }
                   if(i==optionArr[key].length){
                       option[key]=optionArr[key][0];
                   }
               }
               outConfig[key] = option[key];
           }
   
           for(var key in dOption) {
               if (option.hasOwnProperty(key)) {
                   if(typeof dOption[key] == "boolean"){
                       option[key] = option[key] == "1";
                   }
               } else {
                   option[key] = dOption[key];
               }
           }
   
   
   
   
           // 如果 autoplay 传递错误，则 autoplay 为 1；
           if(parseInt(option.autoplay)>1||parseInt(option.autoplay)<0){
               option.autoplay = "0";
           }
           // 如果 posterType传递错误，则 posterType为 1；
           if(parseInt(option.posterType)>3||parseInt(option.posterType)<-2){
               option.posterType = "1";
           }
   
           // autoplay posterType 都转化为字符串
           option.autoplay +="";
           option.posterType +="";
           option.onlyPic = false;
           option.playIngBg = true;
           //根据设备做兼容处理
           switch (videoSdkTool.getDevice()) {
               case "androidPhone":
               case "androidPad":
               case "android":
                   switch (videoSdkTool.getBrowser()) {
   //                    case "qqwebview":
   //                    case "weixin":
   //                        break;
                       case "uc":
                           option.skinnable = false;
                           option.controls =true;
   
                           break;
                       default:
                           if(!option.mustAutoplay){
                               option.autoplay = "0";
                           }
                           break;
                   };
   
                   option.soundVisible = false;
                   outConfig.soundVisible = false;
                   break;
               case "iphone":
                   switch (videoSdkTool.getBrowser()) {
                       case "uc":
                           option.dfull = false;
                           break;
                       case "qq":
                           // ipone 下qq浏览器
                           option.onlyPic = true;
                           break;
                       default:
                           var ua = navigator.userAgent.toLowerCase();
                           //检查哪些浏览器需要手动设置大小
                           var dvideoSizeArr =[/cpu iphone os 8_/];
                           for(var i=0;i<dvideoSizeArr.length;i++){
                               if(dvideoSizeArr[i].test(ua)){
                                   option.dvideoSize = false;
                                   break;
                               }
                           }
                        //   option.dvideoSize = false;
                           if(parseInt(option.posterType)>=0){
                               //对于使用我们皮肤，不使用默认播放器的进行处理，发现ios7可以设置内嵌播放
                               var onlyPicUaList =[/cpu iphone os 6_/];
                               if(option.skinnable){
                                   for(var i=0;i<onlyPicUaList.length;i++){
                                       if(onlyPicUaList[i].test(ua)){
                                           option.onlyPic = true;
                                           break;
                                       }
                                   }
                               }
                           }
                           break;
                   }
                   option.soundVisible = false;
                   outConfig.soundVisible = false;
               case "ipad":
                   switch (videoSdkTool.getBrowser()) {
                       case "qqwebview":
                           var ua = navigator.userAgent.toLowerCase();
                           if(/cpu iphone os 8_/.test(ua)){
                               if(!option.mustAutoplay){
                                   option.autoplay = "0";
                               }
                           }
                           break;
                       default:
                           if(!option.mustAutoplay){
                               option.autoplay = "0";
                           }
                           break;
                   }
                   break;
               case "pc":
                   option.playIngBg = false;
                   break;
           }
       }
   }/**
    * Created with JetBrains WebStorm.
    * User: xuyafeng
    * Date: 15-9-11
    * Time: 下午5:54
    * To change this template use File | Settings | File Templates.
    *
    * 此类主要控制播放器流程
    *
    * Global主要是ui方面控制，比如全屏
    */
   var BaseH5Player = function () {
       function h5player() {
           this.init();
       };
       ClassTool.inherits(h5player, ClassObject);
       /*
        * 初始化
        * */
       h5player.prototype.init = function () {
           this.api = new H5Sdk(this);
       }
       /*
        * 安装
        * */
       h5player.prototype.setUp = function (option, container,outEl) {
           var m = this;
           m.canplay = false;
           m.vModelInit = false;
   
           m.model = new Model();
   
           m.setModelByEnv();
   
   
           m.model.api = m.getVideoApi();
   
           m.model.outConfig ={};
   
           m.configHanlder(option,m.model.outConfig);
   
           m.model.config.refresh(option);
   
           m.model.playerConfig.refresh({version:this.version});
   
           m.initPlugin();
   
           m.facade = new Facade();
           //初始化所有单例
           m.facade.init(m.model.config);
   
           m.reportplugin = new ReportPlayer(m.facade, m.model);
           m.reportplugin.setUp();
   
           m.globalplugin = new GlobalPlayer(m.facade, m.model);
           m.globalplugin.setUp(m);
   
           m.skinplugin = new SkinPlayer(m.facade, m.model);
           m.skinplugin.setUp(option, container,outEl);
           m.errorplugin = new ErrorPlayer(m.facade, m.model);
           m.errorplugin.setUp(m,m.skinplugin.el.error,m.api);
   
           m.addEvents();
           if(m.envCheck()){
               m.startGetData();
           }
       }
       h5player.prototype.initPlugin = function () {
       }
       /*
       *  环境监测
       * */
       h5player.prototype.envCheck = function () {
           var me=this;
           if(this.model.config.pano=="1"){
               return me.checkPano();
           }
           return true;
       }
       h5player.prototype.checkPano = function () {
           if(videoSdkTool.checkPano()){
               return true;
           }else{
               this.facade.dispatchEvent(new Event(PlayerEvent.EVENT, PlayerEvent.VIDEO_INFO,[{code:ERR.NOSupport, message:Message.NoSupportPano}]));
               return false;
           }
       }
       //环境判断
       h5player.prototype.setModelByEnv = function () {
           switch(videoSdkTool.getDevice()){
               case "pc":
               case "mac":
                   this.model.systemData.refresh({pc:true});
                   break;
               default:
                   this.model.systemData.refresh({pc:false});
                   break;
           }
   
       }
       /*
        *  对用户设置参数进行处理
        * */
       h5player.prototype.configHanlder = function (option,outConfig) {
           PlayerConf.configConver(option,outConfig);
           if(option.hasOwnProperty("p")){
               this.model.videoSetting.p = option.p;
           }
       }
       /*
        * 全部侦听
        * */
       h5player.prototype.addEvents = function () {
           this.facade.addEventListener(SkinEvent.EVENT, this.skinHandler, this);
           this.facade.addEventListener(PlayerEvent.EVENT, this.videoHandler, this);
           this.facade.addEventListener(PlayerEvent.NEXT, this.nextHandler, this);
       }
   
       /*
        * 全部侦听
        * */
       h5player.prototype.removedEvents = function () {
           this.facade.removeEventListener(SkinEvent.EVENT, this.skinHandler, this);
           this.facade.removeEventListener(PlayerEvent.EVENT, this.videoHandler, this);
           this.facade.removeEventListener(PlayerEvent.NEXT, this.nextHandler, this);
       }
       /*
        *  开始请求gpc
        * */
       h5player.prototype.startGetData = function () {
           this.log("开始请求数据");
           this.vModel = new ModelHandler(this.model);
           this.vModel.addEventListener(LoadEvent.LOADCMP, this.dataCmp, this);
           this.vModel.addEventListener(LoadEvent.LOADERROR, this.errorHanlder, this);
           this.vModel.setUp(this.model.config, this.skinplugin);
           this.facade.dispatchEvent(new Event(PlayerEvent.EVENT, PlayerEvent.VIDEO_DATA_START));
       }
       /*
        *  gpc请求成功
        * */
       h5player.prototype.dataCmp = function () {
           this.log("请求GpC成功");
           var m = this;
           if (m.model.videoSetting.isdrm == "0") {
               m.setupPlayer();
               m.vModelInit = true;
               //皮肤ok之后开始播放
               m.skinplugin.addEventListener(LoadEvent.LOADCMP,this.skinCmp,this);
               m.facade.color.register(this.model.config);
               m.facade.dispatchEvent(new Event(PlayerEvent.EVENT, PlayerEvent.VIDEO_DATA_CMP));
               m.skinplugin.load();
           } else {
               m.facade.dispatchEvent(new Event(PlayerEvent.EVENT, PlayerEvent.ERROR,[{code:ERR.VOD_CONFIG_DRM, message:Message.Drm}]));
           }
       }
       /*皮肤加载完成事件监听器*/
       h5player.prototype.skinCmp = function(){
           var m=this;
           if(videoSdkTool.getBrowser() == 'chrome'){
               m.model.config.autoplay = 0;
           }
           if (m.model.config.autoplay == "0") {
               m.videoplugin.showPoster();
           } else {
               m.videoplugin.startAuth();
           }
       }
       /*
        *  gpc请求成功
        * */
       h5player.prototype.setupPlayer = function () {
           this.log("开始创建播放器");
           if (this.videoplugin) {
               return;
           }
           this.videoplugin = new VideoPlayer(this.facade, this.model);
           this.videoplugin.setUp(this.model.videoSetting, this.skinplugin.el.video);
       }
   
       h5player.prototype.creatVideo = function () {
           this.log("开始创建视频");
           this.videoplugin.startPlay(this.skinplugin.getVideArea());
       }
       h5player.prototype.setupAdplugin = function () {
           this.model.record.as = videoSdkTool.now();
           this.log("开始请求广告");
           this.adplugin = new AdCtrl(this.facade, this.model);
           this.facade.addEventListener(AdEvent.EVENT, this.adHandler, this);
           this.adplugin.setUp(this.videoplugin.mediaPlayer, this.skinplugin.el);
       }
       /*
        *  gpc请求失败
        * */
       h5player.prototype.errorHanlder = function (e) {
           this.log("数据请求失败");
           this.facade.dispatchEvent(new Event(PlayerEvent.EVENT, PlayerEvent.ERROR, e.args[1]));
       }
       h5player.prototype.adHandler = function (e) {
           this.log("广告返回" + e.args[1]);
           var m = this;
           switch (e.args[1]) {
               case AdEvent.HEADSTART:
                   //广告上报
                   this.model.joint = 2;
                   m.facade.dispatchEvent(new Event(PlayerEvent.EVENT, AdEvent.HEADSTART));
                   break;
               case AdEvent.HEADEND:
               case AdEvent.NOAD:
                   //广告上报
                   (e.args[1]==AdEvent.HEADEND)?(this.model.joint = 2):(this.model.joint = 0);
                   m.facade.removeEventListener(AdEvent.EVENT, m.adHandler, m);
                   m.facade.dispatchEvent(new Event(PlayerEvent.EVENT, e.args[1], e.args[2]));
                   m.creatVideo();
                   break;
           }
       }
       /*
        *  视频状态处理
        * */
       h5player.prototype.videoHandler = function (e) {
           var m = this;
           this.vStateHandler(e);
           switch (e.args[1]) {
               case PlayerEvent.VIDEO_AUTH_VALID:
                   if(m.videoplugin.getPlayerType() == "pano"&&!m.checkPano())
                       return;
                   m.canplay = true;
                   m.setupAdplugin();
                   break;
               case PlayerEvent.VIDEO_DATA_START:
               case PlayerEvent.GSLB_START:
               case PlayerEvent.GSLB_CMP:
               case PlayerEvent.VIDEO_DATA_CMP:
               case MediaEvent.PLAYING:
               case MediaEvent.LODING:
               case MediaEvent.COMPLETE:
                   return;
                   break;
               case PlayerEvent.INIT:
                   if(m.model.config.autoSize!="0"){
                       m.skinplugin.autoSize();
                   }
                   //播放器初始化后
                   m.model.playerConfig.refresh({pWidth:m.skinplugin.el.offsetWidth,pHeight:m.skinplugin.el.offsetHeight});
                   break;
               case PlayerEvent.WPH:
                   this.destroy();
                   return;
                   break;
               case PlayerEvent.CHANGESTREAM:
                   this.startGetData();
                   return;
           }
           if (m.model.config.hasOwnProperty("callbackJs")) {
               var type = e.args[1], data = e.args[2];
               if (type == PlayerEvent.ERROR) type = MediaEvent.ERROR;
               WIN[this.model.config.callbackJs] && WIN[m.model.config.callbackJs](type, data);
           }
       }
       h5player.prototype.nextHandler = function (e) {
           if(e.args[2]&&e.args[2].hasOwnProperty("nextvid")&&e.args[2].nextvid!=""){
               this.playNewId({vu:e.args[2].nextvid});
           }
       }
       h5player.prototype.vStateHandler = function (e) {}
       h5player.prototype.skinHandler = function (e) {}
       h5player.prototype.destroy = function () {
           var m = this;
           m.skinplugin && (m.skinplugin.shutDown(),m.skinplugin.removeEventListener(LoadEvent.LOADCMP,this.skinCmp,this));
           m.globalplugin && m.globalplugin.destroy();
           if (m.videoplugin) {
               m.videoplugin.destroy();
               //this.videoplugin = null;
           }
           m.removedEvents();
           if (m.vModel) {
               m.vModel.destroy();
               m.vModel = null;
           }
           if (m.adplugin) {
               m.adplugin.destroy();
               m.adplugin = null;
           }
           if (m.reportplugin) {
               m.reportplugin.destroy();
           }
       }
       //关闭视频
       h5player.prototype.closeVideo = function () {
           this.videoplugin.destroy();
       }
       //清楚播放器
       h5player.prototype.shutDown = function () {
           this.destroy();
           this.addEvents();
           //this.setupPlayer();
           this.videoplugin && this.videoplugin.showPoster();
       }
       // 启动播放器
       h5player.prototype.startUp = function () {
           this.log("call startUp -vModelInit:"+this.vModelInit);
           //如果刚开始要调用这个接口需要
           this.destroy();
           if (!this.vModelInit) {
               this.model.config.autoplay = "1";
               this.reportplugin.setUp();
               this.addEvents();
               this.startGetData();
           } else {
               this.reportplugin.setUp();
               this.addEvents();
               //  this.setupPlayer();
               this.videoplugin && this.videoplugin.startAuth();
           }
       }
       h5player.prototype.playNewId = function (option) {
           var m= this,autoplay="";
           //如果刚开始要调用这个接口需要
           m.destroy();
           //重新播放，则小会视频控制器， ipone上新建video标签不可以用哈
           m.model.clear();
           m.setModelByEnv();
           m.model.playerConfig.refresh({version:m.version});
           m.model.init({deviceId:m.model.lc(), os:videoSdkTool.getOs(), osv:"-", width:window.screen.width, height:window.screen.height, appv:m.version});
           m.vModelInit = false;
           if (m.canplay && !option.hasOwnProperty("autoplay")){
               autoplay ="1";
           }
           m.configHanlder(option,m.model.outConfig);
           if(autoplay!="") option.autoplay=autoplay;
           //切换后自动播放
           m.model.config.refresh(option);
           m.reportplugin.setUp();
           m.addEvents();
           m.startGetData();
       }
       h5player.prototype.feedback = function (option) {
           //this.reportplugin.showLog();
           if (typeof option == "undefined") {option ={};}
           option.type="0";
           option.logcontent = this.api.getLog();
           this.reportplugin.report(option);
       }
       h5player.prototype.getLog = function () {
           return this.reportplugin.getLog();
       }
       h5player.prototype.getVideoApi = function () {
           var m = this;
           return {
               getVideoInfo:function () {
                   return {time:m.videoplugin.mediaPlayer.getTime()};
               }
           };
       }
       h5player.prototype.setPlayerInfo = function (config) {
           var m = this;
           var newKeys ={buttonColor:"fault",progressBarColor:"active"};
           if(config.hasOwnProperty("onoff")){
               for(var key in config.onoff){
                   config[key] =config.onoff[key];
               }
               delete config.onoff;
           }
           for(var key in config){
               if(newKeys.hasOwnProperty(key)){
                   config[newKeys[key]] = config[key];
                   delete config[key];
               }
               if(typeof this.model.config[key] == "boolean"){
                   config[key] = (config[key]+"")=="1";
               }
           }
           var playerData = {};
           playerData.logo = config.logo;
           playerData.watermark = config.watermark;
           this.model.playerConfig.refresh(playerData);
           this.model.config.refresh(config);
           //key转换
           //修改全局color
           m.facade.color.refresh(config);
           //皮肤刷新播放器配置
           m.skinplugin.refreshPlayerInfo(config);
           //视频核心刷新播放器配置
           m.videoplugin.refreshPlayerInfo(config);
       }
       return h5player;
   }();
   /**
    * Created with JetBrains WebStorm.
    * User: xuyafeng
    * Date: 15-9-11
    * Time: 下午5:54
    * To change this template use File | Settings | File Templates.
    */
   var BlH5Player = function () {
       function h5player() {
           this.superClass.constructor.apply(this, arguments);
       };
       ClassTool.inherits(h5player, BaseH5Player);
       /*
        * 初始化
        * */
       h5player.prototype.init = function () {
           this.superClass.init.apply(this, arguments);
           this.version = "H5_Vod_20190514_4.5.20";
       }
       h5player.prototype.setModelByEnv = function () {
           this.superClass.setModelByEnv.apply(this, arguments);
           this.model.videoSetting.p = 101;
           this.model.playType = "vod";
           this.model.videoSetting.gslb = true;
           if (videoSdkTool.isHttps()) {
               this.model.videoSetting.gslb =false;
           }
       }
       h5player.prototype.initPlugin = function () {
           SOTool.setPluginStack([
               {name:"ErrorInfo",url:"//{domain}/p/{LANG}/plugin/errorRender.js"}
               ,{name:"FeedbackInfo",url:"//{domain}/p/{LANG}/plugin/feedbackRender.js"}
               ,{name:"PanoRender",url:"//{domain}/p/{LANG}/plugin/panoRender1.2.js"}
               ,{name:"Ad",url:"//{domain}/p/{LANG}/plugin/a.js"}
               ,{name:"ssp",url:"//{domain}/p/{LANG}/plugin/ssp.js"}
               ,{name:"lang.message.plugin.vod",url:"//{domain}/p/{LANG}/plugin/lang/lang_vod.js"}
               ,{name:"media.hlsnew",url:"//{domain}/player/plugin/hlsnew.js"}
           ],this.model.config.lang);
           //设置预加载的模块
           SOTool.preload("lang.message.plugin.vod","ErrorInfo","media.hlsnew");
       }
       return h5player;
   }();/**
    * Created with JetBrains WebStorm.
    * User: xuyafeng
    * Date: 15-9-14
    * Time: 下午6:14
    * To change this template use File | Settings | File Templates.
    */
   /*
    *  自动适配h5播放器和 flash播放器
    * */
   var BlFlashPlayer = function () {
       function flashPlayer(ver) {
           this.minVer = ver;
       }
   
       flashPlayer.prototype = {
           setUp:function (option, container) {
               var swfUrl ="http://yuntv.letv.com/bcloud.swf";
               if (videoSdkTool.isHttps()) {
                   swfUrl = "https://yuntv.letv.com/bclouds.swf";
               }
               if(option.hasOwnProperty("p")&&option.p!=101){
                   //saas 播放器
                   swfUrl ="http://yuntv.letv.com/player/vrp/vrp.swf";
               }
               if(option.hasOwnProperty("swf")){
                   swfUrl = option.swf;
               }
               if(option.hasOwnProperty("url")){
                   swfUrl="http://yuntv.letv.com/player/live/direct/direct.swf";
               }
               DomainTool.getDomain(swfUrl);
               if(option.hasOwnProperty("callback")){
                   option.callbackJs= option.callback;
                   delete option.callback;
               }
               var wmode ="Opaque";//direct
               if(option.hasOwnProperty("wmode")){
                   wmode = option.wmode;
                   delete option.wmode;
               }
               if(wmode=="Opaque"){
                   option.panoType =1;
               }
               this.id = FlashPlayer.create(container, {url:swfUrl,version:this.minVer,wmode:wmode}, this.flashvarsToString(option));
               this.plugin = FlashPlayer.getPlayer(this.id);//this.playerPlugin=(this.isIE)?this.$E(this.id):document[this.id];
               this.api = new FlashSdk(this);
           },
           flashvarsToString:function (flashvars) {
               var r = ""
               for (var key in flashvars) {
                   r += key + "=" + flashvars[key] + "&"
               }
               return r;
           }
       }
       return flashPlayer;
   }();/**
    * Created with JetBrains WebStorm.
    * User: xuyafeng
    * Date: 15-9-14
    * Time: 下午6:14
    * To change this template use File | Settings | File Templates.
    */
   /*
    *  自动适配h5播放器和 flash播放器
    * */
   var CloudPlayer = function () {
       var MinFlashVer = 10;
       function cloudPlayer(option) {
           this.init(option);
       }
   
       cloudPlayer.prototype = {
           /*
            *  初始化
            * */
           init:function (option) {
               var type = this.check(option);
               switch (type) {
                   case "swf":
                       this.player = new BlFlashPlayer(MinFlashVer);
                       break;
                   default:
                       this.player = new BlH5Player();
                       break;
               }
           },
           /*
            *  安装播放器
            * */
           setUp:function (option, el, container) {
               this.player.setUp.apply(this.player,arguments);
           },
           /*
            * 检测使用哪种方式播放
            * */
           check:function (option) {
               if(option.hasOwnProperty("au")){
                   return "audio";
               }
               if (option.hasOwnProperty("type")) {
                   return option.type;
               }
               if (option.hasOwnProperty("dbd") && option.dbd == "LETV") {
                   return "h5";
               }
               if (videoSdkTool.getOs() != "android" && videoSdkTool.getDevice() != "iphone" && videoSdkTool.getDevice() != "ipad") {
                   if (FlashPlayer.check(MinFlashVer)){
                       return "swf";
                   }
               }
               if(!!document.createElement('video').canPlayType){
                   return "h5"
               }else{
                   return "swf";
               }
           }
       }
       return cloudPlayer;
   }();/**
    * Created with JetBrains WebStorm.
    * User: xuyafeng
    * Date: 15-9-11
    * Time: 下午4:07
    * To change this template use File | Settings | File Templates.
    */
   var LecloudVodPlayer = function () {
       function setUpUi(option, container) {
           var mainTpl = '<div id="#{player}" style="position: relative;width: {width};height:{height};margin-right:auto;margin-left:auto"></div>',
               width = "100%",
               height = "100%",
               elUuid = "player" + videoSdkTool.creatUuid();
           if (option.hasOwnProperty("width")) {
               if (!isNaN(option.width)) {
                   width = option.width + "px";
               } else {
                   if (width.indexOf("%") != -1) {
                       width = option.width;
                   }
               }
           }
           if (option.hasOwnProperty("height")) {
               if (!isNaN(option.height)) {
                   height = option.height + "px";
               } else {
                   if (height.indexOf("%") != -1) {
                       height = option.height;
                   }
               }
           }
           var elp = mainTpl.replace(/{width}/g, width);
           elp = elp.replace(/{height}/g, height);
           elp = elp.replace(/#{player}/g, elUuid);
           if (typeof container == "string" && container != "" && UiTool.$E(container)) {
               UiTool.$E(container).innerHTML = elp;
           } else {
               DC.write(elp)
           }
           return elUuid;
       };
       function start(option, el, container) {
           var cloudPlayer = new CloudPlayer(option);
           //创建播放器
           cloudPlayer.setUp(option, el, container);
           return cloudPlayer.player;
       };
       function player() {
       }
       ClassTool.inherits(player, ClassObject);
       player.prototype.init = function (option, container, old) {
           var el = setUpUi(option, container),
               player = start(option, el, container);
           this.sdk = new Api(player);
           //为了兼容旧的使用方式
           if (old) {
               function videoHandler(e) {
                   switch (e.args[1]) {
                       case PlayerEvent.INIT:
                           player.facade.removeEventListener(PlayerEvent.EVENT, videoHandler, this);
                           if (option.hasOwnProperty("callback")) {
                               if (typeof  option.callback == 'function') {
                                   option.callback && option.callback(player.videoplugin.mediaPlayer.player.video);
                               } else {
                                   option.callback && WIN[ option.callback]&&WIN[ option.callback](player.videoplugin.mediaPlayer.player.video);
                               }
                           }
                           break;
                   }
               }
               //兼容旧的播放器
               player.facade && player.facade.addEventListener(PlayerEvent.EVENT, videoHandler, this);
           }
   
       }
       return player;
   }();
   WIN.CloudVodPlayer = LecloudVodPlayer;
   
   
   //兼容旧的方式
   if (typeof WIN.letvcloud_player_conf != "undefined") {
       var p = new CloudVodPlayer();
       if (WIN.letvcloud_player_conf.hasOwnProperty("callbackJs")) {
           WIN.letvcloud_player_conf.callback = WIN.letvcloud_player_conf.callbackJs;
           delete WIN.letvcloud_player_conf.callbackJs;
       }
       if(!WIN.letvcloud_player_conf.hasOwnProperty("posterType")){
           WIN.letvcloud_player_conf.posterType = "-1";
           var ua = navigator.userAgent.toLowerCase();
           if(ua.indexOf('iphone') > -1 && ua.indexOf('mac') > -1&&ua.indexOf('7.0')>-1){
               WIN.letvcloud_player_conf.posterType = "-2";
           }
       };
       p.init(WIN.letvcloud_player_conf, "", true);
       WIN.letvcloud_player_conf = undefined;
       WIN.Util = {
           setRate:function (type) {
               p.sdk.setDefinition(type);
           },
           getRate:function () {
               return p.sdk.getDefinition();
           }
       }
   }
   })(document, undefined);