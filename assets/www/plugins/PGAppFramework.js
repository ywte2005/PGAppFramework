(function(){
    window.PGAppFramework = {
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
                me.alias = $(li).data('alias');
                //$.ui.setTitle($(li).text());
                me.jsonp({class:'YT_Article',action:'GetArticleCategorysLimit',param:[10,0,id].join('|')},function(result){
                    if(result.length !== 0){
                        //判断是否已经实例化iScroll，实例化后是存在子元素div的
                        var container = null;
                        if($.ui.scrollingDivs[me.alias]){
                            container = $('#'+me.alias).find('div').eq(0);
                        }else{
                            container = $('#'+me.alias);
                        }
                        if(container !== null){
                            container.empty().append(tmpl(me.alias+'_tpl',{item:result})).find('li').bind('click',function(){
                                var id = $(this).data('ajax-id');
                                me.viewArticle(id);
                            });
                            $.ui.loadContent('#'+me.alias,false,false,"up");
                        }
                    }
                });
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
                slider.addEventListener('touchend',function(){
                    $.ui.scrollingDivs.main.enable();
                    $.ui.enableRightSideMenu();
                    $.ui.enableSideMenu();
                });
                slider.addEventListener('touchstart',function(){
                    $.ui.scrollingDivs.main.disable();
                    $.ui.disableRightSideMenu();
                    $.ui.disableSideMenu();
                });
                me.refresh();
            }
            me.getLimitArticle();
        });
    };
    PGAppFramework.getLimitArticle = function(limit){
        var me = this;
        if(!limit || !$.isArray(limit)){
            limit = [5,0];
        }
        limit = limit.join('|');
        me.jsonp({class:'YT_Article',action:'GetArticleLimit',param:limit},function(result){
            if($.ui.scrollingDivs.main){
                $('#main').find('div').eq(0).find('ul.list').empty().append(tmpl('main_tpl',{item:result}));
            }else{
                $('#main').find('ul.list').empty().append(tmpl('main_tpl',{item:result}));
            }
            $('#main').find('[data-ajax-id]').bind('click',function(){
                var id = $(this).data('ajax-id');
                me.viewArticle(id);
            });
            if($.ui.scrollingDivs.main){
                me.Downcount = 0;
                //监听上拉,下拉事件
                var callback = {
                    down:function(){
                        me.slider();
                        me.getLimitArticle();
                        if(typeof($.ui.scrollingDivs[$.ui.activeDiv.id].loadingStep) === 'number'){
                            $.ui.scrollingDivs[$.ui.activeDiv.id].pullDown.removeClass('loading').attr('class','').hide().find('div:last').text('下拉显示更多...');
                            //$.ui.scrollingDivs[$.ui.activeDiv.id].pullDownEl['class'] = pullDownEl.attr('class');
                            $.ui.scrollingDivs[$.ui.activeDiv.id].loadingStep = 0;
                        }
                    }
                };
                me.iscroll('main',callback);
                $.ui.scrollingDivs.main.on('scroll', function(){
                    console.log('scroll');
                });
                $.ui.scrollingDivs.main.on('scrollEnd', function(){
                    console.log('scrollEnd');
                });
            }
        });
    };
    PGAppFramework.iscroll = function(id,callback){
        $.ui.scrollingDivs[id].loadingStep = 0;
        if(callback.down && $.isFunction(callback.down)){
            var pullDown = $.create("div",{
                className:'pullDown'
            }).hide().get(0);
            var pullDownIcon = $.create('div',{
                className:'pullDownIcon icon icon-point-down'
            }).get(0);
            $(pullDown).append(pullDownIcon);
            var pullDownLabel = $.create('div',{
                className:'pullDownLabel',
                innerHTML:'下拉刷新'
            }).get(0);
            $(pullDown).append(pullDownLabel);
            $('#'+id).find('div').eq(0).prepend(pullDown);
        }
        if(callback.up && $.isFunction(callback.up)){
            var pullUp = $.create("div",{
                className:'pullUp'
            }).hide().get(0);
            var pullUpIcon = $.create('div',{
                className:'pullUpIcon icon icon-point-up'
            }).get(0);
            $(pullUp).append(pullUpIcon);
            var pullUpLabel = $.create('div',{
                className:'pullUpLabel',
                innerHTML:'上拉显示更多...'
            }).get(0);
            $(pullUp).append(pullUpLabel);
            $('#'+id).find('div').eq(0).append(pullUp);
        }
        $.ui.scrollingDivs[id].pullDown = $('#'+id).find('.pullDown');
        $.ui.scrollingDivs[id].pullUp = $('#'+id).find('.pullDown');
        $.ui.scrollingDivs[id].on('scroll', function(){
            pullDown = $.ui.scrollingDivs[id].pullDown;
            pullUp = $.ui.scrollingDivs[id].pullUp;
            if($.ui.scrollingDivs[id].loadingStep == 0 && !pullDown.attr('class').match('flip|loading') && !pullUp.attr('class').match('flip|loading')){
                if (this.y > 5) {
                    //下拉刷新效果
                    pullDown.attr('class',pullUp.attr('class')).show();
                    $.ui.scrollingDivs[id].refresh();
                    pullDown.addClass('flip');
                    pullDown.find('div:last').text('准备刷新...');
                    $.ui.scrollingDivs[id].loadingStep = 1;
                }else if (this.y < (this.maxScrollY - 5)) {
                    //上拉刷新效果
                    pullUp.attr('class',pullDown.attr('class')).show();
                    $.ui.scrollingDivs[id].refresh();
                    pullUp.addClass('flip');
                    pullUp.find('div:last').text('准备刷新...');
                    $.ui.scrollingDivs[id].loadingStep = 1;
                }
            }
            console.log('scroll');
        });
        $.ui.scrollingDivs[id].on('scrollEnd', function(){
            pullDown = $.ui.scrollingDivs[id].pullDown;
            pullUp = $.ui.scrollingDivs[id].pullUp;
            if($.ui.scrollingDivs[id].loadingStep == 1){
                if(callback.up && $.isFunction(callback.up)){
                    if (pullUp.attr('class').match('flip|loading')) {
                        pullUp.removeClass('flip').addClass('loading');
                        pullUp.find('div:last').text('Loading...');
                        $.ui.scrollingDivs[id].loadingStep = 2;
                        callback.up();
                    }
                }
                if(callback.down && $.isFunction(callback.down)){
                    if(pullDown.attr('class').match('flip|loading')){
                        pullDown.removeClass('flip').addClass('loading');
                        pullDown.find('div:last').text('Loading...');
                        $.ui.scrollingDivs[id].loadingStep = 2;
                        callback.down();
                    }
                }
            }
            console.log('scrollEnd');
        });
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
        $.ui.showMask('no network');
    };
    PGAppFramework.jsonp = function(data,callback,error){
        if($('#splashscreen').size() === 0){
            $.ui.showMask('loading...');
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
        }).attr('class','panel').data('header',header).get(0);
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