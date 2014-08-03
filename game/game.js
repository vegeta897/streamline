'use strict'
Application.Services.service('Game', function(Canvas, Objects, $timeout) {
    console.log('game service initialized',performance.now());

    var now, dt = 0, last = 0, fps = 60, step = 1000/fps; // 60 FPS
    var game = { arena: { width: 200, height: 100, pixels: 6 },  objects: { streams: [] } };
    game.secondsElapsed = game.frames = game.framesDropped = game.frameCount = 
        game.framesPerSecond = game.tickCount = game.ticksPerSecond = 0;
    var rendered = false;

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
    
    var timestampID = Math.floor(Math.random()*99999);
    var fireRef = new Firebase('https://streamline.firebaseio.com');
    fireRef.child('timestamps/'+timestampID).on('value', function(snap) {
        if(!snap.val()) { return; }
        game.ticks = Math.floor((Date.now() - (localTime - snap.val()) - 1407106525000) / step);
        last = performance.now();
        setInterval(tick,step);
        requestAnimationFrame(frame); // Request the next frame
        fireRef.child('timestamps/'+timestampID).set(null);
    });
    var localTime = Date.now();
    fireRef.child('timestamps/'+timestampID).set(Firebase.ServerValue.TIMESTAMP);

    var update = function(step,dt,now) {
        var tickTime = performance.now();
        for(var sp = 0, spl = game.objects.streams.length; sp < spl; sp++) {
            game.objects.streams[sp].update(); 
            if(game.objects.streams[sp].delete) { game.objects.streams.splice(sp,1); sp--; spl--; }
        }
        if(game.ticks % fps == 0) {
            game.secondsElapsed = game.ticks / fps;
            game.framesPerSecond = game.frameCount;
            game.ticksPerSecond = game.tickCount;
            game.tickCount = game.frameCount = 0;
            game.objects.streams.push(Objects.StreamPixel(game.arena,game.ticks));
        }
        game.tickCount++;
    };
    
    return { 
        game: game
    }
});