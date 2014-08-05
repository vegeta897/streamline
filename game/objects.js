'use strict';
Application.Services.factory('Objects', function() {
    var DIR = { up: {x:0,y:-1}, down: {x:0,y:1}, left: {x:-1,y:0}, right: {x:1,y:0} };
    
    function Movable(arena) { // Prototype for movable object
        this.speed = this.x = this.y = 0;
        this.direction = 'up';
        this.render = function(context,rt,step) {
            var interpolated = (this.speed/arena.pixels)*(rt/step);
            var drawX = this.x + DIR[this.direction].x*interpolated;
            var drawY = this.y + DIR[this.direction].y*interpolated;
            context.fillStyle = 'blue';
            context.fillRect(drawX-1+arena.pixels/2,drawY-1+arena.pixels/2,2,2)
        };
        this.move = function() {
            this.x += DIR[this.direction].x * this.speed/arena.pixels;
            this.y += DIR[this.direction].y * this.speed/arena.pixels;
            this.delete = this.x < -arena.pixels * this.speed * 3 ||
                this.x > arena.width * arena.pixels + arena.pixels * this.speed * 3
                || this.y < -arena.pixels * this.speed * 3 ||
                this.y > arena.height * arena.pixels + arena.pixels * this.speed * 3;
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
        this.update = function(game) {
            var streams = this.getStreams(game.objects.streams);
            if(streams.length > 0) {}
        };
    }
    
    function RedirGate(arena,x,y) { // Prototype for redirect gate
        var g = new Gate(arena,x,y);
        g.direction = 'up'; // New direction for pixels
        g.name = g.direction.toUpperCase() + ' Redirection Gate';
        g.outX = 0; g.outY = -arena.pixels; // Where pixels are output
        g.cost = 100;
        g.update = function(game) {
            game.objects.gateX[g.x] = game.objects.gateX.hasOwnProperty(g.x) ?
                game.objects.gateX[g.x].concat([g]) : [g];
            game.objects.gateY[g.y] = game.objects.gateY.hasOwnProperty(g.y) ?
                game.objects.gateY[g.y].concat([g]) : [g];
            var streams = this.getStreams(game.objects.streams);
            for(var s = 0, sl = streams.length; s < sl; s++) {
                streams[s].x = g.cx + g.outX; streams[s].y = g.cy + g.outY;
                streams[s].direction = g.direction;
            }
        };
        return g;
    }
    
    return {
        StreamPixel: function(arena) {
            var sp = new Movable(arena);
            sp.speed = Math.floor(Math.random()*7 + 3);
            var glowSize = sp.speed * 7; // Size of glowing aura around pixel
            sp.direction = ['up','up','down','down','left','right'][Math.floor(Math.random()*6)];
            switch(sp.direction) {
                case 'up': sp.x = Math.floor(Math.random()*arena.width)*arena.pixels;
                    sp.y = arena.height*arena.pixels + glowSize; break;
                case 'right': sp.x = -glowSize;
                    sp.y = Math.floor(Math.random()*arena.height)*arena.pixels; break;
                case 'down': sp.x = Math.floor(Math.random()*arena.width)*arena.pixels;
                    sp.y = -glowSize; break;
                case 'left': sp.x = arena.width*arena.pixels + glowSize;
                    sp.y = Math.floor(Math.random()*arena.height)*arena.pixels; break;
            }
            sp.worth = sp.speed * 10;
            sp.render = function(context,rt,step) {
                var interpolated = (sp.speed/arena.pixels)*(rt/step);
                var drawX = sp.x + DIR[sp.direction].x*interpolated;
                var drawY = sp.y + DIR[sp.direction].y*interpolated;
                var tail = sp.speed * arena.pixels * 3;
                var tailGrad = context.createLinearGradient(
                    DIR[sp.direction].x == 0 ? 0
                        : drawX + arena.pixels/2 + 2 - (DIR[sp.direction].x < 0 ? 4 : 0),
                    DIR[sp.direction].y == 0 ? 0
                        : drawY + arena.pixels/2 + 2 - (DIR[sp.direction].y < 0 ? 4 : 0),
                    DIR[sp.direction].x == 0 ? 0
                        : (drawX + arena.pixels/2 + 2 - (DIR[sp.direction].x < 0 ? 4 : 0)) +
                        (DIR[sp.direction][0] == 0 ? -4 : DIR[sp.direction].x*-tail),
                    DIR[sp.direction].y == 0 ? 0
                        : (drawY + arena.pixels/2 + 2 - (DIR[sp.direction].y < 0 ? 4 : 0)) +
                        (DIR[sp.direction].y == 0 ? -4 : DIR[sp.direction].y*-tail)
                );
                tailGrad.addColorStop(0,'rgba(255,255,255,' + sp.speed/9 * 0.3 + ')');
                tailGrad.addColorStop(0.2,'rgba(255,255,255,' + sp.speed/9 * 0.15 + ')');
                tailGrad.addColorStop(0.4,'rgba(255,255,255,' + sp.speed/9 * 0.05 + ')');
                tailGrad.addColorStop(1,'rgba(255,255,255,0)');
                context.fillStyle = tailGrad;
                context.fillRect(drawX + arena.pixels/2 + 2 - (DIR[sp.direction].x < 0 ? 4 : 0),
                    drawY + arena.pixels/2 + 2 - (DIR[sp.direction].y < 0 ? 4 : 0),
                    DIR[sp.direction].x == 0 ? -4 : DIR[sp.direction].x*-tail,
                    DIR[sp.direction].y == 0 ? -4 : DIR[sp.direction].y*-tail);
                context.fillStyle = 'rgba(255,255,255,' + sp.speed/9 + ')';
                context.fillRect(drawX-1+arena.pixels/2,drawY-1+arena.pixels/2,2,2);
                var glow = context.createRadialGradient(
                    drawX + arena.pixels/2, drawY + arena.pixels/2, 0,
                    drawX + arena.pixels/2, drawY + arena.pixels/2, glowSize
                );
                glow.addColorStop(0,'rgba(255,255,255,' + (0.04 * (sp.speed/9)) + ')');
                glow.addColorStop(1,'rgba(255,255,255,0)');
                context.fillStyle = glow;
                context.fillRect(drawX + arena.pixels/2 - glowSize, drawY + arena.pixels/2 - glowSize, 
                    glowSize*2, glowSize*2);
            };
            sp.update = function(game) {
                sp.move();
                var gameX = Math.round(sp.x/arena.pixels); var gameY = Math.round(sp.y/arena.pixels);
                var grid = gameX+':'+gameY;
                if(sp.direction == 'up' || sp.direction == 'down') {
                    game.objects.streamX[gameX] = game.objects.streamX.hasOwnProperty(gameX) ?
                        game.objects.streamX[gameX].concat([sp]) : [sp];               
                } else {
                    game.objects.streamY[gameY] = game.objects.streamY.hasOwnProperty(gameY) ?
                        game.objects.streamY[gameY].concat([sp]) : [sp];
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