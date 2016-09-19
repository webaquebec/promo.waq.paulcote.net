(function() {

    $('a[href^="http:"]:not([href*="' + window.location.host + '"])').addClass('is-external');

}());

(function() {

    var $document = $(document),
        $body = $('body');

    $.onFontResize = {
        delay: 250,
        timer: null,
        on: true,
        box: null,
        boxHeight: 0,
        init: function() {
            this.box = document.createElement('DIV');

            $(this.box).html('Détection du zoom').css({
                position: 'absolute',
                top: '-999px',
                left: '-9999px',
                display: 'inline',
                lineHeight: 1
            }).attr('aria-hidden', 'true').appendTo('body');

            this.boxHeight = $(this.box).height();
        },
        watch: function(delay) {
            if (!this.box) this.init();

            this.unwatch();

            if (delay) this.delay = delay;

            this.on = true;

            this.check();
        },
        unwatch: function() {
            this.on = false;
            if (this.timer) clearTimeout(this.timer);
        },
        check: function() {
            var that = $.onFontResize,
                h = $(that.box).height();

            if (h !== that.boxHeight) {
                that.boxHeight = h;
                $document.triggerHandler('fontresize');
            }

            if (that.on) this.timer = setTimeout(that.check, that.delay);
        }
    };

    $.onFontResize.watch();

    $document.on('fontresize', $.proxy(function() {
        var bodyClasses = ($body.attr('class')) ? _.filter($body.attr('class').split(' '), function(x) {
                if (x.indexOf('is-font-') === -1) return x;
            }) : '',
            fontsize = parseInt($body.css('font-size').replace('px', ''), 10);

        if (bodyClasses) $body.attr('class', '').addClass(bodyClasses.join(' '));

        if (fontsize > 16) {
            $body.addClass(window.project.classes.states.zoom + ' ' + 'is-font-' + fontsize);
        } else {
            $body.removeClass(window.project.classes.states.zoom);
        }
    }, this)).trigger('fontresize');

}());

(function() {

    var $body = $('body'),
        $document = $(document);

    $body.on('keydown', function(e) {
        var keyCode = (window.event) ? e.which : e.keyCode;
        if (!$body.attr('data-state')) {
            if (keyCode === 9 || keyCode === 13 || keyCode === 37 || keyCode === 38 || keyCode === 39 || keyCode === 40) {
                $body.attr('data-state', 'keyboard');
                $document.trigger('keyboardnavigation');
            }
        }
    });

    $body.on('mousemove.LibeoDataState', function(e) {
        if ($body.attr('data-state')) {
            $body.removeAttr('data-state');
        }
        $body.off('mousemove.LibeoDataState');
    });

}());

(function() {

    var $body = $('body');

    $body.on('click', '.skip-menu-link', function(e) {
        e.preventDefault();
        $('[role="navigation"]').eq(0).attr('tabindex', '-1').focus();
    });

    $body.on('click', '.skip-content-link', function(e) {
        e.preventDefault();
        $('[role="main"]').eq(0).attr('tabindex', '-1').focus();
    });

}());

(function() {
    svg4everybody();
}());

(function() {

    var $document = $(document);

    $document.on('click', '[data-toggle-active]', function(event) {
        var classes = $(this).attr('data-toggle-active');
        if (classes.indexOf(' ') > 0) {
            var classesArray = classes.split(' ');
            for (var i = 0; i < classesArray.length; i++) {
                $('.' + classesArray[i]).toggleClass(window.project.classes.states.active);
            }
        } else {
            $('.' + classes).toggleClass(window.project.classes.states.active);
        }
        event.preventDefault();
    });

}());
