'use strict'
Application.Services.service('Canvas', function() {

    var mainCanvas = document.getElementById('mainCanvas');
    var mainContext = mainCanvas.getContext ? mainCanvas.getContext('2d') : null;
    
    mainCanvas.onselectstart = function() { return false; }; // Disable selecting and right clicking
    jQuery('body').on('contextmenu', '#mainCanvas', function(e){ return false; });
    
    return {
        render: function(dt,game) {
            mainContext.clearRect(0,0,mainCanvas.width,mainCanvas.height);
            mainContext.fillStyle = 'white';
            mainContext.font = '20px Arial';
            mainContext.fillText('Seconds Elapsed: '+game.secondsElapsed,50,50);
            mainContext.fillText('FPS: '+game.framesPerSecond,50,80);
            mainContext.fillText('Tickrate: '+game.ticksPerSecond,50,100);
            mainContext.fillRect(game.myBox.x,game.myBox.y,game.myBox.width,game.myBox.height);
            mainContext.fillText('Box Reset Time Deviation: '+Math.floor(35000-game.boxTime)+'ms',50,220);
            mainContext.fillText('Frames: '+game.frames,50,250);
            mainContext.fillText('Ticks: '+game.ticks,50,280);
            mainContext.fillText('Frames Dropped: '+game.framesDropped,50,310);
            mainContext.fillText('Stream Pixels: '+game.objects.streams.length,50,340);
            
            for(var sp = 0, spl = game.objects.streams.length; sp < spl; sp++) {
                mainContext.fillStyle = '#a6acc2';
                mainContext.fillRect(game.objects.streams[sp].x-1+game.arena.pixels/2,
                    game.objects.streams[sp].y-1+game.arena.pixels/2,2,2);
            }
        }
    }
});