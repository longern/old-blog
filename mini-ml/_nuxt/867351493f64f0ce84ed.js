(window.webpackJsonp=window.webpackJsonp||[]).push([[8],{293:function(e,t,n){var r=n(294),i=n(295),o=n(296);e.exports=function(e,t){return r(e)||i(e,t)||o()}},294:function(e,t){e.exports=function(e){if(Array.isArray(e))return e}},295:function(e,t){e.exports=function(e,t){var n=[],r=!0,i=!1,o=void 0;try{for(var a,s=e[Symbol.iterator]();!(r=(a=s.next()).done)&&(n.push(a.value),!t||n.length!==t);r=!0);}catch(e){i=!0,o=e}finally{try{r||null==s.return||s.return()}finally{if(i)throw o}}return n}},296:function(e,t){e.exports=function(){throw new TypeError("Invalid attempt to destructure non-iterable instance")}},300:function(e,t,n){var r=n(328);"string"==typeof r&&(r=[[e.i,r,""]]),r.locals&&(e.exports=r.locals);(0,n(47).default)("b39c198c",r,!0,{})},327:function(e,t,n){"use strict";var r=n(300);n.n(r).a},328:function(e,t,n){(e.exports=n(46)(!1)).push([e.i,".mobilenet_v2 .el-row{margin-bottom:16px}",""])},329:function(e,t,n){"use strict";n.r(t);var r=n(293),i=n.n(r),o=(n(65),n(5)),a=n.n(o),s=n(324),l={name:"MobileNetV2",data:function(){return{model:null,answer:null}},mounted:function(){var e=a()(regeneratorRuntime.mark(function e(){var t,n;return regeneratorRuntime.wrap(function(e){for(;;)switch(e.prev=e.next){case 0:return e.next=2,tf.loadLayersModel("models/mobilenet_v2/model.json");case 2:return this.model=e.sent,t=tf.zeros([1,224,224,3]),n=this.model.predict(t),e.next=7,n.data();case 7:t.dispose(),n.dispose();case 9:case"end":return e.stop()}},e,this)}));return function(){return e.apply(this,arguments)}}(),methods:{handleFileChange:function(){var e=this;if(this.$refs.uploader.files.length){this.answer=null;var t=this.$refs.mobileNetV2Hidden,n=this.$refs.uploader.files[0],r=URL.createObjectURL(n),i=new Image;i.onload=function(){URL.revokeObjectURL(i.src),t.getContext("2d").drawImage(i,0,0,224,224),e.makePrediction(t)},i.src=r}},makePrediction:function(){var e=a()(regeneratorRuntime.mark(function e(t){var n,r,o,a,l=this;return regeneratorRuntime.wrap(function(e){for(;;)switch(e.prev=e.next){case 0:return n=tf.tidy(function(){var e=tf.div(tf.browser.fromPixels(t).asType("float32"),255).expandDims(),n=l.model.predict(e).squeeze();return tf.argMax(n)}),e.next=3,n.data();case 3:r=e.sent,o=i()(r,1),a=o[0],n.dispose(),this.answer=s.default[a];case 8:case"end":return e.stop()}},e,this)}));return function(t){return e.apply(this,arguments)}}()}},u=(n(327),n(23)),c=Object(u.a)(l,function(){var e=this,t=e.$createElement,n=e._self._c||t;return n("div",{directives:[{name:"loading",rawName:"v-loading",value:!e.model,expression:"!model"}],staticClass:"mobilenet_v2"},[n("el-row",[n("canvas",{ref:"mobileNetV2Hidden",attrs:{id:"mobilenet-v2-hidden",width:"224",height:"224"}})]),e._v(" "),n("el-row",[n("el-button",{on:{click:function(t){e.$refs.uploader.click()}}},[e._v("\n      打开图片\n    ")]),e._v(" "),n("input",{ref:"uploader",attrs:{type:"file",hidden:""},on:{change:e.handleFileChange}})],1),e._v(" "),n("el-row",[e._v("\n    "+e._s(e.answer||"?")+"\n  ")]),e._v(" "),n("el-row",[n("a",{attrs:{href:"https://arxiv.org/abs/1801.04381",target:"_blank"}},[e._v("\n      MobileNetV2: Inverted Residuals and Linear Bottlenecks\n    ")])])],1)},[],!1,null,null,null);c.options.__file="mobilenetv2.vue";t.default=c.exports}}]);