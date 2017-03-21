!function(e,t){"object"==typeof exports&&"object"==typeof module?module.exports=t():"function"==typeof define&&define.amd?define([],t):"object"==typeof exports?exports.EBANX=t():e.EBANX=t()}(this,function(){return function(e){function t(i){if(r[i])return r[i].exports;var n=r[i]={exports:{},id:i,loaded:!1};return e[i].call(n.exports,n,n.exports,t),n.loaded=!0,n.exports}var r={};return t.m=e,t.c=r,t.p="",t(0)}([function(e,t){"use strict";var r="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e},i=function(){var e={},t={country:"",mode:"test",publicKey:""};if(e.config=function(){return{isLive:function(){return"production"===t.mode},setPublishableKey:function(e){i.validator.config.validatePublishableKey(e,function(){t.publicKey=String(e)})},setCountry:function(e){i.validator.config.validateCountry(e),t.country=String(e)},setMode:function(e){i.validator.config.validateMode(e),t.mode=e},getMode:function(){return t.mode},getPublishableKey:function(){if(""===t.publicKey.trim())throw new i.errors.InvalidConfigurationError("Missing publishable key. You need set publishable key using the method EBANX.config.setPublishableKey.","publicKey");return t.publicKey},getCountry:function(){return t.country||(t.country="br"),t.country},getLocale:function(){var e={br:"pt_BR",mx:"es"};return e[i.config.getCountry()]}}}(),e.config.isLive()&&"https:"!==location.protocol)throw"EBANXInvalidConfigurationError: Your protocol needs to be https.";return e}();i.errors=function(){return{summary:{pt_BR:{"BP-DR-76":"País não informado.","BP-DR-77":"País não permitido.","BP-DR-75":"O número do cartão de crédito é inválido.","BP-DR-S-75":"A bandeira do cartão de crédito é inválida.","BP-DR-51":"Insira o nome que está impresso no cartão de crédito.","BP-DR-55":"O código do cartão de crédito é inválido.","BP-DR-57":"A data do cartão de crédito deve estar no formato mes/ano, por exemplo, 12/2020.","BP-DR-M-57":"O mês data do cartão de crédito é inválido.","BP-DR-Y-57":"O ano data do cartão de crédito é inválido."},es:{"BP-DR-76":"País não informado.","BP-DR-77":"País não permitido.","BP-DR-75":"El número de tarjeta de crédito es inválido.","BP-DR-S-75":"El bandera de tarjeta de crédito es inválido.","BP-DR-51":"Por favor, introduce el nombre como está en tu tarjeta de crédito.","BP-DR-55":"El código de tarjeta de crédito es inválido.","BP-DR-57":"Por favor, escribe la fecha en el formato MM/AAAA.","BP-DR-M-57":"El mes de tarjeta de crédito es inválido.","BP-DR-Y-57":"El año de tarjeta de crédito es inválido."}},InvalidValueFieldError:function(e,t){this.message=i.errors.summary[i.config.getLocale()][e]||e,this.field=t,this.name="InvalidValueFieldError"},InvalidConfigurationError:function(e,t){this.message=i.errors.summary[i.config.getLocale()][e]||e,this.invalidConfiguration=t,this.name="InvalidConfigurationError"}}}(),i.validator=function(){return{config:{validatePublishableKey:function(e,t){var r=i.utils.api.resources.validPublicIntegrationKey();i.http.ajax.request({url:r.url,method:r.method,data:{public_integration_key:e}}).always(function(e){t(e)})},validateCountry:function(e){if(i.utils.availableCountries.indexOf(e)===-1)throw new i.errors.InvalidValueFieldError("BP-DR-77","country")},validateMode:function(e){if(null===e.match(/^(test|production)$/))throw new i.errors.InvalidConfigurationError('Invalid mode, please, use "test" or "production" as test mode.',"mode")}},card:{validateNumber:function(e){var t=/^3[47][0-9]{13}$|^50[0-9]{14,17}$|^(636368|438935|504175|451416|636297|5067|4576|4011|50904|50905|50906)|^3(?:0[0-5]|[68][0-9])[0-9]{11}$|^6(?:011|5[0-9]{2})[0-9]{12}$|^(38|60)[0-9]{11,17}$|^5[1-5][0-9]{14}$|^4[0-9]{12}(?:[0-9]{3})?$/;if(!t.test(e)||!this.luhnAlgCheck(String(e)))throw new i.errors.InvalidValueFieldError("BP-DR-75","card_number")},validateName:function(e){if("string"!=typeof e||0===e.length||null!==e.match(/[0-9]+/))throw new i.errors.InvalidValueFieldError("BP-DR-51","card_name")},luhnAlgCheck:function(e){var t,r,i,n;for(i=+e[t=e.length-1],n=0;t--;)r=+e[t],i+=++n%2?2*r%10+(r>4):r;return i%10===0},validateCvv:function(e){var t=new RegExp("^[0-9]{3,4}$");if(!("string"==typeof e&&e instanceof String&&e.toString().match(t)))throw new i.errors.InvalidValueFieldError("BP-DR-55","card_cvv")},validateDueDate:function(e){var t=(e+"").split("/");if(t={now:new Date,year:t[1],month:t[0]},/^\d+$/.test(t.month)!==!0||parseInt(t.month,10)<=12!=!0)throw new i.errors.InvalidValueFieldError("BP-DR-M-57","card_due_date");if(!/^\d+$/.test(t.year))throw new i.errors.InvalidValueFieldError("BP-DR-Y-57","card_due_date");if(t.expiration=new Date(t.year,t.month),t.expiration.setMonth(t.expiration.getMonth()-1),t.expiration.setMonth(t.expiration.getMonth()+1,1),t.expiration>t.now!=!0)throw new i.errors.InvalidValueFieldError("BP-DR-57","card_due_date")},validate:function(e){this.validateName(e.card_name),this.validateNumber(e.card_number),this.validateDueDate(e.card_due_date),this.validateCvv(e.card_cvv)}}}}(),i.tokenize=function(){return{card:{token:function(e,t,r){var n=i.utils.api.resources.createToken();i.http.ajax.request({url:n.url,method:n.method,json:!0,data:{request_body:JSON.stringify({public_integration_key:i.config.getPublishableKey(),payment_type_code:i.utils.creditCardScheme(e.card_number),country:i.config.getCountry(),card:e})}}).always(function(e){return"ERROR"!==e.status&&"token"in e?t(e):r(e)})}}}}(),i.utils=function(){var e={api:{path:function(){return i.config.isLive()?"https://api.ebanx.com/":"https://sandbox.ebanx.com/"}},availableCountries:["br","mx"].join(", "),creditCardScheme:function(e){i.validator.card.validateNumber(e);var t={amex:/^3[47][0-9]{13}$/,aura:/^50[0-9]{14,17}$/,elo:/^(636368|438935|504175|451416|636297|5067|4576|4011|50904|50905|50906)/,diners:/^3(?:0[0-5]|[68][0-9])[0-9]{11}$/,discover:/^6(?:011|5[0-9]{2})[0-9]{12}$/,hipercard:/^(38|60)[0-9]{11,17}$/,mastercard:/^5[1-5][0-9]{14}$/,visa:/^4[0-9]{12}(?:[0-9]{3})?$/};for(var r in t)if(t[r].test(e))return r;throw new i.errors.InvalidValueFieldError("BP-DR-S-75","card_number")}};return e.api.url=function(){return e.api.path()+"ws"},e.api.resources={createToken:function(){return{url:e.api.url()+"/token",method:"get"}},validPublicIntegrationKey:function(){return{url:e.api.url()+"/merchantIntegrationProperties/isValidPublicIntegrationKey",method:"get"}},fingerPrintResource:function(){return{url:e.api.path()+"fingerprint/",method:"get"}},fingerPrintProvidersResource:function(){return{url:e.api.path()+"fingerprint/provider",method:"post"}}},e}(),i.http=function(){return{normalize:{q:function(e,t){function i(e,t){var n=[];return t=t||[],Object.keys(e).forEach(function(o){if(e.hasOwnProperty(o)){var a=t.slice();a.push(o);var s=[];"object"==r(e[o])?s=i(e[o],a):s.push({path:a,val:e[o]}),s.forEach(function(e){return n.push(e)})}}),n}var n=i(e);n=n.map(function(e){if(1==e.path.length)e.path=e.path[0];else{var t=e.path[0],r=e.path.slice(1);e.path=t+"["+r.join("][")+"]"}return e});var o=n.map(function(e){return e.path+"="+e.val}).join("&");return t?encodeURIComponent(o):o}},ajax:{request:function(e){"string"==typeof e&&(e={url:e}),e.url=e.url||"",e.method=e.method||"get",e.data=e.data||{};var t={host:{},process:function(e){var t=this;return this.xhr=null,window.ActiveXObject?this.xhr=new window.ActiveXObject("Microsoft.XMLHTTP"):window.XMLHttpRequest&&(this.xhr=new XMLHttpRequest),this.xhr&&(this.xhr.onreadystatechange=function(){if(4==t.xhr.readyState){var r=t.xhr.responseText||"{}";e.json===!0&&"undefined"!=typeof JSON&&(r=JSON.parse(r)),t.alwaysCallback&&t.alwaysCallback.apply(t.host,[r,t.xhr])}}),this.xhr.open("GET",e.url+"?"+i.http.normalize.q(e.data),!0),setTimeout(function(){t.xhr.send()},20),this},always:function(e){return this.alwaysCallback=e,this}};return t.process(e)}},injectJS:function(e,t){var r=document.createElement("script");r.type="text/javascript",r.async=!0,r.onload=t,r.src=e,document.getElementsByTagName("head")[0].appendChild(r)}}}(),i.card=function(){var e={};return e.createToken=function(e,t){var r={data:{},error:{}},n=function(e){r.data=e,i.deviceFingerprint.setup(function(e){return r.data.deviceId=e,t(r)})},o=function(e){return r.error.err=e,t(r)};try{i.validator.card.validate(e),i.tokenize.card.token(e,n,o)}catch(a){r.error.err=a,t(r)}},e}(),i.deviceFingerprint={ebanx_session_id:null,providerSessionList:[],providerPostPending:null,setup:function(e){var t=this;this.getList(function(r){r&&r.ebanx_session_id&&(i.deviceFingerprint.ebanx_session_id=r.ebanx_session_id,e(r.ebanx_session_id),r.providers.forEach(function(e){t.getProviderSessionId(e)}))})},getList:function(e){i.http.ajax.request({url:i.utils.api.resources.fingerPrintResource().url,data:{publicIntegrationKey:i.config.getPublishableKey(),country:i.config.getCountry()},json:!0}).always(e)},getProviderSessionId:function(e){this.loadProvider(e,this.saveProviderSessionList)},saveProviderSessionList:function(e){var t=i.deviceFingerprint;t.providerPostPending&&clearTimeout(t.providerPostPending),t.providerSessionList.push(e),t.providerPostPending=setTimeout(t.postProviderSessionList,1e3)},postProviderSessionList:function(){var e=i.deviceFingerprint,t=e.providerSessionList;e.providerSessionList=[],clearTimeout(e.providerPostPending),e.providerPostPending=null;var r={publicIntegrationKey:i.config.getPublishableKey(),ebanx_session_id:e.ebanx_session_id,providers:t};i.http.ajax.request({url:i.utils.api.resources.fingerPrintProvidersResource().url,data:r,method:"post",json:!0})},loadProvider:function(e,t){i.http.injectJS(e.source,function(){i.deviceFingerprint[e.provider].setup(e.settings,function(r){t({provider:e.provider,session_id:r})})})}},e.exports=i}])});