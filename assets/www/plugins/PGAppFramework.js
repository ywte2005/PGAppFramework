(function(){
    window.PGAppFramework = {};
    PGAppFramework.config = null;
    PGAppFramework.api = 'http://d.pugu.biz/api.html';
    PGAppFramework.menu = function(){
        var me = this;
        me.jsonp({action:'menu'},function(result){
            $('nav ul').append(tmpl('nav_tpl',{item:result})).find('li').bind('click',function(){
                var li = this;
                var id = $(li).data('id');
                me.alias = $(li).data('alias');
                //$.ui.setTitle($(li).text());
                me.jsonp({class:'YT_Article',action:'GetArticleCategorysLimit',param:[10,0,id].join('|')},function(result){
                    if(result.length !== 0){
                        //判断是否已经实例化iScroll，实例化后是存在滚动条div的
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
    PGAppFramework.slider = function(){
        var me = this;
        me.jsonp({class:'YT_Article',action:'GetArticleRandomSortNew',param:[5,'IMG'].join('|')},function(result){
            if(result.length !== 0){
                var data = [];
                for(i in result){
                    if($(result[i].content).find('img').size() !== 0){
                        result[i]['img'] = $(result[i].content).find('img').eq(0).attr('src');
                        data.push(result[i]);
                    }
                }
                if($.ui.scrollingDivs.main){
                    $('#main').find('div').eq(0).prepend(tmpl('slider_tpl',{item:data}));
                }else{
                    $('#main').prepend(tmpl('slider_tpl',{item:data}));
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
        });
    };
    PGAppFramework.viewArticle = function(id){
        this.jsonp({class:'YT_Article',action:'GetArticleModel',param:id},function(data){
            if($.ui.scrollingDivs.single){
                $('#single').find('div').eq(0).html(tmpl('single_tpl',data[0]));
            }else{
                $('#single').html(tmpl('single_tpl',data[0]));
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
        me.menu();
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