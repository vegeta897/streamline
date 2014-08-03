'use strict'
Application.Services.service('Canvas', function() {

    var mainCanvas = document.getElementById('mainCanvas');
    var mainContext = mainCanvas.getContext ? mainCanvas.getContext('2d') : null;
    
    mainCanvas.onselectstart = function() { return false; }; // Disable selecting and right clicking
    jQuery('body').on('contextmenu', '#mainCanvas', function(e){ return false; });
    
    return {
        render: function(rt,game,step) {
            mainContext.clearRect(0,0,mainCanvas.width,mainCanvas.height);
            mainContext.fillStyle = 'white';
            
            for(var sp = 0, spl = game.objects.streams.length; sp < spl; sp++) { 
                game.objects.streams[sp].render(mainContext,rt,step); }
        }
    }
});