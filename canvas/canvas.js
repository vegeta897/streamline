'use strict'
Application.Services.service('Canvas', function() {

    var mainCanvas = document.getElementById('mainCanvas');
    var highCanvas = document.getElementById('highCanvas');
    var mainContext = mainCanvas.getContext ? mainCanvas.getContext('2d') : null;
    var highContext = highCanvas.getContext ? highCanvas.getContext('2d') : null;

    highCanvas.onselectstart = function() { return false; }; // Disable selecting and right clicking
    jQuery('body').on('contextmenu', '#highCanvas', function(e){ return false; });

    var gridSize, cursor = { x: '-', y: '-' };
    
    var onMouseMove = function(e) {
        var offset = jQuery(mainCanvas).offset();
        var x = e.pageX - offset.left < 0 ? 0 : Math.floor((e.pageX - offset.left) / gridSize);
        var y = e.pageY - offset.top < 0 ? 0 : Math.floor((e.pageY - offset.top) / gridSize);
        if(cursor.x != x || cursor.y != y) {
            requestAnimationFrame(function(){
                highContext.clearRect(0,0,highCanvas.width,highCanvas.height);
                highContext.fillStyle = 'rgba(255,255,255,0.08)';
                highContext.fillRect(0,y*gridSize,highCanvas.width,gridSize);
                highContext.fillRect(x*gridSize,0,gridSize,highCanvas.height);
                highContext.fillStyle = 'rgba(255,255,255,0.3)';
                highContext.fillRect(x*gridSize-1,y*gridSize-1,gridSize+2,gridSize+2);
                highContext.clearRect(x*gridSize-1,y*gridSize+2,gridSize+2,gridSize-4);
                highContext.clearRect(x*gridSize+2,y*gridSize-1,gridSize-4,gridSize+2);
                highContext.clearRect(x*gridSize,y*gridSize,gridSize,gridSize);
            });
            cursor.x = x; cursor.y = y;
        }
    };
    var onMouseOut = function() {
        cursor.x = cursor.y = '-';
        requestAnimationFrame(function(){
            highContext.clearRect(0,0,highCanvas.width,highCanvas.height);
        });
    };
        
    return {
        render: function(rt,game,step) {
            mainContext.clearRect(0,0,mainCanvas.width,mainCanvas.height);
            mainContext.fillStyle = 'white';
            for(var sp = 0, spl = game.objects.streams.length; sp < spl; sp++) { 
                game.objects.streams[sp].render(mainContext,rt,step); }
        },
        cursor: cursor,
        setGridSize: function(pixels) { gridSize = pixels;
            jQuery(highCanvas).mousemove(onMouseMove).mouseleave(onMouseOut); }
    }
});