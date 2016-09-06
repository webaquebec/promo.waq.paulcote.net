// ---------------------------- //
//             Main             //
// ---------------------------- //
// This file is called after every other javascript files

// Modules

// Example:
// window.project.modules.exampleModule = $('.element').module();


$(function() {

    $('.nav-next').on('click', function(){
        var current = $('.is-active');
        var befores = $('[class*=pos-bf]').sort(sortMe);
        var afters = $($('[class*=pos-af]').sort(sortMe).get().reverse());

        current.removeClass('is-active').addClass('pos-bf-1');

        $.each(befores, function( index, item ) {
            var pos = parseInt(item.className.replace('person','').replace('pos-bf-','').replace('pos-af-',''));
            $(item).removeClass(function(index, css) {
                return (css.match(/\bpos-bf-\S+/g) || []).join(' ');
            })
            if(index == 0){
                $(item).addClass('pos-af-'+afters.length);
            }
            else{
                $(item).addClass('pos-bf-'+(pos+1));
            }
        });

        $.each(afters, function( index, item ) {
            var pos = parseInt(item.className.replace('person','').replace('pos-bf-','').replace('pos-af-',''));
            $(item).removeClass(function(index, css) {
                return (css.match(/\bpos-af-\S+/g) || []).join(' ');
            })
            if(index == 0){
                $(item).addClass('is-active');
            }
            else{
                $(item).addClass('pos-af-'+(pos-1));
            }
        });
    });

    $('.nav-prev').on('click', function(){
        var current = $('.is-active');
        var afters = $('[class*=pos-af]').sort(sortMe);
        var befores = $($('[class*=pos-bf]').sort(sortMe).get().reverse());

        current.removeClass('is-active').addClass('pos-af-1');

        $.each(befores, function( index, item ) {
            var pos = parseInt(item.className.replace('person','').replace('pos-bf-','').replace('pos-af-',''));
            $(item).removeClass(function(index, css) {
                return (css.match(/\bpos-bf-\S+/g) || []).join(' ');
            })
            if(index == 0){
                $(item).addClass('is-active');
            }
            else{
                $(item).addClass('pos-bf-'+(pos-1));
            }
        });

        $.each(afters, function( index, item ) {
            var pos = parseInt(item.className.replace('person','').replace('pos-bf-','').replace('pos-af-',''));
            $(item).removeClass(function(index, css) {
                return (css.match(/\bpos-af-\S+/g) || []).join(' ');
            })
            if(index == 0){
                $(item).addClass('pos-bf-'+afters.length);
            }
            else{
                $(item).addClass('pos-af-'+(pos+1));
            }
        });
    });

});

function sortMe(a, b) {
    var aPos = a.className.replace('person','').replace('pos-bf-','').replace('pos-af-','');
    var bPos = b.className.replace('person','').replace('pos-bf-','').replace('pos-af-','');
    return aPos < bPos;
}
