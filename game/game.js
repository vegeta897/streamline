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
    
    var now, dt = 0, last = performance.now(), step = 1000/60;
    
    var appStart = last;
    var boxStart = last;
    
    var frame = function() {
        now = performance.now();
        dt += (now - last);
        if(dt > step) {
            while(dt >= step) {
                dt -= step;
                update(step,dt);
                ticks++;
                if(ticks == 1200) { console.log(performance.now()-appStart); }
            }
            render(dt);
            frames++;
            frameCount++;
        }
        last = now;
        requestAnimationFrame(frame); // Request the next frame
    };

    var update = function(step,dt) {
        var tickTime = performance.now();
        if(secondsElapsed < Math.floor(tickTime / 1000)) {
            console.log(tickTime,secondsElapsed,'seconds elapsed');
            secondsElapsed = Math.floor(tickTime / 1000);
            framesPerSecond = frameCount;
            frameCount = 0;
            ticksPerSecond = tickCount;
            tickCount = 0;
        }
        tickCount++;
        myBox.x += myBox.speed;
        if(myBox.x == 1100) {
            var finishTime = performance.now();
            boxTime = finishTime - boxStart - dt;
            boxStart = finishTime;
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
        mainContext.fillText('Box Reset Time: '+boxTime,50,220);
        mainContext.fillText('Frames: '+frames,50,250);
        mainContext.fillText('Ticks: '+ticks,50,280);
        mainContext.fillText('Frames Dropped: '+(ticks-frames),50,310);
    };

    requestAnimationFrame(frame); // start the first frame
    
    return { 
        message: myMessage,
        secondsElapsed: secondsElapsed
    }
});