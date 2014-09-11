(function(){
    window.PGAppFramework = {};
    PGAppFramework.api = 'http://d.pugu.biz/api.html';
    PGAppFramework.menu = function(){
        var me = this;
        me.jsonp({action:'menu'},function(result){
            $('nav ul').append(tmpl('nav_tpl',{item:result})).find('li').bind('click',function(){
                var li = this;
                var id = $(li).data('id');
                me.alias = $(li).data('alias');
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
                            container.empty().append(tmpl(me.alias+'_tpl',{item:result})).find('a').bind('click',function(){
                                var data = result[$(this).data('id')];
                                if($.ui.scrollingDivs.single){
                                    $('#single').find('div').eq(0).html(tmpl('single_tpl',data));
                                }else{
                                    $('#single').html(tmpl('single_tpl',data));
                                }
                                $.ui.loadContent('#single',false,false,"up");
                                if($('#single').find('img').size() !== 0){
                                    $('#single').find('img').css({'max-width':'100%'}).load(function(){
                                        me.refresh();
                                    });
                                }else{
                                    me.refresh();
                                }
                            });
                            $.ui.loadContent('#'+me.alias,false,false,"up");
                        }
                    }
                });
            });
        });
    };
    PGAppFramework.jsonp = function(data,callback){
        $.ui.showMask('loading...');
        var me = this;
        var url = [me.api,$.param(data)];
        $.jsonP({
            url:url.join('?'),
            success:function(result){
                callback(result);
                me.refresh();
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
    PGAppFramework.start = function(){
        this.menu();
    };
})();