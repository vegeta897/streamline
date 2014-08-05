'use strict';
Application.Services.factory('Objects', function(Utility) {
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
    
    function Gate(game,x,y) { // Prototype for gate
        this.gameX = x; this.gameY = y; this.name = 'Generic Gate';
        this.x = x * game.arena.pixels; this.y = y * game.arena.pixels;
        this.cost = 50;
        game.objects.gates[this.gameX+':'+this.gameY] = this;
        game.objects.gateX[this.gameX] = game.objects.gateX.hasOwnProperty(this.gameX) ?
            game.objects.gateX[this.gameX].concat([this]) : [this];
        game.objects.gateY[this.gameY] = game.objects.gateY.hasOwnProperty(this.gameY) ?
            game.objects.gateY[this.gameY].concat([this]) : [this];
        this.render = function(context) {
            context.fillStyle = 'red';
            context.fillRect(this.x, this.y, game.arena.pixels, game.arena.pixels);
        };
        this.getStreams = function(stream) {
            var streams = [];
            for(var s = 0, sl = stream.length; s < sl; s++) {
                var thisSP = stream[s];
                if(this.gameX == Math.round(thisSP.x/game.arena.pixels) 
                    && this.gameY == Math.round(thisSP.y/game.arena.pixels)) {
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
    
    function RedirGate(game,x,y) { // Prototype for redirect gate
        var g = new Gate(game,x,y);
        g.direction = 'up'; // New direction for pixels
        g.init = function() { g.name = Utility.capitalize(g.direction) + ' Redirection Gate'; };
        g.outX = 0; g.outY = -game.arena.pixels; // Where pixels are output
        g.cost = 100;
        g.update = function() {
//            var streams = this.getStreams(game.objects.streams);
//            for(var s = 0, sl = streams.length; s < sl; s++) {
//                streams[s].x = g.x + g.outX; streams[s].y = g.y + g.outY;
//                streams[s].direction = g.direction;
//            }
        };
        g.render = function(context) {
            context.fillStyle = '#202048';
            context.fillRect(g.x, g.y, game.arena.pixels, game.arena.pixels);
            context.clearRect(g.x + g.outX*2 + game.arena.pixels/2 - 2 - g.outX,
                g.y + g.outY*2 + game.arena.pixels/2 - 2 - g.outY, 4, 4);
            context.fillStyle = 'white';
            context.fillRect(g.x + g.outX*2 + game.arena.pixels/2 - 1 - g.outX, 
                g.y + g.outY*2 + game.arena.pixels/2 - 1 - g.outY, 2, 2);
        };
        return g;
    }
    
    return {
        StreamPixel: function(arena) {
            var sp = new Movable(arena);
            var minSpeed = 3, maxSpeed = 9;
            sp.speed = Utility.randomInt(minSpeed,maxSpeed);
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
                tailGrad.addColorStop(0,'rgba(255,255,255,' + sp.speed/maxSpeed * 0.3 + ')');
                tailGrad.addColorStop(0.2,'rgba(255,255,255,' + sp.speed/maxSpeed * 0.15 + ')');
                tailGrad.addColorStop(0.4,'rgba(255,255,255,' + sp.speed/maxSpeed * 0.05 + ')');
                tailGrad.addColorStop(1,'rgba(255,255,255,0)');
                context.fillStyle = tailGrad;
                context.fillRect(drawX + arena.pixels/2 + 2 - (DIR[sp.direction].x < 0 ? 4 : 0),
                    drawY + arena.pixels/2 + 2 - (DIR[sp.direction].y < 0 ? 4 : 0),
                    DIR[sp.direction].x == 0 ? -4 : DIR[sp.direction].x*-tail,
                    DIR[sp.direction].y == 0 ? -4 : DIR[sp.direction].y*-tail);
                context.fillStyle = 'rgba(255,255,255,' + sp.speed/maxSpeed + ')';
                context.fillRect(drawX-1+arena.pixels/2,drawY-1+arena.pixels/2,2,2);
                var glow = context.createRadialGradient(
                    drawX + arena.pixels/2, drawY + arena.pixels/2, 0,
                    drawX + arena.pixels/2, drawY + arena.pixels/2, glowSize
                );
                glow.addColorStop(0,'rgba(255,255,255,' + (0.04 * (sp.speed/maxSpeed)) + ')');
                glow.addColorStop(1,'rgba(255,255,255,0)');
                context.fillStyle = glow;
                context.fillRect(drawX + arena.pixels/2 - glowSize, drawY + arena.pixels/2 - glowSize, 
                    glowSize*2, glowSize*2);
            };
            sp.update = function(game) {
                sp.move();
                var gameX = Math.round(sp.x/arena.pixels); var gameY = Math.round(sp.y/arena.pixels);
                var grid = gameX+':'+gameY; var gates, reach, axis;
                if(sp.direction == 'up' || sp.direction == 'down') {
                    gates = game.objects.gateX[gameX] || []; axis = 'y';
                    reach = sp.direction == 'up' ? sp.y - sp.speed/arena.pixels
                        : sp.y + sp.speed/arena.pixels;
                    game.objects.streamX[gameX] = game.objects.streamX.hasOwnProperty(gameX) ?
                        game.objects.streamX[gameX].concat([sp]) : [sp];               
                } else {
                    gates = game.objects.gateY[gameY] || []; axis = 'x';
                    reach = sp.direction == 'left' ? sp.x - sp.speed/arena.pixels
                        : sp.x + sp.speed/arena.pixels;
                    game.objects.streamY[gameY] = game.objects.streamY.hasOwnProperty(gameY) ?
                        game.objects.streamY[gameY].concat([sp]) : [sp];
                }
                if(sp.speed > 60) { return; } // Go through gates if going too fast
                for(var g = 0, gl = gates.length; g < gl; g++) {
                    if(Utility.isBetweenSoftUpper(gates[g][axis],sp[axis],reach)) {
                        /** collision! */
                        sp.x = gates[g].x + gates[g].outX; sp.y = gates[g].y + gates[g].outY;
                        sp.direction = gates[g].direction;
                        sp.speed += 1;
                    }
                }
            };
            return sp;
        },
        RedirGateLeft: function(game,x,y) {
            var g = RedirGate(game,x,y);
            g.direction = 'left'; g.outX = -1; g.outY = 0; g.init();
            return g;
        },
        RedirGateDown: function(game,x,y) {
            var g = RedirGate(game,x,y);
            g.direction = 'down'; g.outX = 0; g.outY = 1; g.init();
            return g;
        },
        RedirGateUp: function(game,x,y) {
            var g = RedirGate(game,x,y);
            g.direction = 'up'; g.outX = 0; g.outY = -1; g.init();
            return g;
        },
        RedirGateRight: function(game,x,y) {
            var g = RedirGate(game,x,y);
            g.direction = 'right'; g.outX = 1; g.outY = 0; g.init();
            return g;
        }
    }
});