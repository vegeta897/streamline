'use strict';
Application.Services.service('Objects', function(Utility, Canvas) {
    var DIR = { up: {x:0,y:-1}, down: {x:0,y:1}, left: {x:-1,y:0}, right: {x:1,y:0} };
    var FLIP = { up: 'down', down: 'up', left: 'right', right: 'left' };
    
    function Child(parent,x,y,pixels) { 
        this.gameX = x; this.gameY = y; this.x = x * pixels; this.y = y * pixels;
        this.update = function(){}; this.render = function(){}; this.parent = parent; 
        // TODO: Remove self from gates gateX and gateY if parent has deleteMe property
    }
    
    function Movable(arena) { // Prototype for movable object
        this.speed = this.x = this.y = 0;
        this.direction = 'up';
        this.render = function(context,rt,step) {
            context.fillStyle = 'blue';
            context.fillRect(this.x-1+arena.pixels/2,this.y-1+arena.pixels/2,2,2)
        };
        this.move = function() {
            this.x += DIR[this.direction].x * this.speed/arena.pixels;
            this.y += DIR[this.direction].y * this.speed/arena.pixels;
            this.delete = this.x < -arena.pixels * this.speed * 3 ||
                this.x > arena.width * arena.pixels + arena.pixels * this.speed * 3
                || this.y < -arena.pixels * this.speed * 3 ||
                this.y > arena.height * arena.pixels + arena.pixels * this.speed * 3;
        };
        this.update = function() { this.move(); };
    }
    
    var COSTS = { RedirGateLeft: 250, RedirGateRight: 250, RedirGateUp: 250, RedirGateDown: 250,
        ReceiveGateUp: 5000, ReceiveGateLeft: 5000, ReceiveGateDown: 5000, ReceiveGateRight: 5000 };
    
    function Gate(game,x,y) { // Prototype for gate
        this.gameX = x; this.gameY = y; this.name = 'Generic Gate';
        this.x = x * game.arena.pixels; this.y = y * game.arena.pixels;
        this.recent = []; this.recharge = 0;
        game.objects.gates[this.gameX+':'+this.gameY] = this;
        game.objects.gateX[this.gameX] = game.objects.gateX.hasOwnProperty(this.gameX) ?
            game.objects.gateX[this.gameX].concat([this]) : [this];
        game.objects.gateY[this.gameY] = game.objects.gateY.hasOwnProperty(this.gameY) ? 
            game.objects.gateY[this.gameY].concat([this]) : [this];
        this.render = function(context) {
            context.fillStyle = 'red';
            context.fillRect(this.x, this.y, game.arena.pixels, game.arena.pixels);
        };
        this.update = function(game) {
            this.recharge -= this.recharge == 0 ? 0 : 1;
            for(var r = 0, rl = this.recent.length; r < rl; r++) {
                if(game.ticks > this.recent[r] + 240) {
                    this.recent.splice(r,1); r--; rl--;
                }
            }
        };
        this.deleteGate = function(game) {
            this.deleteMe = true;
            var grid = this.gameX+':'+this.gameY;
            delete game.objects.gates[grid];
            for(var xi = 0, xl = game.objects.gateX[grid].length; xi < xl; xi++) {
                if(game.objects.gateX[grid][xi].gameX == this.gameX 
                    && game.objects.gateX[grid][xi].gameY == this.gameY) {
                    game.objects.gateX[grid].splice(xi,1);
                }
            }
            for(var yi = 0, yl = game.objects.gateY[grid].length; yi < yl; yi++) {
                if(game.objects.gateY[grid][yi].gameX == this.gameX
                    && game.objects.gateY[grid][yi].gameY == this.gameY) {
                    game.objects.gateY[grid].splice(yi,1);
                }
            }
        };
    }
    
    function RedirGate(game,x,y) { // Prototype for redirect gate
        var g = new Gate(game,x,y);
        g.init = function() { 
            g.name = Utility.capitalize(g.direction) + ' Redirection Gate';
            g.outX = DIR[g.direction].x; g.outY = DIR[g.direction].y;
        };
        g.render = function(context) {
            context.fillStyle = 'rgb(' + Math.min(255,(32 + g.recent.length*6)) + ',32,72)';
            context.fillRect(g.x, g.y, game.arena.pixels, game.arena.pixels);
            context.clearRect(g.x + g.outX*2 + game.arena.pixels/2 - 2 - g.outX,
                g.y + g.outY*2 + game.arena.pixels/2 - 2 - g.outY, 4, 4);
            context.fillStyle = 'rgba(255,255,255,'+ (1 - g.recharge/20) +')';
            var rect = Canvas.getLineRectangle({x:g.x+g.outX,y:g.y+g.outY},{x:g.x+g.outX*2,y:g.y+g.outY*2},1);
            context.fillRect(rect.x+game.arena.pixels/2,rect.y+game.arena.pixels/2,rect.width,rect.height);
        };
        return g;
    }

    function ReceiverGate(game,x,y) {
        var g = new Gate(game,x,y);g.name = 'Receiver Gate';
        g.pixelValue = 0.5;
        g.init = function() { 
            g.name = Utility.capitalize(g.direction) + ' Receiver Gate';
            for(var xi = -Math.abs(DIR[g.direction].y); xi < 1 + Math.abs(DIR[g.direction].y); xi++) {
                for(var yi = -Math.abs(DIR[g.direction].x); yi < 1 + Math.abs(DIR[g.direction].x); yi++) {
                    if(!(xi == 0 && yi == 0)) {
                        var child = new Child(g,+g.gameX+xi,+g.gameY+yi,game.arena.pixels);
                        game.objects.gates[(+g.gameX+xi)+':'+(+g.gameY+yi)] = child;
                        game.objects.gateX[+g.gameX+xi] = game.objects.gateX.hasOwnProperty(+g.gameX+xi) ?
                            game.objects.gateX[+g.gameX+xi].concat([child]) : [child];
                        game.objects.gateY[+g.gameY+yi] = game.objects.gateY.hasOwnProperty(+g.gameY+yi) ?
                            game.objects.gateY[+g.gameY+yi].concat([child]) : [child];
                    }
                }
            }
        };
        var pix = game.arena.pixels;
        g.render = function(context) {
            context.fillStyle = 'rgb(' + Math.min(255,(32 + g.recent.length*6)) + ',32,72)';
            if(g.direction == 'left' || g.direction == 'right') {
                context.fillRect(g.x, g.y - pix, pix, pix * 3);
                context.fillStyle = 'rgba(255,255,255,'+ (1 - g.recharge/20) +')';
                context.fillRect(g.x + pix/2 + DIR[g.direction].x * 1.5 - 1.5, g.y + 1 - pix, 3, pix * 3 - 2);
                context.clearRect(g.x + pix/2 + DIR[g.direction].x * 2 - 1, g.y + 2 - pix, 2, pix * 3 - 4);
            } else {
                context.fillRect(g.x - pix, g.y, pix * 3, pix);
                context.fillStyle = 'rgba(255,255,255,'+ (1 - g.recharge/20) +')';
                context.fillRect(g.x + 1 - pix, g.y + pix/2 + DIR[g.direction].y * 1.5 - 1.5, pix * 3 - 2, 3);
                context.clearRect(g.x + 2 - pix, g.y + pix/2 + DIR[g.direction].y * 2 - 1, pix * 3 - 4, 2);
            }
        };
        return g;
    }
    
    return {
        StreamPixel: function(arena,tick) {
            var sp = new Movable(arena); sp.id = tick;
            var minSpeed = 3, maxSpeed = 9, glowMin = 8;
            sp.speed = Utility.randomInt(minSpeed,maxSpeed);
            sp.direction = ['up','up','down','down','left','right'][Math.floor(Math.random()*6)];
            switch(sp.direction) {
                case 'up': sp.x = Math.floor(Math.random()*arena.width)*arena.pixels;
                    sp.y = arena.height*arena.pixels + sp.speed * glowMin + sp.speed; break;
                case 'right': sp.x = -sp.speed * glowMin + sp.speed;
                    sp.y = Math.floor(Math.random()*arena.height)*arena.pixels; break;
                case 'down': sp.x = Math.floor(Math.random()*arena.width)*arena.pixels;
                    sp.y = -sp.speed * glowMin + sp.speed; break;
                case 'left': sp.x = arena.width*arena.pixels + sp.speed * glowMin + sp.speed;
                    sp.y = Math.floor(Math.random()*arena.height)*arena.pixels; break;
            }
            //sp.direction = 'down'; sp.x = 600; sp.y = 0;
            sp.gates = [];
            var tailLength = function() { return sp.speed * 60 / 4; };
            sp.update = function(game) {
                sp.move();
                sp.gameX = Math.round(sp.x/arena.pixels); sp.gameY = Math.round(sp.y/arena.pixels);
                var lineGates, reach, axis;
                if(sp.direction == 'up' || sp.direction == 'down') {
                    lineGates = game.objects.gateX[sp.gameX] || []; axis = 'y';
                    reach = sp.direction == 'up' ? sp.y - sp.speed/arena.pixels
                        : sp.y + sp.speed/arena.pixels;
                    game.objects.streamX[sp.gameX] = game.objects.streamX.hasOwnProperty(sp.gameX) ?
                        game.objects.streamX[sp.gameX].concat([sp]) : [sp];
                } else {
                    lineGates = game.objects.gateY[sp.gameY] || []; axis = 'x';
                    reach = sp.direction == 'left' ? sp.x - sp.speed/arena.pixels
                        : sp.x + sp.speed/arena.pixels;
                    game.objects.streamY[sp.gameY] = game.objects.streamY.hasOwnProperty(sp.gameY) ?
                        game.objects.streamY[sp.gameY].concat([sp]) : [sp];
                }
                var order = DIR[sp.direction].x + DIR[sp.direction].y < 0;
                lineGates = Utility.sortArrayByProperty(lineGates,axis=='x'?'gameY':'gameX',order);
                var newPos = {}; // Store new position temporarily, so we don't skip gates
                // Check for gate collisions
                for(var lg = 0, lgl = sp.speed > 60 ? 0 : lineGates.length; lg < lgl; lg++) {
                    if(Utility.isBetweenSoftUpper(lineGates[lg][axis],sp[axis],reach)) {
                        sp.gates.push({ x: lineGates[lg].x, y: lineGates[lg].y, lastDir: sp.direction,
                            speed: sp.speed, tick: game.ticks });
                        if(lineGates[lg].hasOwnProperty('outX')) {
                            newPos.x = lineGates[lg].x + lineGates[lg].outX;
                            newPos.y = lineGates[lg].y + lineGates[lg].outY;
                            lineGates[lg].recent.push(game.ticks); lineGates[lg].recharge = 20;
                            sp.direction = lineGates[lg].direction; sp.speed *= 1.07; // ~35 bounces for speed 6
                        }
                        if(lineGates[lg].hasOwnProperty('pixelValue') || lineGates[lg].parent) {
                            var theGate = lineGates[lg].parent || lineGates[lg];
                            if(!theGate.direction || FLIP[theGate.direction] == sp.direction) {
                                theGate.recharge = 20;
                                game.score(sp.speed*10*theGate.pixelValue);
                                game.bits(sp.speed*10*theGate.pixelValue); sp.speed = 0;
                            }
                        }
                    }
                }
                if(newPos.x) { sp.x = newPos.x; sp.y = newPos.y; } // Move pixel to final position
                if(sp.gates.length > 0) { // If there is at least one gate in tail...
                    sp.gates[sp.gates.length-1].dist = // Update the latest gate's distance
                        Math.abs((sp.x - sp.gates[sp.gates.length-1].x) + (sp.y - sp.gates[sp.gates.length-1].y)) }
                for(var g = sp.gates.length - 1; g >= 0; g--) { // Trim gate list based on age
                    if(game.ticks > sp.gates[g].tick + game.fps * 1.5) { sp.gates.splice(g,1); }
                }
                if(!sp.gates.length && sp.speed == 0) { sp.delete = true; }
            };
            sp.render = function(context,rt,step,tick) {
                // Render tail
                for(var ts = sp.gates.length; ts >= 0; ts--) {
                    var start, end, ticksRemain, gradStart, gradEnd, portion, thisSpeed = sp.speed;
                    if(ts == sp.gates.length) { // From the pixel
                        start = gradStart = { x: sp.x, y: sp.y };
                    } else { // From a gate
                        ticksRemain = 90-(tick-sp.gates[ts].tick);
                        portion = ticksRemain/90;
                        start = { x: sp.gates[ts].x, y: sp.gates[ts].y };
                        thisSpeed = sp.gates[ts].speed;
                        gradStart = { 
                            x: start.x + DIR[sp.gates[ts].lastDir].x*(1-portion)*thisSpeed*15,
                            y: start.y + DIR[sp.gates[ts].lastDir].y*(1-portion)*thisSpeed*15 };
                    }
                    if(sp.gates.length == 0) { // No gates in tail?
                        end = { x: sp.x - DIR[sp.direction].x*tailLength(),
                            y: sp.y - DIR[sp.direction].y*tailLength() };
                        gradEnd = end;
                    } else if(ts < 1) { // Last gate
                        ticksRemain = 90-(tick-sp.gates[ts].tick);
                        portion = ticksRemain/90;
                        var tailRemain = portion * sp.gates[ts].speed * 15;
                        end = { x: start.x - DIR[sp.gates[ts].lastDir].x*tailRemain,
                            y: start.y - DIR[sp.gates[ts].lastDir].y*tailRemain };
                        gradEnd = end;
                    } else { // Connect to next gate
                        end = { x: sp.gates[ts-1].x, y: sp.gates[ts-1].y };
                        thisSpeed = ts == sp.gates.length ? sp.speed: sp.gates[ts].speed;
                        var thisDir = ts == sp.gates.length ? sp.direction : sp.gates[ts].lastDir;
                        gradEnd = { x: gradStart.x - DIR[thisDir].x*thisSpeed*15, 
                            y: gradStart.y - DIR[thisDir].y*thisSpeed*15 };
                    }
                    var tailGrad = context.createLinearGradient(gradStart.x,gradStart.y,gradEnd.x,gradEnd.y);
                    tailGrad.addColorStop(0,'rgba(255,255,255,' + Math.min(0.8,thisSpeed/maxSpeed * 0.2) + ')');
                    tailGrad.addColorStop(0.2,'rgba(255,255,255,' + Math.min(0.4,thisSpeed/maxSpeed * 0.1) + ')');
                    tailGrad.addColorStop(0.4,'rgba(255,255,255,' + Math.min(0.2,thisSpeed/maxSpeed * 0.05) + ')');
                    tailGrad.addColorStop(1,'rgba(255,255,255,0)');
                    context.fillStyle = tailGrad;
                    var tailRect = Canvas.getLineRectangle(start,end,1.5);
                    context.fillRect(tailRect.x + arena.pixels/2, tailRect.y + arena.pixels/2,
                        tailRect.width, tailRect.height);
                }
                // Render pixel
                context.fillStyle = 'rgba(255,255,255,' + sp.speed/maxSpeed + ')';
                context.fillRect(sp.x-1+arena.pixels/2,sp.y-1+arena.pixels/2,2,2);
                // Render glowing aura
                var glowSize = glowMin + sp.speed;
                var glow = context.createRadialGradient(
                    sp.x + arena.pixels/2, sp.y + arena.pixels/2, 0,
                    sp.x + arena.pixels/2, sp.y + arena.pixels/2, glowSize
                );
                glow.addColorStop(0,'rgba(255,255,255,'+ Math.min(0.9,0.04+(0.04 * (sp.speed/maxSpeed))) +')');
                glow.addColorStop(0.2,'rgba(255,255,255,'+ Math.min(0.45,0.02+(0.02 * (sp.speed/maxSpeed))) +')');
                glow.addColorStop(0.4,'rgba(255,255,255,'+ Math.min(0.2,0.01+(0.01 * (sp.speed/maxSpeed))) +')');
                glow.addColorStop(1,'rgba(255,255,255,0)'); context.fillStyle = glow;
                context.fillRect(sp.x+arena.pixels/2-glowSize,sp.y+arena.pixels/2-glowSize,glowSize*2,glowSize*2);
            };
            return sp;
        },
        HomeGate: function(game,x,y) {
            var g = new Gate(game,x,y); g.name = 'Home Gate'; g.pixelValue = 1;
            g.render = function(context) {
                context.fillStyle = '#22aa44';
                context.fillRect(g.x+1, g.y+1, game.arena.pixels-2, game.arena.pixels-2);
                context.fillStyle = 'rgba(255,255,255,'+ (1 - g.recharge/20) +')';
                context.fillRect(g.x, g.y,1.5,1.5);
                context.fillRect(g.x+game.arena.pixels-1.5, g.y,1.5,1.5);
                context.fillRect(g.x+game.arena.pixels-1.5, g.y+game.arena.pixels-1.5,1.5,1.5);
                context.fillRect(g.x, g.y+game.arena.pixels-1.5,1.5,1.5);
            };
            return g;
        },
        RedirGateLeft: function(game,x,y) { 
            var g = RedirGate(game,x,y); g.direction = 'left'; g.init(); return g; },
        RedirGateDown: function(game,x,y) { 
            var g = RedirGate(game,x,y); g.direction = 'down'; g.init(); return g; },
        RedirGateUp: function(game,x,y) { 
            var g = RedirGate(game,x,y); g.direction = 'up'; g.init(); return g; },
        RedirGateRight: function(game,x,y) { 
            var g = RedirGate(game,x,y); g.direction = 'right'; g.init(); return g; },
        ReceiveGateLeft: function(game,x,y) { 
            var g = ReceiverGate(game,x,y); g.direction = 'left'; g.init(); return g; },
        ReceiveGateDown: function(game,x,y) { 
            var g = ReceiverGate(game,x,y); g.direction = 'down'; g.init(); return g; },
        ReceiveGateUp: function(game,x,y) { 
            var g = ReceiverGate(game,x,y); g.direction = 'up'; g.init(); return g; },
        ReceiveGateRight: function(game,x,y) { 
            var g = ReceiverGate(game,x,y); g.direction = 'right'; g.init(); return g; },
        COSTS: COSTS
    }
});