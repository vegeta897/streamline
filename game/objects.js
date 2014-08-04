'use strict';
Application.Services.factory('Objects', function() {
    var DIR = { up: [0,-1], down: [0,1], left: [-1,0], right: [1,0] };
    
    function Movable(arena) { // Prototype for movable object
        this.speed = this.x = this.y = 0;
        this.direction = 'up';
        this.render = function(context,rt,step) {
            var interpolated = (this.speed/arena.pixels)*(rt/step);
            var drawX = this.x + DIR[this.direction][0]*interpolated;
            var drawY = this.y + DIR[this.direction][1]*interpolated;
            context.fillStyle = 'blue';
            context.fillRect(drawX-1+arena.pixels/2,drawY-1+arena.pixels/2,2,2)
        };
        this.move = function() {
            this.x += DIR[this.direction][0] * this.speed/arena.pixels;
            this.y += DIR[this.direction][1] * this.speed/arena.pixels;
            this.delete = this.x < -arena.pixels * this.speed * arena.pixels ||
                this.x > arena.width * arena.pixels + arena.pixels * this.speed * arena.pixels
                || this.y < -arena.pixels * this.speed * arena.pixels ||
                this.y > arena.height * arena.pixels + arena.pixels * this.speed * arena.pixels;
        };
        this.update = function() {
            this.move();
        };
    }
    
    function Gate(arena,x,y) { // Prototype for gate
        this.x = x; this.y = y; this.name = 'Generic Gate';
        this.cx = x * arena.pixels; this.cy = y * arena.pixels;
        this.cost = 50;
        this.render = function(context) {
            context.fillStyle = 'red';
            context.fillRect(this.cx, this.cy, arena.pixels, arena.pixels);
        };
        this.getStreams = function(stream) {
            var streams = [];
            for(var s = 0, sl = stream.length; s < sl; s++) {
                var thisSP = stream[s];
                if(this.x == Math.round(thisSP.x/arena.pixels) && this.y == Math.round(thisSP.y/arena.pixels)) {
                    streams.push(thisSP);
                }
            }
            return streams;
        };
        this.update = function(stream) {
            var streams = this.getStreams(stream);
            if(streams.length > 0) {}
        };
    }
    
    function RedirGate(arena,x,y) { // Prototype for redirect gate
        var g = new Gate(arena,x,y);
        g.direction = 'up'; // New direction for pixels
        g.name = g.direction.toUpperCase() + ' Redirection Gate';
        g.outX = 0; g.outY = -arena.pixels; // Where pixels are output
        g.cost = 100;
        g.update = function(stream) {
            var streams = this.getStreams(stream);
            for(var s = 0, sl = streams.length; s < sl; s++) {
                streams[s].x = g.cx + g.outX; streams[s].y = g.cy + g.outY;
                streams[s].direction = g.direction;
            }
        };
        return g;
    }
    
    return {
        StreamPixel: function(arena,ticks) {
            var sp = new Movable(arena);
            Math.seedrandom(ticks);
            sp.direction = ['up','up','down','down','left','right'][Math.floor(Math.random()*6)];
            switch(sp.direction) {
                case 'up': sp.x = Math.floor(Math.random()*arena.width)*arena.pixels;
                    sp.y = arena.height*arena.pixels; break;
                case 'right': sp.x = 0;
                    sp.y = Math.floor(Math.random()*arena.height)*arena.pixels; break;
                case 'down': sp.x = Math.floor(Math.random()*arena.width)*arena.pixels;
                    sp.y = 0; break;
                case 'left': sp.x = arena.width*arena.pixels;
                    sp.y = Math.floor(Math.random()*arena.height)*arena.pixels; break;
            }
            sp.speed = Math.floor(Math.random()*7 + 3);
            sp.worth = sp.speed * 10;
            sp.render = function(context,rt,step) {
                var interpolated = (sp.speed/arena.pixels)*(rt/step);
                var drawX = sp.x + DIR[sp.direction][0]*interpolated;
                var drawY = sp.y + DIR[sp.direction][1]*interpolated;
                var tail = sp.speed * arena.pixels * 3;
                var tailGrad = context.createLinearGradient(
                    DIR[sp.direction][0] == 0 ? 0
                        : drawX + arena.pixels/2 + 2 - (DIR[sp.direction][0] < 0 ? 4 : 0),
                    DIR[sp.direction][1] == 0 ? 0
                        : drawY + arena.pixels/2 + 2 - (DIR[sp.direction][1] < 0 ? 4 : 0),
                    DIR[sp.direction][0] == 0 ? 0
                        : (drawX + arena.pixels/2 + 2 - (DIR[sp.direction][0] < 0 ? 4 : 0)) +
                        (DIR[sp.direction][0] == 0 ? -4 : DIR[sp.direction][0]*-tail),
                    DIR[sp.direction][1] == 0 ? 0
                        : (drawY + arena.pixels/2 + 2 - (DIR[sp.direction][1] < 0 ? 4 : 0)) +
                        (DIR[sp.direction][1] == 0 ? -4 : DIR[sp.direction][1]*-tail)
                );
                tailGrad.addColorStop(0,'rgba(255,255,255,' + sp.speed/10 * 0.3 + ')');
                tailGrad.addColorStop(0.2,'rgba(255,255,255,' + sp.speed/10 * 0.15 + ')');
                tailGrad.addColorStop(0.4,'rgba(255,255,255,' + sp.speed/10 * 0.05 + ')');
                tailGrad.addColorStop(1,'rgba(255,255,255,0)');
                context.fillStyle = tailGrad;
                context.fillRect(drawX + arena.pixels/2 + 2 - (DIR[sp.direction][0] < 0 ? 4 : 0),
                    drawY + arena.pixels/2 + 2 - (DIR[sp.direction][1] < 0 ? 4 : 0),
                    DIR[sp.direction][0] == 0 ? -4 : DIR[sp.direction][0]*-tail,
                    DIR[sp.direction][1] == 0 ? -4 : DIR[sp.direction][1]*-tail);
                context.fillStyle = 'rgba(255,255,255,' + sp.speed/10 + ')';
                context.fillRect(drawX-1+arena.pixels/2,drawY-1+arena.pixels/2,2,2);
            };
            sp.update = function(game) {
                sp.move();
                var gameX = Math.round(sp.x/arena.pixels); var gameY = Math.round(sp.y/arena.pixels);
                var grid = gameX+':'+gameY;
                if(sp.direction == 'left' || sp.direction == 'right') {
                    game.objects.streamY[gameY] = game.objects.streamY.hasOwnProperty(gameY) ?
                        game.objects.streamY[gameY].concat([sp]) : [sp];                       
                } else {
                    game.objects.streamX[gameX] = game.objects.streamX.hasOwnProperty(gameX) ?
                        game.objects.streamX[gameX].concat([sp]) : [sp];
                }
            };
            return sp;
        },
        RedirGateLeft: function(arena,x,y) {
            var g = RedirGate(arena,x,y);
            g.direction = 'left'; g.outX = -arena.pixels; g.outY = 0;
            return g;
        },
        RedirGateDown: function(arena,x,y) {
            var g = RedirGate(arena,x,y);
            g.direction = 'down'; g.outX = 0; g.outY = +arena.pixels;
            return g;
        },
        RedirGateUp: function(arena,x,y) {
            var g = RedirGate(arena,x,y);
            g.direction = 'up'; g.outX = 0; g.outY = -arena.pixels;
            return g;
        },
        RedirGateRight: function(arena,x,y) {
            var g = RedirGate(arena,x,y);
            g.direction = 'right'; g.outX = +arena.pixels; g.outY = 0;
            return g;
        }
    }
});