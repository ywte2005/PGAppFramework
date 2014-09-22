(function(){
    window.PGAppFramework = {
        limit:[6,0],
        config:null,
        api:'http://d.pugu.biz/api.html'
    };
    PGAppFramework.nav = function(){
        var me = this;
        me.jsonp({action:'menu'},function(result){
            for(i in result){
                me.createContainer(result[i].alias,'listHeader');
                if(result[i].children){
                    for(j in result[i].children){
                        me.createContainer(result[i].children[j].alias,'listHeader');
                    }
                }
            }
            $('nav ul').append(tmpl('nav_tpl',{item:result})).find('li').bind('click',function(){
                var li = this;
                var id = $(li).data('id');
                var param = me.limit;
                param[2] = id;
                me.alias = $(li).data('alias');
                $.ui.loadContent('#'+me.alias,false,false,"up");
                me.getLimitArticle(param,(me.alias+'_tpl'));
            });
        });
    };
    PGAppFramework.aside = function(){
        var json = localStorage.getItem('member');
        if(json !== null){
            json = eval('('+json+')');
        }
        $('aside').append(tmpl('aside_tpl',{member:json}));
    };
    PGAppFramework.slider = function(){
        var me = this;
        me.jsonp({class:'YT_Article',action:'GetArticleRandomSortNew',param:[5,'IMG'].join('|')},function(result){
            if(result.length !== 0){
                $('#slider').remove();
                for(i in result){
                    if($(result[i].content).find('img').size() !== 0){
                        result[i]['img'] = $(result[i].content).find('img').eq(0).attr('src');
                    }
                }
                if($.ui.scrollingDivs.main){
                    $('#main').find('div').eq(0).prepend(tmpl('slider_tpl',{item:result}));
                }else{
                    $('#main').prepend(tmpl('slider_tpl',{item:result}));
                }
                $('#slider').find('[data-ajax-id]').bind('click',function(){
                    var id = $(this).data('ajax-id');
                    me.viewArticle(id);
                });
                var slider = document.getElementById("slider");
                me.slider.titles = $('.titles').find('li').get();
                me.slider.buttons = $('.buttons').find('li').get();
                $(me.slider.titles).eq(0).addClass('on');
                $(me.slider.buttons).eq(0).addClass('on');
                Swipe(slider, {
                    auto: 3000,
                    continuous: true,
                    callback: function(pos) {
                      var i = me.slider.buttons.length;
                      while (i--) {
                        $(me.slider.titles[i]).removeAttr('class');
                        $(me.slider.buttons[i]).removeAttr('class');
                      }
                      $(me.slider.titles[pos]).addClass('on');
                      $(me.slider.buttons[pos]).addClass('on');
                    }
                });
                var startX = 0;
                slider.addEventListener('touchstart',function(){
                    $.ui.disableRightSideMenu();
                    $.ui.disableSideMenu();
                });
                slider.addEventListener('touchend',function(){
                    $.ui.enableRightSideMenu();
                    $.ui.enableSideMenu();
                });
                me.refresh();
            }
            me.getLimitArticle(me.limit,'main_tpl');
        });
    };
    PGAppFramework.getLimitArticle = function(param,tpl,callback){
        var me = this,action = 'GetArticleLimit';
        if($.isArray(param)){
            if(param.length > 2){
                action = 'GetArticleCategorysLimit';
            }
            param = param.join('|');
            $.ui.scrollingDivs[$.ui.activeDiv.id].param = param;
            me.jsonp({class:'YT_Article',action:action,param:param},function(result){
                if($.isFunction(callback)){
                    callback();
                }
                if(result.length !== 0){
                    var ul = $($.ui.activeDiv).find('div').eq(0);
                    if(!$.ui.scrollingDivs[$.ui.activeDiv.id].upStart){
                        ul.find('.content').empty();
                    }
                    ul.find('.content').append(tmpl(tpl,{item:result}));
                    ul.find('[data-ajax-id]').unbind('click').bind('click',function(){
                        var id = $(this).data('ajax-id');
                        me.viewArticle(id);
                    });
                    if($.ui.scrollingDivs[$.ui.activeDiv.id]){
                        //监听上拉,下拉事件
                        // var _callback = {
                        //     up:function(){
                        //         setTimeout(function(){
                        //             var param = $.ui.scrollingDivs[$.ui.activeDiv.id].param.split('|');
                        //             param[1] = parseInt(param[1]) + parseInt(param[0]);
                        //             me.getLimitArticle(param,tpl,function(){

                        //             });
                        //             if(typeof($.ui.scrollingDivs[$.ui.activeDiv.id].loadingStep) === 'number'){
                        //                 $.ui.scrollingDivs[$.ui.activeDiv.id].pullUp.removeClass('loading').hide();
                        //                 $.ui.scrollingDivs[$.ui.activeDiv.id].loadingStep = 0;
                        //                 $.ui.scrollingDivs[$.ui.activeDiv.id].downStart = false;
                        //                 $.ui.scrollingDivs[$.ui.activeDiv.id].upStart = true;
                        //             }
                        //         });
                        //     },
                        //     down:function(){
                        //         setTimeout(function(){
                        //             var param = $.ui.scrollingDivs[$.ui.activeDiv.id].param.split('|');
                        //             me.getLimitArticle(me.limit,tpl,callback);
                        //             if(typeof($.ui.scrollingDivs[$.ui.activeDiv.id].loadingStep) === 'number'){
                        //                 $.ui.scrollingDivs[$.ui.activeDiv.id].pullDown.removeClass('loading').hide();
                        //                 $.ui.scrollingDivs[$.ui.activeDiv.id].loadingStep = 0;
                        //                 $.ui.scrollingDivs[$.ui.activeDiv.id].downStart = true;
                        //                 $.ui.scrollingDivs[$.ui.activeDiv.id].upStart = false;
                        //             }
                        //         });
                        //     }
                        // };
                        me.iscroll($.ui.activeDiv.id,{
                            up:function(){
                                setTimeout(function(){
                                    var param = $.ui.scrollingDivs[$.ui.activeDiv.id].param.split('|');
                                    param[1] = parseInt(param[1]) + parseInt(param[0]);
                                    me.getLimitArticle(param,tpl,function(){
                                        if(typeof($.ui.scrollingDivs[$.ui.activeDiv.id].loadingStep) === 'number'){
                                            $.ui.scrollingDivs[$.ui.activeDiv.id].pullUp.removeClass('loading').hide();
                                            $.ui.scrollingDivs[$.ui.activeDiv.id].loadingStep = 0;
                                            $.ui.scrollingDivs[$.ui.activeDiv.id].downStart = false;
                                            $.ui.scrollingDivs[$.ui.activeDiv.id].upStart = true;
                                        }
                                    });
                                });
                            },
                            down:function(){
                                setTimeout(function(){
                                    var param = $.ui.scrollingDivs[$.ui.activeDiv.id].param.split('|');
                                    me.getLimitArticle(me.limit,tpl,function(){
                                        if(typeof($.ui.scrollingDivs[$.ui.activeDiv.id].loadingStep) === 'number'){
                                            $.ui.scrollingDivs[$.ui.activeDiv.id].pullDown.removeClass('loading').hide();
                                            $.ui.scrollingDivs[$.ui.activeDiv.id].loadingStep = 0;
                                            $.ui.scrollingDivs[$.ui.activeDiv.id].downStart = true;
                                            $.ui.scrollingDivs[$.ui.activeDiv.id].upStart = false;
                                        }
                                    });
                                });
                            }
                        });
                    }
                }
            });
        }
    };
    PGAppFramework.iscroll = function(id,callback){
        if(typeof($.ui.scrollingDivs[id].loadingStep) !== 'number'){
            $.ui.scrollingDivs[id].loadingStep = 0;
            if(callback.down && $.isFunction(callback.down)){
                var pullDown = $.create("div",{
                    className:'pullDown',
                    html:"<div class='pullDownIcon icon icon-spinner4'></div><div class='pullDownLabel'></div>"
                }).hide().get(0);
                $('#'+id).find('div').eq(0).prepend(pullDown);
            }
            if(callback.up && $.isFunction(callback.up)){
                var pullUp = $.create("div",{
                    className:'pullUp',
                    html:"<div class='pullUpIcon icon icon-spinner5'></div><div class='pullUpLabel'></div>"
                }).hide().get(0);
                $('#'+id).find('div').eq(0).append(pullUp);
            }
            $.ui.scrollingDivs[id].pullDown = $('#'+id).find('.pullDown');
            $.ui.scrollingDivs[id].pullUp = $('#'+id).find('.pullUp');
            $.ui.scrollingDivs[id].on('scroll', function(){
                pullDown = $.ui.scrollingDivs[id].pullDown;
                pullUp = $.ui.scrollingDivs[id].pullUp;
                if($.ui.scrollingDivs[id].loadingStep == 0 && !pullDown.attr('class').match('flip|loading') && !pullUp.attr('class').match('flip|loading')){
                    if(callback.down && $.isFunction(callback.down)){
                        if(this.y > 0){
                            pullDown.find('div.pullDownLabel').text('下拉刷新').parent().show();
                        }
                        if (this.y > 10) {
                            $.ui.scrollingDivs[id].refresh();
                            pullDown.addClass('flip').find('div.pullDownLabel').text('准备刷新...');
                            $.ui.scrollingDivs[id].loadingStep = 1;
                        }
                    }
                    if(callback.up && $.isFunction(callback.up)){
                        console.log(this.y + ' >> ' +this.maxScrollY);
                        if(this.y < (this.maxScrollY)){
                            pullUp.find('div.pullUpLabel').text('上拉显示更多').parent().show();
                        }
                        if (this.y < (this.maxScrollY - 20)) {
                            $.ui.scrollingDivs[id].refresh();
                            pullUp.addClass('flip').find('div.pullUpLabel').text('加载更多...');
                            $.ui.scrollingDivs[id].loadingStep = 1;
                        }
                    }
                }
            });
            $.ui.scrollingDivs[id].on('scrollEnd', function(){
                pullDown = $.ui.scrollingDivs[id].pullDown;
                pullUp = $.ui.scrollingDivs[id].pullUp;
                if($.ui.scrollingDivs[id].loadingStep == 1){
                    if(callback.up && $.isFunction(callback.up)){
                        if (pullUp.attr('class').match('flip|loading')) {
                            pullUp.removeClass('flip').addClass('loading').find('div.pullUpLabel').text('正在加载,请稍候...');
                            $.ui.scrollingDivs[id].loadingStep = 2;
                            callback.up();
                        }
                    }
                    if(callback.down && $.isFunction(callback.down)){
                        if(pullDown.attr('class').match('flip|loading')){
                            pullDown.removeClass('flip').addClass('loading').find('div.pullDownLabel').text('正在加载,请稍候...');
                            $.ui.scrollingDivs[id].loadingStep = 2;
                            callback.down();
                        }
                    }
                }
            });
        }
    },
    PGAppFramework.viewArticle = function(id){
        this.jsonp({class:'YT_Article',action:'GetArticleModel',param:id},function(result){
            if($.ui.scrollingDivs.single){
                $('#single').find('div').eq(0).html(tmpl('single_tpl',result[0]));
            }else{
                $('#single').html(tmpl('single_tpl',result[0]));
            }
            $.ui.loadContent('#single',false,false,"up");
            if($('#single').find('img').size() !== 0){
                $('#single').find('img').css({'max-width':'100%'}).load(function(){
                    $.ui.scrollingDivs.single.refresh();
                });
            }else{
                $.ui.scrollingDivs.single.refresh();
            }
        });
    };
    PGAppFramework.system = function(){
        var me = this;
        var c = me.config;
        //$.ui.setTitle(c.ZC_BLOG_NAME);
        me.slider();
        me.nav();
        me.aside();
    };
    PGAppFramework.hideUI = function(){
        $('#afui').hide();
        $.ui.showMask('无网络');
    };
    PGAppFramework.jsonp = function(data,callback,error){
        if($('#splashscreen').size() === 0){
            $.ui.showMask('加载中...');
        }
        var me = this;
        var url = [me.api,$.param(data)];
        $.jsonP({
            url:url.join('?'),
            success:function(result){
                callback(result);
                me.refresh();
            },
            error:function(e){
                if($.isFunction(error)){
                    error(e);
                }
            }
        });
    };
    PGAppFramework.createContainer = function(id,header){
        var div = $.create("div", {
            id: id
        }).attr('class','panel').data('header',header).data('iscroll','{probeType:2}').get(0);
        var _content = $.create("div",{className:'content'}).get(0);
        $(div).append(_content);
        $('#content').append(div);
    };
    PGAppFramework.refresh = function(){
        setTimeout(function(){
            $.ui.hideMask();
            if($.ui.scrollingDivs[$.ui.activeDiv.id]){
                $.ui.scrollingDivs[$.ui.activeDiv.id].refresh();
            }
        });
    };
    PGAppFramework.mask = function(){
        //spinner,spinner2,spinner3,spinner4,spinner5,spinner6,spinner7
        $('#afui_mask').find('span').addClass('icon big icon-spinner5');
        //$('#afui_mask').find('span').addClass('icon big icon-spinner5 spin2').removeClass('spin');
    },
    PGAppFramework.start = function(){
        var me = this;
        me.mask();
        me.jsonp({
            action:'option'
        },function(result){
            me.config = result;
            me.system();
        },function(){
            me.hideUI();
        });
    };
})();