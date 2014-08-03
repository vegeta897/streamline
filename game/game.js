'use strict'
Application.Services.service('Game', function(Canvas, $timeout) {
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
        if(!rendered) { $timeout(function(){}); Canvas.render(rt,game); rendered = true; } 
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
            /*if(game.objects.streams.length == 0)*/ {game.objects.streams.push(new StreamPixel(null));}
        }
        game.tickCount++;
    };
    
    function StreamPixel(properties) {
        var DIR = { up: [0,-1], down: [0,1], left: [-1,0], right: [1,0] };
        this.direction = ['up','down','left','right'][Math.floor(Math.random()*4)];
        switch(this.direction) {
            case 'up': this.x = Math.floor(Math.random()*game.arena.width)*game.arena.pixels; 
                this.y = game.arena.height*game.arena.pixels; break; 
            case 'right': this.x = 0; 
                this.y = Math.floor(Math.random()*game.arena.height)*game.arena.pixels; break;
            case 'down': this.x = Math.floor(Math.random()*game.arena.width)*game.arena.pixels; 
                this.y = 0; break; 
            case 'left': this.x = game.arena.width*game.arena.pixels;
                this.y = Math.floor(Math.random()*game.arena.height)*game.arena.pixels; break;
        }
        this.speed = Math.floor(Math.random()*9 + 3);
        this.update = function() {
            this.x += DIR[this.direction][0] * this.speed/game.arena.pixels;
            this.y += DIR[this.direction][1] * this.speed/game.arena.pixels;
            this.delete = this.x < -game.arena.pixels * this.speed * game.arena.pixels || 
                this.x > game.arena.width * game.arena.pixels + game.arena.pixels * this.speed * game.arena.pixels
                || this.y < -game.arena.pixels * this.speed * game.arena.pixels || 
                this.y > game.arena.height * game.arena.pixels + game.arena.pixels * this.speed * game.arena.pixels;
        };
        this.render = function(context,rt) {
            var interpolated = (this.speed/game.arena.pixels)*(rt/step);
            var drawX = this.x + DIR[this.direction][0]*interpolated;
            var drawY = this.y + DIR[this.direction][1]*interpolated;
            var tail = this.speed * game.arena.pixels * 3;
            var tailGrad = context.createLinearGradient(
                DIR[this.direction][0] == 0 ? 0 
                    : drawX + game.arena.pixels/2 + 2 - (DIR[this.direction][0] < 0 ? 4 : 0),
                DIR[this.direction][1] == 0 ? 0
                    : drawY + game.arena.pixels/2 + 2 - (DIR[this.direction][1] < 0 ? 4 : 0),
                DIR[this.direction][0] == 0 ? 0
                    : (drawX + game.arena.pixels/2 + 2 - (DIR[this.direction][0] < 0 ? 4 : 0)) +
                        (DIR[this.direction][0] == 0 ? -4 : DIR[this.direction][0]*-tail),
                DIR[this.direction][1] == 0 ? 0
                    : (drawY + game.arena.pixels/2 + 2 - (DIR[this.direction][1] < 0 ? 4 : 0)) +
                        (DIR[this.direction][1] == 0 ? -4 : DIR[this.direction][1]*-tail)
            );
            tailGrad.addColorStop(0,'rgba(255,255,255,' + this.speed/12 * 0.3 + ')');
            tailGrad.addColorStop(1,'rgba(255,255,255,0)');
            context.fillStyle = tailGrad;
                context.fillRect(drawX + game.arena.pixels/2 + 2 - (DIR[this.direction][0] < 0 ? 4 : 0),
                drawY + game.arena.pixels/2 + 2 - (DIR[this.direction][1] < 0 ? 4 : 0),
                DIR[this.direction][0] == 0 ? -4 : DIR[this.direction][0]*-tail,
                DIR[this.direction][1] == 0 ? -4 : DIR[this.direction][1]*-tail);
            context.fillStyle = 'rgba(255,255,255,' + this.speed/12 + ')';
            context.fillRect(drawX-1+game.arena.pixels/2,drawY-1+game.arena.pixels/2,2,2);
        };
        this.worth = 100;
        if(!properties) { return; }
        for(var key in properties) { if(!properties.hasOwnProperty(key)){return;}
            this[key] = properties[key]; }
    }
    
    return { 
        game: game
    }
});