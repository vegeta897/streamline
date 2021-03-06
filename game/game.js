'use strict';
Application.Services.service('Game', function(Canvas, Database, Input, Objects, Utility, $timeout) {
    console.log('game service initialized',performance.now());
    var debug = {};
    //debug.oneStream = true;
    debug.noGates = true;
    
    var game = { 
        arena: { width: 200, height: 100, pixels: 6 },  
        objects: { streams: [], streamX: {}, streamY: {}, collisions: [], gates: {}, gateX: {}, gateY: {} },
        player: { input: {}, score: parseInt(Database.getValue('score')) || 0, 
            bits: parseInt(Database.getValue('bits')) || 0 },
        fps: 60, definitions: { 
            units: [{digit:8,name:'key'},{digit:7,name:'eon'},{digit:6,name:'chapter'},
                {digit:5,name:'period'},{digit:4,name:'cycle'},{digit:3,name:'phase'},
                {digit:2,name:'step'},{digit:1,name:'moment'}]
        }
    };
    game.frames = game.frameCount = game.localServerOffset = game.gateCount = game.framesPerSecond = 
        game.tickCount = 0;
    game.score = function(amount) { game.player.score += parseInt(amount); 
        Database.setValue('score',game.player.score);  };
    game.bits = function(amount) { game.player.bits += parseInt(amount); 
        Database.setValue('bits',game.player.bits); };
    
    var now, dt = 0, last = 0, rendered = false, step = 1000/game.fps; // 60 FPS
    Canvas.setGridSize(game.arena.pixels,game);

    var tick = function() {
        if(game.crashed) { return; }
        now = performance.now(); dt += (now - last);
        if(dt > 60000) { console.log('too many updates missed! game crash'); game.crashed = game.paused = true; }
        if(dt > step) {
            while(dt >= step) { 
                dt -= step; if(game.paused && !game.oneFrame) { continue; } else { rendered = false; }
                game.ticks++; update(step,dt,now);
                game.oneFrame = false;
            }
        }
        last = now;
    };
    var frame = function() {
        var rt = performance.now() - last;
        game.frames++; game.frameCount++;
        if(!rendered) { $timeout(function(){}); Canvas.render(rt,game,step,game.ticks); rendered = true; }
        requestAnimationFrame(frame);
    };
    
    Database.init(game,Objects);
    
    setTimeout(function(){ // Wait a second for server time to sync
        game.localServerOffset = document.domain == 'localhost' ? 400 : ServerDate.now() - Date.now();
        game.ticks = Math.floor(((Date.now() + game.localServerOffset) - 1407300000000) / step);
        last = performance.now();
        setInterval(tick,step);
        requestAnimationFrame(frame); // Request the next frame
    },1200);

//    var fireRef = new Firebase('https://streamline.firebaseio.com'); TODO: Firebase
    
    if(!debug.noGates) {
        for(var ix = 0; ix < 19; ix++) {
            for(var iy = 0; iy < 9; iy++) {
                var gateDir = ['Up','Down','Left','Right'][Math.floor(Math.random()*4)];
                new Objects['RedirGate'+gateDir](
                    game,(ix*10+10+Utility.randomInt(-5,4)),(iy*10+10+Utility.randomInt(-5,4)));
            }
        }
    }
    
    new Objects.HomeGate(game,100,50);
    
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
        game.objects.streamX = {}; game.objects.streamY = {}; //game.objects.gateX = {}; game.objects.gateY = {};
        if(game.player.building) { game.player.canAfford = game.player.bits >= Objects.COSTS[game.player.building]; }
        if(game.player.build && game.player.canAfford) {
            game.bits(-Objects.COSTS[game.player.build]);
            Database.storeGate(game.player.build,game.player.cursor.x,game.player.cursor.y);
            new Objects[game.player.build](game,game.player.cursor.x,game.player.cursor.y);
            game.player.build = game.player.building = false;
        } else { game.player.build = false; }
        game.gateCount = 0;
        for(var gk in game.objects.gates) { if(!game.objects.gates.hasOwnProperty(gk)) { continue; }
            game.objects.gates[gk].update(game);
//            game.objects.gateX[game.objects.gates[gk].gameX] =
//                game.objects.gateX.hasOwnProperty(game.objects.gates[gk].gameX) ?
//                    game.objects.gateX[game.objects.gates[gk].gameX].concat([game.objects.gates[gk]])
//                    : [game.objects.gates[gk]];
//            game.objects.gateY[game.objects.gates[gk].gameY] =
//                game.objects.gateY.hasOwnProperty(game.objects.gates[gk].gameY) ?
//                    game.objects.gateY[game.objects.gates[gk].gameY].concat([game.objects.gates[gk]])
//                    : [game.objects.gates[gk]];
            game.gateCount++;
        }
//        var collision = {};
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

//        for(var c = 0, cl = game.objects.collisions.length; c < cl; c++) {
//            var thisC = game.objects.collisions[c];
//            if(game.ticks - thisC.tick > 30) { game.objects.collisions.splice(c,1); c--; cl--; }
//        }
        
        if(game.ticks % game.fps == 0) { // Every game second
            game.framesPerSecond = game.frameCount;
            game.tickCount = game.frameCount = 0;
        }
        if(game.ticks % 5 == 0) { // Every 5 frames
            
        }
        if(game.ticks % 10 == 0) { // Every 10 frames
            Math.seedrandom(game.ticks);
            if(Math.random() > 0.8 && (game.objects.streams.length == 0 || !debug.oneStream)) {
                game.objects.streams.push(Objects.StreamPixel(game.arena,game.ticks));
            }
        }
        game.tickCount++;
    };
    
    return { 
        game: game,
        pause: function() { game.paused = true; }, resume: function() { game.paused = false; },
        oneFrame: function() { game.oneFrame = true; },
        clearGates: function() { 
            game.objects.gates = {}; game.objects.gateX = {}; game.objects.gateY = {}; Database.clearGates(); }
    }
});