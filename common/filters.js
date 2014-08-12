'use strict';
Application.Filters.filter('digit', function() {
    return function(number, digit) {
        if(!number) return number;
        number = parseInt(number);
        if(digit > (''+number).length) return 0;
        return (''+number)[(''+number).length-digit];
    }
});