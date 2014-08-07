'use strict';
Application.Services.service('Utility', function() {
    return {
        isBetween: function(input,n1,n2) { // Checks if input is between n1 and n2 (n1 and n2 are reversible)
            return (input <= n1 && input >= n2) || (input >= n1 && input <= n2) },
        isBetweenSoftUpper: function(input,n1,n2) { // Same as isBetween, but only upper limit can be equal
            var upper = n1 > n2 ? n1 : n2, lower = n1 > n2 ? n2 : n1;
            return input > lower && input <= upper;
        },
        capitalize: function(input) { return input.substr(0,1).toUpperCase() + input.substring(1,input.length); },
        randomInt: function(n1,n2) { // Returns a random integer between n1 and n2 (reversible)
            var upper = n1 > n2 ? n1 : n2, lower = n1 > n2 ? n2 : n1;
            return Math.floor(Math.random()*(upper-lower-1) + lower);
        },
        sortArrayByProperty: function(arr, sortby, descending) {
            if(arr.length == 0) { return arr; }
            if(arr[0].hasOwnProperty(sortby)) {
                if(descending) {
                    arr.sort(function(obj1,obj2) { if(obj1[sortby]<obj2[sortby]) { return 1; } else { return -1; } });
                } else {
                    arr.sort(function(obj1,obj2) { if(obj1[sortby]>obj2[sortby]) { return 1; } else { return -1; } });
                }
            }
            return arr;
        }
    }
});