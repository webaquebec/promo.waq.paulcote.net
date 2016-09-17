// ---------------------------- //
//             Main             //
// ---------------------------- //
// This file is called after every other javascript files

// Modules

// Example:
// window.project.modules.exampleModule = $('.element').module();


$(function() {

    var startX,
        startY,
        dist,
        threshold = 50, //required min distance traveled to be considered swipe
        minTime = 100, // maximum time allowed to travel that distance
        maxTime = 750, // maximum time allowed to travel that distance
        elapsedTime,
        startTime;

    $('.alum').on('touchstart', function(e) {
        var touchobj = e.changedTouches[0]
        dist = 0
        startX = touchobj.pageX
        startY = touchobj.pageY
        startTime = new Date().getTime() // record time when finger first makes contact with surface
    })

    $('.alum').on('touchend', function(e) {
        var touchobj = e.changedTouches[0]
        dist = touchobj.pageX - startX // get total dist traveled by finger while in contact with surface
        elapsedTime = new Date().getTime() - startTime // get time elapsed
        if(elapsedTime>minTime && elapsedTime<maxTime && Math.abs(dist) >= threshold){
            var swiperightBol = dist>=0;
            if(swiperightBol){
                moveRight();
            }
            else {
                moveLeft();
            }

            e.preventDefault();
        }
    })

    $('.nav-next').on('click', moveLeft);
    $('.nav-prev').on('click', moveRight);

    $('.person').on('touchend', function(){
        if($(this).hasClass('is-active')){
            $(this).toggleClass('is-hover');
        }
    });

});

function sortMe(a, b) {
    var aPos = parseInt(a.className.replace('person', '').replace('pos-bf-', '').replace('pos-af-', ''));
    var bPos = parseInt(b.className.replace('person', '').replace('pos-bf-', '').replace('pos-af-', ''));
    return bPos - aPos;
}

var animating = false;
function moveLeft(){
    if(!animating){
        animating = true;
        var current = $('.is-active');
        var befores = $('[class*=pos-bf]').sort(sortMe);
        var afters = $($('[class*=pos-af]').sort(sortMe).get().reverse());
        $('.person.is-hover').removeClass('is-hover');

        console.log(befores);
        console.log(afters);

        current.removeClass('is-active').addClass('pos-bf-1');

        $.each(befores, function(index, item) {
            var pos = parseInt(item.className.replace('person', '').replace('pos-bf-', '').replace('pos-af-', ''));
            $(item).removeClass(function(index, css) {
                return (css.match(/\bpos-bf-\S+/g) || []).join(' ');
            })
            if (index == 0) {
                $(item).addClass('pos-af-' + afters.length);
            } else {
                $(item).addClass('pos-bf-' + (pos + 1));
            }
        });

        $.each(afters, function(index, item) {
            var pos = parseInt(item.className.replace('person', '').replace('pos-bf-', '').replace('pos-af-', ''));
            $(item).removeClass(function(index, css) {
                return (css.match(/\bpos-af-\S+/g) || []).join(' ');
            })
            if (index == 0) {
                $(item).addClass('is-active');
            } else {
                $(item).addClass('pos-af-' + (pos - 1));
            }
        });

        setTimeout(function(){animating=false;},500);
    }
}

function moveRight() {
    if(!animating){
        animating = true;
        var current = $('.is-active');
        var afters = $('[class*=pos-af]').sort(sortMe);
        var befores = $($('[class*=pos-bf]').sort(sortMe).get().reverse());
        $('.person.is-hover').removeClass('is-hover');

        console.log(befores);
        console.log(afters);

        current.removeClass('is-active').addClass('pos-af-1');

        $.each(befores, function(index, item) {
            var pos = parseInt(item.className.replace('person', '').replace('pos-bf-', '').replace('pos-af-', ''));
            $(item).removeClass(function(index, css) {
                return (css.match(/\bpos-bf-\S+/g) || []).join(' ');
            })
            if (index == 0) {
                $(item).addClass('is-active');
            } else {
                $(item).addClass('pos-bf-' + (pos - 1));
            }
        });

        $.each(afters, function(index, item) {
            var pos = parseInt(item.className.replace('person', '').replace('pos-bf-', '').replace('pos-af-', ''));
            $(item).removeClass(function(index, css) {
                return (css.match(/\bpos-af-\S+/g) || []).join(' ');
            })
            if (index == 0) {
                $(item).addClass('pos-bf-' + afters.length);
            } else {
                $(item).addClass('pos-af-' + (pos + 1));
            }
        });

        setTimeout(function(){animating=false;},500);
    }
}
