(window["webpackJsonp"]=window["webpackJsonp"]||[]).push([["chunk-9e66ff12"],{"1da1":function(t,e,r){"use strict";function n(t,e,r,n,i,o,a){try{var c=t[o](a),u=c.value}catch(s){return void r(s)}c.done?e(u):Promise.resolve(u).then(n,i)}function i(t){return function(){var e=this,r=arguments;return new Promise(function(i,o){var a=t.apply(e,r);function c(t){n(a,i,o,c,u,"next",t)}function u(t){n(a,i,o,c,u,"throw",t)}c(void 0)})}}r.d(e,"a",function(){return i})},"386b":function(t,e,r){var n=r("5ca1"),i=r("79e5"),o=r("be13"),a=/"/g,c=function(t,e,r,n){var i=String(o(t)),c="<"+e;return""!==r&&(c+=" "+r+'="'+String(n).replace(a,"&quot;")+'"'),c+">"+i+"</"+e+">"};t.exports=function(t,e){var r={};r[t]=e(c),n(n.P+n.F*i(function(){var e=""[t]('"');return e!==e.toLowerCase()||e.split('"').length>3}),"String",r)}},"509b":function(t,e,r){"use strict";r.r(e);var n=function(){var t=this,e=t.$createElement,r=t._self._c||e;return r("div",{directives:[{name:"loading",rawName:"v-loading",value:!t.model,expression:"!model"}],staticClass:"deblur-gan"},[r("el-row",[r("div",{staticClass:"image-block"},[r("img",{ref:"deblurGANInput",attrs:{id:"deblur-gan-input",width:"360",height:"360"}})]),r("div",{directives:[{name:"loading",rawName:"v-loading",value:t.processing,expression:"processing"}],staticClass:"image-block"},[r("img",{ref:"deblurGANResult",attrs:{id:"deblur-gan-result",width:"360",height:"360"}})])]),r("el-row",[r("el-button",{on:{click:function(e){t.$refs.uploader.click()}}},[t._v("\n      打开图片\n    ")]),r("input",{ref:"uploader",attrs:{type:"file",hidden:""},on:{change:t.handleFileChange}})],1),r("el-row",[r("img",{ref:"sample",attrs:{src:"static/sample1.png",width:"64",height:"64"},on:{click:t.handleSampleClick}})]),r("el-row",[r("a",{attrs:{href:"https://arxiv.org/abs/1711.07064",target:"_blank"}},[t._v("\n      DeblurGAN: Blind Motion Deblurring Using Conditional Adversarial Networks\n    ")])])],1)},i=[],o=(r("96cf"),r("1da1")),a=(r("673e"),r("cadf"),r("551c"),r("097d"),r("b994")),c={name:"DeblurGAN",data:function(){return{model:null,processing:!1}},methods:{handleFileChange:function(){var t=this;if(this.$refs.uploader.files.length){var e=this.$refs.uploader.files[0],r=URL.createObjectURL(e),n=new Image;n.onload=function(){n.width=224*Math.ceil((n.width-32)/224)+32,n.height=224*Math.ceil((n.height-32)/224)+32,t.makePrediction(n)},n.src=r,this.$refs.deblurGANInput.src=r}},handleSampleClick:function(){var t=this,e=new Image;e.onload=function(){e.width=224*Math.ceil((e.width-32)/224)+32,e.height=224*Math.ceil((e.height-32)/224)+32,t.makePrediction(e)},e.src=this.$refs.sample.src,this.$refs.deblurGANInput.src=this.$refs.sample.src},makePrediction:function(t){var e=this,r=function t(){if(c>=o.length){var r=a["tidy"](function(){for(var t=u.map(function(t){var e=a["tensor"](t,[256,256,3]).slice([16,16],[224,224]),r=a["clipByValue"](a["add"](e,.5),0,1);return r}),e=[],r=0;r<n;r+=1)e[r]=a["concat"](t.slice(r*i,(r+1)*i),1);return a["concat"](e)}),s=document.createElement("canvas");a["toPixels"](r,s).then(function(){s.toBlob(function(t){e.$refs.deblurGANResult.src=URL.createObjectURL(t),e.processing=!1}),r.dispose()})}else{e.processing=!0;var l=a["tidy"](function(){return e.model.predict(a["tensor"](o[c],[1,256,256,3]))});u[c]=l.dataSync(),l.dispose(),c+=1,a["nextFrame"]().then(function(){return setTimeout(t,0)})}},n=Math.ceil((t.height-32)/224),i=Math.ceil((t.width-32)/224),o=a["tidy"](function(){for(var e=a["fromPixels"](t).asType("float32"),r=a["sub"](a["div"](e,255),.5),o=[],c=0;c<n;c+=1)for(var u=0;u<i;u+=1)o.push(r.slice([224*c,224*u],[256,256]));return o.map(function(t){return t.dataSync()})}),c=0,u=[];r()}},mounted:function(){var t=Object(o["a"])(regeneratorRuntime.mark(function t(){return regeneratorRuntime.wrap(function(t){while(1)switch(t.prev=t.next){case 0:return t.next=2,a["loadModel"]("models/deblur_gan/model.json");case 2:this.model=t.sent;case 3:case"end":return t.stop()}},t,this)}));return function(){return t.apply(this,arguments)}}()},u=c,s=(r("c64c"),r("2877")),l=Object(s["a"])(u,n,i,!1,null,null,null);l.options.__file="DeblurGAN.vue";e["default"]=l.exports},"673e":function(t,e,r){"use strict";r("386b")("sub",function(t){return function(){return t(this,"sub","","")}})},"96cf":function(t,e){!function(e){"use strict";var r,n=Object.prototype,i=n.hasOwnProperty,o="function"===typeof Symbol?Symbol:{},a=o.iterator||"@@iterator",c=o.asyncIterator||"@@asyncIterator",u=o.toStringTag||"@@toStringTag",s="object"===typeof t,l=e.regeneratorRuntime;if(l)s&&(t.exports=l);else{l=e.regeneratorRuntime=s?t.exports:{},l.wrap=b;var h="suspendedStart",f="suspendedYield",d="executing",p="completed",v={},g={};g[a]=function(){return this};var m=Object.getPrototypeOf,y=m&&m(m(A([])));y&&y!==n&&i.call(y,a)&&(g=y);var w=E.prototype=L.prototype=Object.create(g);k.prototype=w.constructor=E,E.constructor=k,E[u]=k.displayName="GeneratorFunction",l.isGeneratorFunction=function(t){var e="function"===typeof t&&t.constructor;return!!e&&(e===k||"GeneratorFunction"===(e.displayName||e.name))},l.mark=function(t){return Object.setPrototypeOf?Object.setPrototypeOf(t,E):(t.__proto__=E,u in t||(t[u]="GeneratorFunction")),t.prototype=Object.create(w),t},l.awrap=function(t){return{__await:t}},_(N.prototype),N.prototype[c]=function(){return this},l.AsyncIterator=N,l.async=function(t,e,r,n){var i=new N(b(t,e,r,n));return l.isGeneratorFunction(e)?i:i.next().then(function(t){return t.done?t.value:i.next()})},_(w),w[u]="Generator",w[a]=function(){return this},w.toString=function(){return"[object Generator]"},l.keys=function(t){var e=[];for(var r in t)e.push(r);return e.reverse(),function r(){while(e.length){var n=e.pop();if(n in t)return r.value=n,r.done=!1,r}return r.done=!0,r}},l.values=A,S.prototype={constructor:S,reset:function(t){if(this.prev=0,this.next=0,this.sent=this._sent=r,this.done=!1,this.delegate=null,this.method="next",this.arg=r,this.tryEntries.forEach(P),!t)for(var e in this)"t"===e.charAt(0)&&i.call(this,e)&&!isNaN(+e.slice(1))&&(this[e]=r)},stop:function(){this.done=!0;var t=this.tryEntries[0],e=t.completion;if("throw"===e.type)throw e.arg;return this.rval},dispatchException:function(t){if(this.done)throw t;var e=this;function n(n,i){return c.type="throw",c.arg=t,e.next=n,i&&(e.method="next",e.arg=r),!!i}for(var o=this.tryEntries.length-1;o>=0;--o){var a=this.tryEntries[o],c=a.completion;if("root"===a.tryLoc)return n("end");if(a.tryLoc<=this.prev){var u=i.call(a,"catchLoc"),s=i.call(a,"finallyLoc");if(u&&s){if(this.prev<a.catchLoc)return n(a.catchLoc,!0);if(this.prev<a.finallyLoc)return n(a.finallyLoc)}else if(u){if(this.prev<a.catchLoc)return n(a.catchLoc,!0)}else{if(!s)throw new Error("try statement without catch or finally");if(this.prev<a.finallyLoc)return n(a.finallyLoc)}}}},abrupt:function(t,e){for(var r=this.tryEntries.length-1;r>=0;--r){var n=this.tryEntries[r];if(n.tryLoc<=this.prev&&i.call(n,"finallyLoc")&&this.prev<n.finallyLoc){var o=n;break}}o&&("break"===t||"continue"===t)&&o.tryLoc<=e&&e<=o.finallyLoc&&(o=null);var a=o?o.completion:{};return a.type=t,a.arg=e,o?(this.method="next",this.next=o.finallyLoc,v):this.complete(a)},complete:function(t,e){if("throw"===t.type)throw t.arg;return"break"===t.type||"continue"===t.type?this.next=t.arg:"return"===t.type?(this.rval=this.arg=t.arg,this.method="return",this.next="end"):"normal"===t.type&&e&&(this.next=e),v},finish:function(t){for(var e=this.tryEntries.length-1;e>=0;--e){var r=this.tryEntries[e];if(r.finallyLoc===t)return this.complete(r.completion,r.afterLoc),P(r),v}},catch:function(t){for(var e=this.tryEntries.length-1;e>=0;--e){var r=this.tryEntries[e];if(r.tryLoc===t){var n=r.completion;if("throw"===n.type){var i=n.arg;P(r)}return i}}throw new Error("illegal catch attempt")},delegateYield:function(t,e,n){return this.delegate={iterator:A(t),resultName:e,nextLoc:n},"next"===this.method&&(this.arg=r),v}}}function b(t,e,r,n){var i=e&&e.prototype instanceof L?e:L,o=Object.create(i.prototype),a=new S(n||[]);return o._invoke=j(t,r,a),o}function x(t,e,r){try{return{type:"normal",arg:t.call(e,r)}}catch(n){return{type:"throw",arg:n}}}function L(){}function k(){}function E(){}function _(t){["next","throw","return"].forEach(function(e){t[e]=function(t){return this._invoke(e,t)}})}function N(t){function e(r,n,o,a){var c=x(t[r],t,n);if("throw"!==c.type){var u=c.arg,s=u.value;return s&&"object"===typeof s&&i.call(s,"__await")?Promise.resolve(s.__await).then(function(t){e("next",t,o,a)},function(t){e("throw",t,o,a)}):Promise.resolve(s).then(function(t){u.value=t,o(u)},function(t){return e("throw",t,o,a)})}a(c.arg)}var r;function n(t,n){function i(){return new Promise(function(r,i){e(t,n,r,i)})}return r=r?r.then(i,i):i()}this._invoke=n}function j(t,e,r){var n=h;return function(i,o){if(n===d)throw new Error("Generator is already running");if(n===p){if("throw"===i)throw o;return F()}r.method=i,r.arg=o;while(1){var a=r.delegate;if(a){var c=G(a,r);if(c){if(c===v)continue;return c}}if("next"===r.method)r.sent=r._sent=r.arg;else if("throw"===r.method){if(n===h)throw n=p,r.arg;r.dispatchException(r.arg)}else"return"===r.method&&r.abrupt("return",r.arg);n=d;var u=x(t,e,r);if("normal"===u.type){if(n=r.done?p:f,u.arg===v)continue;return{value:u.arg,done:r.done}}"throw"===u.type&&(n=p,r.method="throw",r.arg=u.arg)}}}function G(t,e){var n=t.iterator[e.method];if(n===r){if(e.delegate=null,"throw"===e.method){if(t.iterator.return&&(e.method="return",e.arg=r,G(t,e),"throw"===e.method))return v;e.method="throw",e.arg=new TypeError("The iterator does not provide a 'throw' method")}return v}var i=x(n,t.iterator,e.arg);if("throw"===i.type)return e.method="throw",e.arg=i.arg,e.delegate=null,v;var o=i.arg;return o?o.done?(e[t.resultName]=o.value,e.next=t.nextLoc,"return"!==e.method&&(e.method="next",e.arg=r),e.delegate=null,v):o:(e.method="throw",e.arg=new TypeError("iterator result is not an object"),e.delegate=null,v)}function O(t){var e={tryLoc:t[0]};1 in t&&(e.catchLoc=t[1]),2 in t&&(e.finallyLoc=t[2],e.afterLoc=t[3]),this.tryEntries.push(e)}function P(t){var e=t.completion||{};e.type="normal",delete e.arg,t.completion=e}function S(t){this.tryEntries=[{tryLoc:"root"}],t.forEach(O,this),this.reset(!0)}function A(t){if(t){var e=t[a];if(e)return e.call(t);if("function"===typeof t.next)return t;if(!isNaN(t.length)){var n=-1,o=function e(){while(++n<t.length)if(i.call(t,n))return e.value=t[n],e.done=!1,e;return e.value=r,e.done=!0,e};return o.next=o}}return{next:F}}function F(){return{value:r,done:!0}}}(function(){return this||"object"===typeof self&&self}()||Function("return this")())},c64c:function(t,e,r){"use strict";var n=r("f762"),i=r.n(n);i.a},f762:function(t,e,r){}}]);
//# sourceMappingURL=chunk-9e66ff12.66aec3e8.js.map