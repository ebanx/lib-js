!function(e,t){"object"==typeof exports&&"object"==typeof module?module.exports=t():"function"==typeof define&&define.amd?define([],t):"object"==typeof exports?exports.Ebanx=t():e.Ebanx=t()}(this,function(){return function(e){function t(n){if(r[n])return r[n].exports;var i=r[n]={exports:{},id:n,loaded:!1};return e[n].call(i.exports,i,i.exports,t),i.loaded=!0,i.exports}var r={};return t.m=e,t.c=r,t.p="",t(0)}([function(e,t){"use strict";var r="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e},n=function(){var e={},t={country:"",mode:"test",publicKey:""};if(e.config=function(){return{isLive:function(){return"production"===t.mode},setPublishableKey:function(e){n.validator.config.validatePublishableKey(e,function(r){t.publicKey=String(e)})},setCountry:function(e){n.validator.config.validateCountry(e),t.country=String(e)},setMode:function(e){n.validator.config.validateMode(e),t.mode=e},getMode:function(){return t.mode},getPublishableKey:function(){if(""===t.publicKey.trim())throw new n.errors.InvalidConfigurationError("Missing publishable key. You need set publishable key using the method Ebanx.config.setPublishableKey.","publicKey");return t.publicKey},getCountry:function(){if(""===t.country.trim())throw new n.errors.InvalidConfigurationError("Missing country.","country");return t.country}}}(),e.config.isLive()&&"https:"!==location.protocol)throw"EbanxInvalidConfigurationError: Your protocol needs to be https.";return e}();n.errors=function(){return{InvalidValueFieldError:function(e,t){this.message=e,this.field=t,this.name="InvalidValueFieldError"},InvalidConfigurationError:function(e,t){this.message=e,this.invalidConfiguration=t,this.name="InvalidConfigurationError"},ResponseError:function(e){this.message=e.message}}}(),n.validator=function(){return{config:{validatePublishableKey:function(e,t){var r=n.utils.api.resources.validPublicIntegrationKey;n.http.ajax.request({url:r.url,method:r.method,data:{public_integration_key:e}}).always(function(e){t(e)})},validateCountry:function(e){if(n.utils.availableCountries.indexOf(e)===-1)throw new n.errors.InvalidValueFieldError("Invalid transaction country. You can use one of them: "+n.utils.availableCountries+".","country")},validateMode:function(e){if(null===e.match(/^(test|production)$/))throw new n.errors.InvalidConfigurationError('Invalid mode, please, use "test" or "production" as test mode.',"mode")}},card:{validateNumber:function(e){var t=/^3[47][0-9]{13}$|^50[0-9]{14,17}$|^(636368|438935|504175|451416|636297|5067|4576|4011|50904|50905|50906)|^3(?:0[0-5]|[68][0-9])[0-9]{11}$|^6(?:011|5[0-9]{2})[0-9]{12}$|^(38|60)[0-9]{11,17}$|^5[1-5][0-9]{14}$|^4[0-9]{12}(?:[0-9]{3})?$/;if(!t.test(e)||!this.luhnAlgCheck(String(e)))throw new n.errors.InvalidValueFieldError("Invalid card number.","card_number")},validateName:function(e){if("string"!=typeof e||0===e.length)throw new n.errors.InvalidValueFieldError("The credit card name is required.")},luhnAlgCheck:function(e){var t,r,n,i;for(n=+e[t=e.length-1],i=0;t--;)r=+e[t],n+=++i%2?2*r%10+(r>4):r;return n%10===0},validateCvv:function(e){var t=new RegExp("^[0-9]{3}$");if(!t.test(e))throw new n.errors.InvalidValueFieldError("Invalid card cvv.","card_cvv")},validateDueDate:function(e){var t=(e+"").split("/");if(t={now:new Date,year:t[1],month:t[0]},/^\d+$/.test(t.month)!==!0||parseInt(t.month,10)<=12!=!0)throw new n.errors.InvalidValueFieldError("Invalid month to card due date.","card_due_date");if(!/^\d+$/.test(t.year))throw new n.errors.InvalidValueFieldError("Invalid year to card due date.","card_due_date");if(t.expiration=new Date(t.year,t.month),t.expiration.setMonth(t.expiration.getMonth()-1),t.expiration.setMonth(t.expiration.getMonth()+1,1),t.expiration>t.now!=!0)throw new n.errors.InvalidValueFieldError("Invalid card due date.","card_due_date")},validate:function(e){this.validateName(e.card_name),this.validateNumber(e.card_number),this.validateDueDate(e.card_due_date),this.validateCvv(e.card_cvv)}}}}(),n.tokenize=function(){return{card:{token:function(e,t){var r=n.utils.api.resources.createToken;n.http.ajax.request({url:r.url,method:r.method,json:!0,data:{request_body:JSON.stringify({public_integration_key:n.config.getPublishableKey(),payment_type_code:n.utils.creditCardScheme(e.card_number),country:n.config.getCountry(),card:e})}}).always(function(e){if("ERROR"===e.status||!("token"in e))throw new n.errors.ResponseError(e.status_message||"Error to tokenize.");t(e)})}}}}(),n.utils=function(){var e={api:{path:n.config.isLive()?"https://api.ebanx.com/":"https://sandbox.ebanx.com/"},availableCountries:["br","cl","co","mx","pe"].join(", "),creditCardScheme:function(e){n.validator.card.validateNumber(e);var t={amex:/^3[47][0-9]{13}$/,aura:/^50[0-9]{14,17}$/,elo:/^(636368|438935|504175|451416|636297|5067|4576|4011|50904|50905|50906)/,diners:/^3(?:0[0-5]|[68][0-9])[0-9]{11}$/,discover:/^6(?:011|5[0-9]{2})[0-9]{12}$/,hipercard:/^(38|60)[0-9]{11,17}$/,mastercard:/^5[1-5][0-9]{14}$/,visa:/^4[0-9]{12}(?:[0-9]{3})?$/};for(var r in t)if(t[r].test(e))return r;throw new n.errors.InvalidValueFieldError("Credit card scheme not found.","card_number")}};return e.api.url=e.api.path+"ws",e.api.resources={createToken:{url:e.api.url+"/token",method:"get"},validPublicIntegrationKey:{url:e.api.url+"/merchantIntegrationProperties/isValidPublicIntegrationKey",method:"get"},fingerPrintResource:{url:e.api.path+"fingerprint/",method:"get"},fingerPrintProvidersResource:{url:e.api.path+"fingerprint/provider",method:"post"}},e}(),n.http=function(){return{normalize:{q:function(e,t){function n(e,t){var i=[];return t=t||[],Object.keys(e).forEach(function(o){if(e.hasOwnProperty(o)){var a=t.slice();a.push(o);var s=[];"object"==r(e[o])?s=n(e[o],a):s.push({path:a,val:e[o]}),s.forEach(function(e){return i.push(e)})}}),i}var i=n(e);i=i.map(function(e){if(1==e.path.length)e.path=e.path[0];else{var t=e.path[0],r=e.path.slice(1);e.path=t+"["+r.join("][")+"]"}return e});var o=i.map(function(e){return e.path+"="+e.val}).join("&");return t?encodeURIComponent(o):o}},ajax:{request:function(e){"string"==typeof e&&(e={url:e}),e.url=e.url||"",e.method=e.method||"get",e.data=e.data||{};var t={host:{},process:function(e){var t=this;return this.xhr=null,window.ActiveXObject?this.xhr=new window.ActiveXObject("Microsoft.XMLHTTP"):window.XMLHttpRequest&&(this.xhr=new XMLHttpRequest),this.xhr&&(this.xhr.onreadystatechange=function(){if(4==t.xhr.readyState){var r=t.xhr.responseText||"{}";e.json===!0&&"undefined"!=typeof JSON&&(r=JSON.parse(r)),t.alwaysCallback&&t.alwaysCallback.apply(t.host,[r,t.xhr])}}),this.xhr.open("GET",e.url+"?"+n.http.normalize.q(e.data),!0),setTimeout(function(){t.xhr.send()},20),this},always:function(e){return this.alwaysCallback=e,this}};return t.process(e)}}}}(),n.card=function(){var e={};return e.createToken=function(e,t){var r={data:{},error:{}};try{n.validator.card.validate(e),n.tokenize.card.token(e,function(e){r.data=e,n.deviceFingerprint.setup(function(e){r.data.deviceId=e,t(r)})})}catch(i){i instanceof n.errors.InvalidValueFieldError,r.error.err=i,t(r)}},e}(),n.deviceFingerprint=function(){var e={},t={ebanx_session_id:null,providerSessionList:[],providerPostPending:null};return t.providers={kount:{setup:function(e,r){this.build(e),r(t.ebanx_session_id)},build:function(e){var r=document,i=r.createElement("iframe");i.width=1,i.height=1,i.frameborder=0,i.scrolling="no",i.src=n.utils.api.path+"fingerprint/kount?m="+e.merchant_id+"&s="+t.ebanx_session_id,i.style.border=0,i.style.position="absolute",i.style.top="-200px",i.style.left="-200px",r.getElementsByTagName("body")[0].appendChild(i)}},mercadopago:{setup:function(e,t){t(this._mpGetDeviceID())},_mpGuid:function(){function e(){return Math.floor(65536*(1+Math.random())).toString(16).substring(1)}return e()+e()+"-"+e()+"-"+e()+"-"+e()+"-"+e()+e()+e()},_mpGetDeviceID:function(){var e=this._mpGuid(),t=function(e,t,r){var n,i,o,a,s=t||{},u=r||{};s.type="application/x-shockwave-flash",window.ActiveXObject?(s.classid="clsid:d27cdb6e-ae6d-11cf-96b8-444553540000",u.movie=e):s.data=e,i="<object";for(n in s)i+=" "+n+'="'+s[n]+'"';i+=">";for(n in u)i+='<param name="'+n+'" value="'+u[n]+'" />';return i+="</object>",o=document.createElement("div"),o.innerHTML=i,a=o.firstChild,o.removeChild(a),a};(new Image).src="https://content.mercadopago.com/fp/clear.png?org_id=jk96mpy0&session_id="+e+"&m=1",(new Image).src="https://content.mercadopago.com/fp/clear.png?org_id=jk96mpy0&session_id="+e+"&m=2";var r=document.createElement("script");r.type="text/javascript",r.src="https://content.mercadopago.com/fp/check.js?org_id=jk96mpy0&session_id="+e,document.body.appendChild(r);var n=t("https://content.mercadopago.com/fp/fp.swf?org_id=jk96mpy0&session_id="+e,{id:"obj_id",width:1,height:1},{movie:"https://content.mercadopago.com/fp/fp.swf?org_id=jk96mpy0&session_id="+e});return document.body.appendChild(n),e}}},t.getList=function(e){var t=n.utils.api.resources.fingerPrintResource;n.http.ajax.request({json:!0,url:t.url,method:t.method,data:{country:n.config.getCountry(),publicIntegrationKey:n.config.getPublishableKey()}}).always(function(t){e(t)})},t.saveProviderSessionList=function(e){t.providerPostPending&&clearTimeout(t.providerPostPending),t.providerSessionList.push(e),t.providerPostPending=setTimeout(t.postProviderSessionList,1e3)},t.postProviderSessionList=function(){var e=t.providerSessionList;t.providerSessionList=[],clearTimeout(t.providerPostPending),t.providerPostPending=null;var r=n.utils.api.resources.fingerPrintProvidersResource;n.http.ajax.request({url:r.url,method:r.method,data:{publicIntegrationKey:n.config.getPublishableKey(),ebanx_session_id:t.ebanx_session_id,providers:e}}).always(function(e){})},e.setup=function(e){t.getList(function(r){r&&r.ebanx_session_id&&(t.ebanx_session_id=r.ebanx_session_id,e(r.ebanx_session_id),r.providers.forEach(function(e){t.providers[e.provider].setup(e.settings,function(r){t.saveProviderSessionList({provider:e.provider,session_id:r})})}))})},e}(),e.exports=n}])});