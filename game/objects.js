'use strict'
Application.Services.factory('Objects', function() {
    var DIR = { up: [0,-1], down: [0,1], left: [-1,0], right: [1,0] };
    
    function Movable(arena) { // Prototype for movable object
        this.speed = this.x = this.y = 0;
        this.direction = 'up';
        this.render = function(context,rt,step) {
            var interpolated = (this.speed/arena.pixels)*(rt/step);
            var drawX = this.x + DIR[this.direction][0]*interpolated;
            var drawY = this.y + DIR[this.direction][1]*interpolated;
            context.fillStyle = 'white';
            context.fillRect(drawX-1+arena.pixels/2,drawY-1+arena.pixels/2,2,2)
        };
        this.update = function() {
            this.x += DIR[this.direction][0] * this.speed/arena.pixels;
            this.y += DIR[this.direction][1] * this.speed/arena.pixels;
            this.delete = this.x < -arena.pixels * this.speed * arena.pixels ||
                this.x > arena.width * arena.pixels + arena.pixels * this.speed * arena.pixels
                || this.y < -arena.pixels * this.speed * arena.pixels ||
                this.y > arena.height * arena.pixels + arena.pixels * this.speed * arena.pixels;
        };
    }
    
    return {
        StreamPixel: function(arena,ticks) {
            var sp = new Movable(arena);
            Math.seedrandom(ticks);
            sp.direction = ['up','down','left','right'][Math.floor(Math.random()*4)];
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
            sp.speed = Math.floor(Math.random()*9 + 3);
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
                tailGrad.addColorStop(0,'rgba(255,255,255,' + sp.speed/12 * 0.3 + ')');
                tailGrad.addColorStop(1,'rgba(255,255,255,0)');
                context.fillStyle = tailGrad;
                context.fillRect(drawX + arena.pixels/2 + 2 - (DIR[sp.direction][0] < 0 ? 4 : 0),
                    drawY + arena.pixels/2 + 2 - (DIR[sp.direction][1] < 0 ? 4 : 0),
                    DIR[sp.direction][0] == 0 ? -4 : DIR[sp.direction][0]*-tail,
                    DIR[sp.direction][1] == 0 ? -4 : DIR[sp.direction][1]*-tail);
                context.fillStyle = 'rgba(255,255,255,' + sp.speed/12 + ')';
                context.fillRect(drawX-1+arena.pixels/2,drawY-1+arena.pixels/2,2,2);
            };
            return sp;
        }
    }
});