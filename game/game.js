'use strict';
Application.Services.service('Game', function(Canvas, Objects, Utility, $timeout) {
    console.log('game service initialized',performance.now());

    var now, dt = 0, last = 0, fps = 60, step = 1000/fps; // 60 FPS
    var game = { 
        arena: { width: 200, height: 100, pixels: 6 },  
        objects: { streams: [], streamX: {}, streamY: {}, collisions: [], gates: {}, gateX: {}, gateY: {} },
        player: {  }
    };
    game.secondsElapsed = game.frames = game.framesDropped = game.frameCount = game.localServerOffset =
        game.framesPerSecond = game.tickCount = game.ticksPerSecond = 0;
    var rendered = false;
    Canvas.setGridSize(game.arena.pixels,game);

    var tick = function() {
        now = performance.now(); dt += (now - last);
        if(dt > step) {
            if(!rendered) { game.framesDropped++; } // If the last update wasn't rendered, we dropped a frame
            while(dt >= step) { dt -= step; game.ticks++; update(step,dt,now); }
            rendered = false;
        }
        last = now;
    };
    var frame = function() {
        var rt = performance.now() - last;
        game.frames++; game.frameCount++;
        if(!rendered) { $timeout(function(){}); Canvas.render(rt,game,step); rendered = true; }
        requestAnimationFrame(frame);
    };
    
    setTimeout(function(){ // Wait a second for server time to sync
        game.localServerOffset = document.domain == 'localhost' ? 9700 : ServerDate.now() - Date.now();
        game.ticks = Math.floor(((Date.now() + game.localServerOffset) - 1407110000000) / step);
        last = performance.now();
        setInterval(tick,step);
        requestAnimationFrame(frame); // Request the next frame
    },1000);

//    var fireRef = new Firebase('https://streamline.firebaseio.com'); TODO: Firebase
    
    for(var ix = 0; ix < 19; ix++) {
        for(var iy = 0; iy < 9; iy++) {
            var gateDir = ['Up','Down','Left','Right'][Math.floor(Math.random()*4)];
            new Objects['RedirGate'+gateDir](
                game,(ix*10+10+Utility.randomInt(-3,3)),(iy*10+10+Utility.randomInt(-3,3)));
        }
    }
//    new Objects.RedirGateLeft(game,85,35);
//    new Objects.RedirGateDown(game,95,45);
//    new Objects.RedirGateUp(game,105,55);
//    new Objects.RedirGateRight(game,115,65);

    var update = function(step,dt,now) {
        game.objects.streamX = {}; game.objects.streamY = {};
        var collision = {};
        for(var sp = 0, spl = game.objects.streams.length; sp < spl; sp++) {
            var thisSP = game.objects.streams[sp];
            var spGrid = Math.round(thisSP.x/game.arena.pixels)+':'+Math.round(thisSP.y/game.arena.pixels);
            if(collision.hasOwnProperty(spGrid)) {
                var collidedSP = collision[spGrid];
                if(!collidedSP.collision && !thisSP.collision
                    && Math.abs(collidedSP.x - thisSP.x) <= 2 && Math.abs(collidedSP.y - thisSP.y) <= 2) {
                    game.objects.collisions.push({ x: thisSP.x, y: thisSP.y, tick: game.ticks, 
                        intensity: (thisSP.speed + collidedSP.speed) / 2, type: 'stream' });
                    collidedSP.collision = thisSP.collision = true;
                }
            } else { thisSP.collision = false; collision[spGrid] = thisSP; }
            thisSP.update(game);
            if(thisSP.delete) { game.objects.streams.splice(sp,1); sp--; spl--; }
        }

        for(var c = 0, cl = game.objects.collisions.length; c < cl; c++) {
            var thisC = game.objects.collisions[c];
            if(game.ticks - thisC.tick > 30) { game.objects.collisions.splice(c,1); c--; cl--; }
        }
        
        for(var gk in game.objects.gates) { if(!game.objects.gates.hasOwnProperty(gk)) { continue; }
            game.objects.gates[gk].update(game);
        }
        
        game.arena.cursor = Canvas.cursor;
        if(game.ticks % fps == 0) { // Every game second
            game.secondsElapsed = game.ticks / fps;
            game.framesPerSecond = game.frameCount;
            game.ticksPerSecond = game.tickCount;
            game.tickCount = game.frameCount = 0;
        }
        if(game.ticks % 5 == 0) { // Every 5 frames
        }
        if(game.ticks % 10 == 0) { // Every 10 frames
            Math.seedrandom(game.ticks);
            if(Math.random() > 0.028) {
                game.objects.streams.push(Objects.StreamPixel(game.arena));
            }
        }
        game.tickCount++;
    };
    
    return { 
        game: game
    }
});