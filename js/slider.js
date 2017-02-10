/**
 * slider插件可悬停控制
 */
; $(function ($, window, document, undefined) {
    
    Slider = function (container, options) {
        /*
        options = {
            auto: true,
            time: 3000,
            event: 'hover' | 'click',
            mode: 'slide | fade',
            controller: $(),
            activeControllerCls: 'className',
            exchangeEnd: $.noop
        }
        */

        "use strict"; //stirct mode not support by IE9-

        if (!container) return;

        var options = options || {},
            currentIndex = 0,
            cls = options.activeControllerCls,
            delay = options.delay,
            isAuto = options.auto,
            controller = options.controller,
            event = options.event,
            interval,
            slidesWrapper = container.children().first(),
            slides = slidesWrapper.children(),
            length = slides.length,
            childWidth = container.width(),
            totalWidth = childWidth * slides.length;

        function init() {
            var controlItem = controller.children();

            mode();

            event == 'hover' ? controlItem.mouseover(function () {
                stop();
                var index = $(this).index();

                play(index, options.mode);
            }).mouseout(function () {
                isAuto && autoPlay();
            }) : controlItem.click(function () {
                stop();
                var index = $(this).index();

                play(index, options.mode);
                isAuto && autoPlay();
            });

            isAuto && autoPlay();
        }

        //animate mode
        function mode() {
            var wrapper = container.children().first();

            options.mode == 'slide' ? wrapper.width(totalWidth) : wrapper.children().css({
                'position': 'absolute',
                'left': 0,
                'top': 0
            })
                .first().siblings().hide();
        }

        //auto play
        function autoPlay() {
            interval = setInterval(function () {
                triggerPlay(currentIndex);
            }, options.time);
        }

        //trigger play
        function triggerPlay(cIndex) {
            var index;

            (cIndex == length - 1) ? index = 0 : index = cIndex + 1;
            play(index, options.mode);
        }

        //play
        function play(index, mode) {
            slidesWrapper.stop(true, true);
            slides.stop(true, true);

            mode == 'slide' ? (function () {
                if (index > currentIndex) {
                    slidesWrapper.animate({
                        left: '-=' + Math.abs(index - currentIndex) * childWidth + 'px'
                    }, delay);
                } else if (index < currentIndex) {
                    slidesWrapper.animate({
                        left: '+=' + Math.abs(index - currentIndex) * childWidth + 'px'
                    }, delay);
                } else {
                    return;
                }
            })() : (function () {
                if (slidesWrapper.children(':visible').index() == index) return;
                slidesWrapper.children().fadeOut(delay).eq(index).fadeIn(delay);
            })();

            try {
                controller.children('.' + cls).removeClass(cls);
                controller.children().eq(index).addClass(cls);
            } catch (e) { }

            currentIndex = index;

            options.exchangeEnd && typeof options.exchangeEnd == 'function' && options.exchangeEnd.call(this, currentIndex);
        }

        //stop
        function stop() {
            clearInterval(interval);
        }

        //prev frame
        function prev() {
            stop();

            currentIndex == 0 ? triggerPlay(length - 2) : triggerPlay(currentIndex - 2);

            isAuto && autoPlay();
        }

        //next frame
        function next() {
            stop();

            currentIndex == length - 1 ? triggerPlay(-1) : triggerPlay(currentIndex);

            isAuto && autoPlay();
        }

        //init
        init();

        //expose the Slider API
        return {
            prev: function () {
                prev();
            },
            next: function () {
                next();
            }
        }
    };

}(jQuery, window, document));


(function() {
    var LI_WIDTH = [336, 182, 182, 730], 
        LI_DOM = [$('.slide_screen li.liA'), $('.slide_screen li.liB'), $('.slide_screen li.liC'), $('.slide_screen li.liD')], 
        LI_BTN = $('.slide_screen .libtn'),
        COUNT =  3, SPEED = 1000, DISTIM = 6000, LI_COUNT = 4;
    var cur = 1, next_cur = 2, runid, isclick = true;

    init();
    initEvent();

    
    function init() {
        LI_BTN.find('li').eq(cur-1).addClass('selected');

        for(var i=0; i<LI_COUNT; i++) {
            LI_DOM[i].find('.window').css({'top':0, 'left':0, 'position':'absolute'});
            LI_DOM[i].find('.window').css('width', LI_WIDTH[i]*COUNT);
        }

    }
    function initEvent() {
        LI_BTN.click(function(ev){
            if(isclick && $(ev.target).attr("_index") !== undefined) {
                isclick = false;
                LI_BTN.find('li').eq(cur-1).removeClass('selected');
                clearInterval(runid);
                runid = null;
                cur = parseInt($(ev.target).attr("_index"));
                next_cur = cur + 1;
                LI_BTN.find('li').eq(cur-1).addClass('selected');
                for(var i=0; i<LI_COUNT; i++) {
                    LI_DOM[i].find('.bar').slideUp();
                    LI_DOM[i].find('p').slideUp();
                    LI_DOM[i].find('.window').stop(true,true).animate({"left": -(cur-1)*LI_WIDTH[i]}, SPEED, function(){
                        // if(runid===null)runid = setInterval(run, DISTIM);
                        isclick = true;
                        $('.bar').slideDown(300); 
                        $('.piece p').slideDown(300);
                    });


                    
                }
            }
        });
    }
    function run() {
        isclick = false;
        LI_BTN.find('li').eq(cur-1).removeClass('selected');
        if(cur != COUNT){
            for(var i=0; i<LI_COUNT; i++) {
                LI_DOM[i].find('.window').stop(true,true).animate({"left": -(next_cur-1)*LI_WIDTH[i]}, SPEED, function() {
                    isclick = true;
                });
            }
            cur++;
            next_cur = cur + 1;
        }
        else {
            for(var i=0; i<LI_COUNT; i++) {
                LI_DOM[i].find('.piece:lt('+(COUNT-1)+')').clone().insertAfter(LI_DOM[i].find('.piece').last());
                LI_DOM[i].find('.piece:lt('+(COUNT-1)+')').remove();
                LI_DOM[i].find('.window').css('left', '0px');

                LI_DOM[i].find('.window').stop(true,true).animate({"left": -LI_WIDTH[i]}, SPEED, function() {
                    $(this).find('.piece').first().clone().insertAfter($(this).find('.piece').last());
                    $(this).find('.piece').first().remove();
                    $(this).css('left', '0px');
                    isclick = true;
                });
            }
            cur = 1;
            next_cur = cur + 1;
        }
        LI_BTN.find('li').eq(cur-1).addClass('selected');
    }
    var licindex = 2;
    $('.liC').click(function (){
        console.log(cur);
        if (cur == 1) {
            $('.libtn li').eq(2).click();

        }else if (cur == 2) {
            $('.libtn li').eq(0).click();
        }else if (cur == 3) {
            $('.libtn li').eq(1).click();
        };
    })
    $('.liB').click(function (){
        if (cur == 1) {
            $('.libtn li').eq(1).click();

        }else if (cur == 2) {
            $('.libtn li').eq(2).click();
        }else if (cur == 3) {
            $('.libtn li').eq(0).click();
        };
    })
})();


$(function(){

    var tophtml="<div id=\"izl_rmenu\" class=\"izl-rmenu\"><div class=\"qiqiu\"></div><div class=\"btn btn-phone\"><div class=\"phone\">400-701-0233</div></div><a href=\"#\" class=\"btn btn-qq\"></a><div class=\"btn btn-wx\"><img class=\"pic\" src=\"images/ewm.jpg\" /></div><div class=\"btn btn-top\"></div></div>";
    $("#top").html(tophtml);
    $("#izl_rmenu").each(function(){
        $(this).find(".btn-wx").mouseenter(function(){
            $(this).find(".pic").fadeIn("fast");
        });
        $(this).find(".btn-wx").mouseleave(function(){
            $(this).find(".pic").fadeOut("fast");
        });
        $(this).find(".btn-phone").mouseenter(function(){
            $(this).find(".phone").fadeIn("fast");
        });
        $(this).find(".btn-phone").mouseleave(function(){
            $(this).find(".phone").fadeOut("fast");
        });
        $(this).find(".btn-top").click(function(){
            $("html, body").animate({
                "scroll-top":0
            },"fast");
        });
    });
    var lastRmenuStatus=false;
    $(window).scroll(function(){//bug
        var _top=$(window).scrollTop();
        if(_top>200){
            $("#izl_rmenu").data("expanded",true);
        }else{
            $("#izl_rmenu").data("expanded",false);
        }
        if($("#izl_rmenu").data("expanded")!=lastRmenuStatus){
            lastRmenuStatus=$("#izl_rmenu").data("expanded");
            if(lastRmenuStatus){
                $("#izl_rmenu .btn-top").slideDown();
            }else{
                $("#izl_rmenu .btn-top").slideUp();
            }
        }
    });
});