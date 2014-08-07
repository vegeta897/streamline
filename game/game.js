'use strict';
Application.Services.service('Game', function(Canvas, Input, Objects, Utility, $timeout) {
    console.log('game service initialized',performance.now());

    var game = { 
        arena: { width: 200, height: 100, pixels: 6 },  
        objects: { streams: [], streamX: {}, streamY: {}, collisions: [], gates: {}, gateX: {}, gateY: {} },
        player: { input: {} }, 
        fps: 60
    };
    game.secondsElapsed = game.frames = game.frameCount = game.localServerOffset = game.gateCount =
        game.framesPerSecond = game.tickCount = game.ticksPerSecond = 0;
    var now, dt = 0, last = 0, rendered = false, step = 1000/game.fps; // 60 FPS
    Canvas.setGridSize(game.arena.pixels,game);

    var tick = function() {
        now = performance.now(); dt += (now - last);
        if(dt > step) {
            while(dt >= step) { 
                dt -= step; if(game.paused && !game.oneFrame) { continue; } 
                game.ticks++; update(step,dt,now);
                game.oneFrame = false;
            }
            rendered = false;
        }
        last = now;
    };
    var frame = function() {
        var rt = performance.now() - last;
        game.frames++; game.frameCount++;
        if(!rendered) { $timeout(function(){}); Canvas.render(rt,game,step,game.ticks); rendered = true; }
        requestAnimationFrame(frame);
    };
    
    setTimeout(function(){ // Wait a second for server time to sync
        game.localServerOffset = document.domain == 'localhost' ? 9700 : ServerDate.now() - Date.now();
        game.ticks = Math.floor(((Date.now() + game.localServerOffset) - 1407300000000) / step);
        last = performance.now();
        setInterval(tick,step);
        requestAnimationFrame(frame); // Request the next frame
    },1200);

//    var fireRef = new Firebase('https://streamline.firebaseio.com'); TODO: Firebase
    
    for(var ix = 0; ix < 19; ix++) {
        for(var iy = 0; iy < 9; iy++) {
            var gateDir = ['Up','Down','Left','Right'][Math.floor(Math.random()*4)];
            new Objects['RedirGate'+gateDir](
                game,(ix*10+10+Utility.randomInt(-5,4)),(iy*10+10+Utility.randomInt(-5,4)));
        }
    }
//    new Objects.RedirGateLeft(game,20,50);
//    new Objects.RedirGateDown(game,15,50);
//    new Objects.RedirGateRight(game,15,55);
//    new Objects.RedirGateUp(game,20,55);
//    new Objects.RedirGateRight(game,20,50);
//    new Objects.RedirGateDown(game,25,50);
//    new Objects.RedirGateRight(game,25,55);
//    new Objects.RedirGateUp(game,30,55);
//    new Objects.RedirGateRight(game,30,50);
//    new Objects.RedirGateDown(game,35,50);
//    new Objects.RedirGateRight(game,35,55);
//    new Objects.RedirGateUp(game,40,55);
//    new Objects.RedirGateRight(game,40,50);

    game.player.cursor = Canvas.cursor;

    var update = function(step,dt,now) {
        Input.process(game);
        game.objects.streamX = {}; game.objects.streamY = {};
//        var collision = {};
        if(game.player.build) {
            new Objects[game.player.build](game,game.player.cursor.x,game.player.cursor.y);
            game.player.build = false;
        }
        for(var sp = 0, spl = game.objects.streams.length; sp < spl; sp++) {
            var thisSP = game.objects.streams[sp];
//            var spGrid = Math.round(thisSP.x/game.arena.pixels)+':'+Math.round(thisSP.y/game.arena.pixels);
//            if(collision.hasOwnProperty(spGrid)) {
//                var collidedSP = collision[spGrid];
//                if(!collidedSP.collision && !thisSP.collision
//                    && Math.abs(collidedSP.x - thisSP.x) <= 2 && Math.abs(collidedSP.y - thisSP.y) <= 2) {
//                    game.objects.collisions.push({ x: thisSP.x, y: thisSP.y, tick: game.ticks, 
//                        intensity: (thisSP.speed + collidedSP.speed) / 2, type: 'stream' });
//                    collidedSP.collision = thisSP.collision = true;
//                }
//            } else { thisSP.collision = false; collision[spGrid] = thisSP; }
            thisSP.update(game);
            if(thisSP.delete) { game.objects.streams.splice(sp,1); sp--; spl--; }
        }

        for(var c = 0, cl = game.objects.collisions.length; c < cl; c++) {
            var thisC = game.objects.collisions[c];
            if(game.ticks - thisC.tick > 30) { game.objects.collisions.splice(c,1); c--; cl--; }
        }
        game.gateCount = 0;
        for(var gk in game.objects.gates) { if(!game.objects.gates.hasOwnProperty(gk)) { continue; }
            game.objects.gates[gk].update(game);
            game.gateCount++;
        }
        
        if(game.ticks % game.fps == 0) { // Every game second
            game.secondsElapsed = game.ticks / game.fps;
            game.framesPerSecond = game.frameCount;
            game.ticksPerSecond = game.tickCount;
            game.tickCount = game.frameCount = 0;
        }
        if(game.ticks % 5 == 0) { // Every 5 frames
        }
        if(game.ticks % 10 == 0) { // Every 10 frames
            Math.seedrandom(game.ticks);
            if(Math.random() > 0.08/* && game.objects.streams.length == 0*/) {
                game.objects.streams.push(Objects.StreamPixel(game.arena));
            }
        }
        game.tickCount++;
    };
    
    return { 
        game: game,
        pause: function() { game.paused = true; }, resume: function() { game.paused = false; },
        oneFrame: function() { game.oneFrame = true; },
        clearGates: function() { game.objects.gates = {}; game.objects.gateX = {}; game.objects.gateY = {}; }
    }
});