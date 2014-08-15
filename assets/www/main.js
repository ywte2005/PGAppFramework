//设置require.js配置
require.config( {
	baseUrl: "./public/js/",
	//第三方脚本别名
	paths: {
		//核心库
		"jquery": "jquery",
		"jquerymobile": "jquery.mobile-1.4.3",
		"underscore": "lodash.min",
		"backbone": "backbone-min",
		'backbone-requirejs':'../../app'
	},
	//设置非AMD规范的第三方脚本
	shim: {
		"backbone": {
			"deps": [ "underscore", "jquery" ],
			"exports": "Backbone"
		},
		"fastclick":{
			"exports": "FastClick"
		}
	}
});
// 引入资源文件
require([
	"jquery",
	"backbone",
	"backbone-requirejs/routers/mobileRouter",
], function ($,Backbone,Mobile) {
	//jauery mobile 构造函数
	$(document).on("mobileinit",function() {
		$.extend($.mobile,{
			//防止jquery mobile所有锚单击操作包括添加活性按钮状态和交叉链接的模糊效果。
			linkBindingEnabled:false,
			//禁用这将防止jquery mobile处理location.hash的变化
			hashListeningEnabled:false
		});
	});
	require(["jquerymobile"], function () {
		// 实例化一个新的backbone.js路由器
		this.router = new Mobile();
	});
});
