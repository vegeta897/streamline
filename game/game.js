'use strict'
Application.Services.service('Game', function(Canvas, Objects, $timeout) {
    console.log('game service initialized',performance.now());

    var game = { arena: { width: 200, height: 100, pixels: 6 },  objects: { streams: [] } };
    
    game.secondsElapsed = game.ticks = game.frames = game.framesDropped = game.frameCount = 
        game.framesPerSecond = game.tickCount = game.ticksPerSecond = 0;
    var rendered = false;
    
    var now, dt = 0, last = performance.now(), step = 1000/60; // 60 FPS
    
    var tick = function() {
        now = performance.now(); dt += (now - last);
        if(dt > step) {
            if(!rendered) { game.framesDropped++; } // If the last update wasn't rendered, we dropped a frame
            while(dt >= step) { dt -= step; game.ticks++; update(step,dt,now); }
            rendered = false;
        }
        last = now;
    };
    setInterval(tick,step);
    var frame = function() {
        var rt = performance.now() - last;
        game.frames++; game.frameCount++;
        if(!rendered) { $timeout(function(){}); Canvas.render(rt,game,step); rendered = true; } 
        requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame); // Request the next frame

    var update = function(step,dt,now) {
        var tickTime = performance.now();
        for(var sp = 0, spl = game.objects.streams.length; sp < spl; sp++) {
            game.objects.streams[sp].update(); 
            if(game.objects.streams[sp].delete) { game.objects.streams.splice(sp,1); sp--; spl--; }
        }
        if(game.secondsElapsed < Math.floor(tickTime / 1000)) {
            game.secondsElapsed = Math.floor(tickTime / 1000);
            game.framesPerSecond = game.frameCount;
            game.frameCount = 0;
            game.ticksPerSecond = game.tickCount;
            game.tickCount = 0;
            game.objects.streams.push(Objects.StreamPixel(game.arena));
        }
        game.tickCount++;
    };
    
    
    
    return { 
        game: game
    }
});