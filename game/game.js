'use strict'
Application.Services.service('Game', function(Canvas) {
    console.log('game service initialized',performance.now());

    var myMessage = { text:'Unchanged' };
    var secondsElapsed = 0;
    var frameCount = 0, framesPerSecond = 0;
    var tickCount = 0, ticksPerSecond = 0;
    var myBox = { width: 20, height: 50, speed: 0.5, x: 50, y: 130 };
    var boxTime = 0;
    var ticks = 0;
    var frames = 0;
    var rendered = false;
    var framesDropped = 0;
    
    var now, dt = 0, last = performance.now(), step = 1000/60; // 60 FPS
    
    var boxStart = last;
    
    var tick = function() {
        now = performance.now(); dt += (now - last);
        if(dt > step) {
            if(!rendered) { framesDropped++; } // If the last update wasn't rendered, we dropped a frame
            while(dt >= step) { dt -= step; ticks++; update(step,dt,now); }
            rendered = false;
        }
        last = now;
    };
    setInterval(tick,step);
    var frame = function() {
        frames++; frameCount++;
        if(!rendered) { render(dt); rendered = true; } 
        requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame); // Request the next frame

    var update = function(step,dt,now) {
        var tickTime = performance.now();
        if(secondsElapsed < Math.floor(tickTime / 1000)) {
            secondsElapsed = Math.floor(tickTime / 1000);
            framesPerSecond = frameCount;
            frameCount = 0;
            ticksPerSecond = tickCount;
            tickCount = 0;
        }
        tickCount++;
        myBox.x += myBox.speed;
        if(myBox.x == 1100) {
            boxTime = now - boxStart - dt;
            boxStart = now;
            myBox.x = 50;
        }
    };

    var mainCanvas = document.getElementById('mainCanvas');
    var mainContext = mainCanvas.getContext ? mainCanvas.getContext('2d') : null;
    var render = function(dt) {
        mainContext.clearRect(0,0,mainCanvas.width,mainCanvas.height);
        mainContext.fillStyle = 'white';
        mainContext.font = '20px Arial';
        mainContext.fillText('Seconds Elapsed: '+secondsElapsed,50,50);
        mainContext.fillText('FPS: '+framesPerSecond,50,80);
        mainContext.fillText('Tickrate: '+ticksPerSecond,50,100);
        mainContext.fillRect(myBox.x,myBox.y,myBox.width,myBox.height);
        mainContext.fillText('Box Reset Time Deviation: '+Math.floor(35000-boxTime)+'ms',50,220);
        mainContext.fillText('Frames: '+frames,50,250);
        mainContext.fillText('Ticks: '+ticks,50,280);
        mainContext.fillText('Frames Dropped: '+framesDropped,50,310);
    };

    requestAnimationFrame(tick); // start the first frame
    
    return { 
        message: myMessage,
        secondsElapsed: secondsElapsed
    }
});