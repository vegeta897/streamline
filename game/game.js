'use strict'
Application.Services.service('Game', function(Canvas) {
    console.log('game service initialized',performance.now());

    var game = { arena: { width: 200, height: 100, pixels: 6 },  objects: { streams: [] } };
    
    var myMessage = { text:'Unchanged' };
    game.secondsElapsed = game.boxTime = game.ticks = game.frames = game.framesDropped = game.frameCount = 
        game.framesPerSecond = game.tickCount = game.ticksPerSecond = 0;
    game.myBox = { width: 20, height: 50, speed: 0.5, x: 50, y: 130 };
    var rendered = false;
    
    var now, dt = 0, last = performance.now(), step = 1000/60; // 60 FPS
    
    var boxStart = last;
    
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
        game.frames++; game.frameCount++;
        if(!rendered) { Canvas.render(dt,game); rendered = true; } 
        requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame); // Request the next frame

    var update = function(step,dt,now) {
        var tickTime = performance.now();
        for(var sp = 0, spl = game.objects.streams.length; sp < spl; sp++) { 
            game.objects.streams[sp].frame(); 
            if(game.objects.streams[sp].delete) { game.objects.streams.splice(sp,1); sp--; spl--; }
        }
        if(game.secondsElapsed < Math.floor(tickTime / 1000)) {
            game.secondsElapsed = Math.floor(tickTime / 1000);
            game.framesPerSecond = game.frameCount;
            game.frameCount = 0;
            game.ticksPerSecond = game.tickCount;
            game.tickCount = 0;
            game.objects.streams.push(new StreamPixel(null));
        }
        game.tickCount++;
        game.myBox.x += game.myBox.speed;
        if(game.myBox.x == 1100) {
            game.boxTime = now - boxStart - dt;
            boxStart = now;
            game.myBox.x = 50;
        }
    };
    
    function StreamPixel(properties) {
        this.direction = Math.floor(Math.random()*4);
        this.x = this.direction % 2 == 0 ? Math.floor(Math.random()*game.arena.width)*game.arena.pixels 
            : this.direction == 1 ? 0 : game.arena.width*game.arena.pixels;
        this.y = this.direction % 2 > 0 ? Math.floor(Math.random()*game.arena.height)*game.arena.pixels
            : this.direction == 0 ? game.arena.height*game.arena.pixels : 0;
        this.speed = 10;
        this.frame = function() {
            switch(this.direction) {
                case 0: this.y -= this.speed/game.arena.pixels; break;
                case 1: this.x += this.speed/game.arena.pixels; break;
                case 2: this.y += this.speed/game.arena.pixels; break;
                case 3: this.x -= this.speed/game.arena.pixels; break;
            }
            this.delete = this.x < -game.arena.pixels*this.speed || 
                this.x > game.arena.width * game.arena.pixels + game.arena.pixels*this.speed
                || this.y < -game.arena.pixels*this.speed || 
                this.y > game.arena.height * game.arena.pixels + game.arena.pixels*this.speed || !this.y || !this.x;
        };
        
        this.worth = 100;
        if(!properties) { return; }
        for(var key in properties) { if(!properties.hasOwnProperty(key)){return;}
            this[key] = properties[key]; }
    }

    function Person(name) {
        this.name = name;
    }

// the function person has a prototype property
// we can add properties to this function prototype
    Person.prototype.kind = 'person';

// when we create a new object using new
    var zack = new Person('Zack');
    console.log(zack);
    
    
    return { 
        message: myMessage,
        game: game
    }
});