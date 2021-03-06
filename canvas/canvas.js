'use strict';
Application.Services.service('Canvas', function() {
    
    // TODO: Define all colors here, and have objects use this service to get colors
    // This will allow color schemes

    var mainCanvas = document.getElementById('mainCanvas');
    var highCanvas = document.getElementById('highCanvas');
    var mainContext = mainCanvas.getContext ? mainCanvas.getContext('2d') : null;
    var highContext = highCanvas.getContext ? highCanvas.getContext('2d') : null;

    highCanvas.onselectstart = function() { return false; }; // Disable selecting and right clicking
    jQuery('body').on('contextmenu', '#highCanvas', function(e){ return false; });

    var gridSize, game, cursor = { 
        x: '-', y: '-', highlightLeft: 0, highlightUp: 0, highlightDown: 0, highlightRight: 0 };
    
    var onMouseMove = function(e) {
        var offset = jQuery(mainCanvas).offset();
        cursor.x = e.pageX - offset.left < 0 ? 0 : Math.floor((e.pageX - offset.left) / gridSize);
        cursor.y = e.pageY - offset.top < 0 ? 0 : Math.floor((e.pageY - offset.top) / gridSize);
    };
    var onMouseOut = function() { cursor.x = cursor.y = '-'; };
    
    return {
        render: function(rt,game,step,tick) {
            mainContext.clearRect(0,0,mainCanvas.width,mainCanvas.height);
            mainContext.fillStyle = 'white';
            // Render streams
            for(var sp = 0, spl = game.objects.streams.length; sp < spl; sp++) {
                game.objects.streams[sp].render(mainContext,rt,step,tick); }
            // Render gates
            for(var gk in game.objects.gates) { if(!game.objects.gates.hasOwnProperty(gk)) { continue; }
                game.objects.gates[gk].render(mainContext);
            }
            // Render stream collisions
//            for(var c = 0, cl = game.objects.collisions.length; c < cl; c++) {
//                var thisC = game.objects.collisions[c];
//                var age = Math.min(30,game.ticks - thisC.tick);
//                var colGrad = mainContext.createRadialGradient(
//                    thisC.x + gridSize/2, thisC.y + gridSize/2, 0,
//                    thisC.x + gridSize/2, thisC.y + gridSize/2, 12
//                );
//                colGrad.addColorStop(0,'rgba(255,255,255,' + (0.8 * (thisC.intensity/10) * (30-age)/30) + ')');
//                colGrad.addColorStop((30-age)/30,'rgba(255,255,255,0)');
//                mainContext.fillStyle = colGrad;
//                mainContext.fillRect(thisC.x + gridSize/2 - 12, thisC.y + gridSize/2 - 12,24, 24);
//            }
            // Render cursor
            highContext.clearRect(0,0,highCanvas.width,highCanvas.height);
            if(cursor.x == '-') { return; }
            var dirChecks = [
                { stream: game.objects.streamX, cursorLine: cursor.x, sign: 1,
                    cursorDepth: cursor.y, gameCoord: 'gameY',highlight: 'highlightUp'},
                { stream: game.objects.streamX, cursorLine: cursor.x, sign: -1,
                    cursorDepth: cursor.y, gameCoord: 'gameY',highlight: 'highlightDown'},
                { stream: game.objects.streamY, cursorLine: cursor.y, sign: 1,
                    cursorDepth: cursor.x, gameCoord: 'gameX',highlight: 'highlightLeft'},
                { stream: game.objects.streamY, cursorLine: cursor.y, sign: -1,
                    cursorDepth: cursor.x, gameCoord: 'gameX',highlight: 'highlightRight'}
            ];
            
            for(var i = 0; i < dirChecks.length; i++) { var dir = dirChecks[i];
                if(dir.stream.hasOwnProperty(dir.cursorLine)) {
                    for(var ii = 0; ii < dir.stream[dir.cursorLine].length; ii++) {
                        if(dir.stream[dir.cursorLine][ii][dir.gameCoord]*dir.sign <= dir.cursorDepth*dir.sign) { 
                            cursor[dir.highlight] += 3; break; } } }
                cursor[dir.highlight]--; cursor[dir.highlight] = Math.max(Math.min(cursor[dir.highlight],12),0);
            }
            
            highContext.fillStyle = 'rgba(255,255,255,' + (0.08 + cursor.highlightUp/100) + ')';
            highContext.fillRect(cursor.x*gridSize+0.5,0,gridSize-1,cursor.y*gridSize);
            highContext.fillStyle = 'rgba(255,255,255,' + (0.08 + cursor.highlightDown/100) + ')';
            highContext.fillRect(cursor.x*gridSize+0.5,cursor.y*gridSize+gridSize,
                gridSize-1,highCanvas.height-cursor.y*gridSize);
            highContext.fillStyle = 'rgba(255,255,255,' + (0.08 + cursor.highlightLeft/100) + ')';
            highContext.fillRect(0,cursor.y*gridSize+0.5,cursor.x*gridSize,gridSize-1);
            highContext.fillStyle = 'rgba(255,255,255,' + (0.08 + cursor.highlightRight/100) + ')';
            highContext.fillRect(cursor.x*gridSize+gridSize,cursor.y*gridSize+0.5,
                highCanvas.width-cursor.x*gridSize,gridSize-1);
            
            if(game.player.building) { // Building indicator
                highContext.fillStyle = game.player.canAfford ? 'rgba(0,255,0,0.5)' : 'rgba(255,0,0,0.5)';
                highContext.fillRect(cursor.x*gridSize,cursor.y*gridSize,gridSize,gridSize);
            } else {
                highContext.fillStyle = 'rgba(255,255,255,0.3)';
                highContext.fillRect(cursor.x*gridSize-1,cursor.y*gridSize-1,gridSize+2,gridSize+2);
                highContext.clearRect(cursor.x*gridSize-1,cursor.y*gridSize+2,gridSize+2,gridSize-4);
                highContext.clearRect(cursor.x*gridSize+2,cursor.y*gridSize-1,gridSize-4,gridSize+2);
                highContext.clearRect(cursor.x*gridSize,cursor.y*gridSize,gridSize,gridSize);
            }
            highContext.fillStyle = 'rgba(255,255,255,0.3';
            var highlightGates = function(coord,gates) {
                if(gates.hasOwnProperty(coord)) {
                    for(var g = 0, gl = gates[coord].length; g < gl; g++) {
                        var gate = gates[coord][g];
                        highContext.fillRect(gate.x - 1, gate.y - 1, gridSize + 2, gridSize + 2);
                        highContext.clearRect(gate.x, gate.y, gridSize, gridSize);
                    }
                }
            };
            highlightGates(cursor.x,game.objects.gateX);
            highlightGates(cursor.y,game.objects.gateY);
        },
        cursor: cursor,
        setGridSize: function(pixels,theGame) { gridSize = pixels; game = theGame;
            highCanvas.addEventListener('mousemove',onMouseMove,false);
            highCanvas.addEventListener('mouseleave',onMouseOut,false);
        },
        getLineRectangle: function(start,end,expand) {
            if(start.x > end.x) { // Right to left
                return { x: start.x + expand, y: start.y - expand, 
                    width: (end.x - expand) - (start.x + expand), height: expand * 2 }
            } else if(start.x < end.x) { // Left to right
                return { x: start.x - expand, y: start.y - expand,
                    width: (end.x + expand) - (start.x - expand), height: expand * 2 }
            } else if(start.y > end.y) { // Down to up
                return { x: start.x - expand, y: start.y + expand,
                    width: expand * 2, height: (end.y - expand) - (start.y + expand) }
            } else { // Up to down
                return { x: start.x - expand, y: start.y - expand,
                    width: expand * 2, height: (end.y + expand) - (start.y - expand) }
            }
        }
    }
});