'use strict';
Application.Services.service('Database', function(localStorageService) {
    return {
        init: function(game,Objects) {
            if(localStorageService.get('gates')) {
                var storedGates = localStorageService.get('gates');
                for(var gk in storedGates) { if(!storedGates.hasOwnProperty(gk)) { continue; }
                    var grid = { x: gk.split(':')[0], y: gk.split(':')[1] };
                    new Objects[storedGates[gk].split(':')[0]](game,grid.x,grid.y);
                }
            }
        },
        storeGate: function(type,x,y) {
            var storedGates = localStorageService.get('gates') || {};
            storedGates[x+':'+y] = type;
            localStorageService.set('gates',storedGates);
        },
        clearGates: function() {
            localStorageService.remove('gates');
        }
    }
});