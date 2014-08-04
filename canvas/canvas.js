'use strict';
Application.Services.service('Canvas', function() {

    var mainCanvas = document.getElementById('mainCanvas');
    var highCanvas = document.getElementById('highCanvas');
    var mainContext = mainCanvas.getContext ? mainCanvas.getContext('2d') : null;
    var highContext = highCanvas.getContext ? highCanvas.getContext('2d') : null;

    highCanvas.onselectstart = function() { return false; }; // Disable selecting and right clicking
    jQuery('body').on('contextmenu', '#highCanvas', function(e){ return false; });

    var gridSize, game, cursor = { x: '-', y: '-' };
    
    var onMouseMove = function(e) {
        var offset = jQuery(mainCanvas).offset();
        var x = e.pageX - offset.left < 0 ? 0 : Math.floor((e.pageX - offset.left) / gridSize);
        var y = e.pageY - offset.top < 0 ? 0 : Math.floor((e.pageY - offset.top) / gridSize);
        if(cursor.x != x || cursor.y != y) { cursor.x = x; cursor.y = y; }
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
            for(var gk in game.objects.gates) { if(!game.objects.gates.hasOwnProperty(gk)) { continue; }
                game.objects.gates[gk].render(mainContext);
            }
            for(var c = 0, cl = game.objects.collisions.length; c < cl; c++) {
                var thisC = game.objects.collisions[c];
                var age = Math.min(30,game.ticks - thisC.tick);
                var colGrad = mainContext.createRadialGradient(
                    thisC.x + game.arena.pixels/2, thisC.y + game.arena.pixels/2, 0,
                    thisC.x + game.arena.pixels/2, thisC.y + game.arena.pixels/2, 12
                );
                colGrad.addColorStop(0,'rgba(255,255,255,' + (0.8 * (thisC.intensity/10) * (30-age)/30) + ')');
                colGrad.addColorStop((30-age)/30,'rgba(255,255,255,0)');
                mainContext.fillStyle = colGrad;
                mainContext.fillRect(thisC.x + game.arena.pixels/2 - 12, thisC.y + game.arena.pixels/2 - 12,24, 24);
            }
            
            // Render cursor
            highContext.clearRect(0,0,highCanvas.width,highCanvas.height);
            highContext.fillStyle = game.objects.streamX.hasOwnProperty(cursor.x) ? 'rgba(255,255,255,0.2)'
                : 'rgba(255,255,255,0.08)';
            highContext.fillRect(cursor.x*gridSize+0.5,0,gridSize-1,highCanvas.height);
            highContext.fillStyle = game.objects.streamY.hasOwnProperty(cursor.y) ? 'rgba(255,255,255,0.2)'
                : 'rgba(255,255,255,0.08)';
            highContext.fillRect(0,cursor.y*gridSize+0.5,highCanvas.width,gridSize-1);
            if(game.player.building) {
                highContext.fillStyle = 'rgba(255,0,0,0.5)';
                highContext.fillRect(cursor.x*gridSize,cursor.y*gridSize,gridSize,gridSize);
            } else {
                highContext.fillStyle = 'rgba(255,255,255,0.3)';
                highContext.fillRect(cursor.x*gridSize-1,cursor.y*gridSize-1,gridSize+2,gridSize+2);
                highContext.clearRect(cursor.x*gridSize-1,cursor.y*gridSize+2,gridSize+2,gridSize-4);
                highContext.clearRect(cursor.x*gridSize+2,cursor.y*gridSize-1,gridSize-4,gridSize+2);
                highContext.clearRect(cursor.x*gridSize,cursor.y*gridSize,gridSize,gridSize);
            }
        },
        cursor: cursor,
        setGridSize: function(pixels,theGame) { gridSize = pixels; game = theGame;
            jQuery(highCanvas).mousemove(onMouseMove).mouseleave(onMouseOut); }
    }
});