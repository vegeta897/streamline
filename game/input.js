'use strict';
Application.Services.service('Input', function(Objects) {
    var KEY = { BACKSPACE: 8, TAB: 9, RETURN: 13, ESC: 27, SPACE: 32, PAGEUP: 33, PAGEDOWN: 34, END: 35,
        HOME: 36, LEFT: 37, UP: 38, RIGHT: 39, DOWN: 40, INSERT: 45, DELETE: 46, ZERO: 48, ONE: 49, TWO: 50,
        THREE: 51, FOUR: 52, FIVE: 53, SIX: 54, SEVEN: 55, EIGHT: 56, NINE: 57, A: 65, B: 66, C: 67, D: 68,
        E: 69, F: 70, G: 71, H: 72, I: 73, J: 74, K: 75, L: 76, M: 77, N: 78, O: 79, P: 80, Q: 81, R: 82, S: 83,
        T: 84, U: 85, V: 86, W: 87, X: 88, Y: 89, Z: 90, TILDA: 192 };
    window.addEventListener('keydown',function(e) { return onKey(e, e.keyCode, true); },false);
    window.addEventListener('keyup',function(e) { return onKey(e, e.keyCode, false); },false);
    jQuery('#highCanvas').mousedown(function(e) { return onMouse(e, e.which, true); });
    jQuery(window).mouseup(function(e) { return onMouse(e, e.which, false); });
    var input = { kb: {}, mouse: {} };
    var onKey = function(e,key,pressed) {
        switch(key) {
            // Building hotkeys
            case KEY.W: input.kb.w = pressed; e.preventDefault(); break;
            case KEY.A: input.kb.a = pressed; e.preventDefault(); break;
            case KEY.S: input.kb.s = pressed; e.preventDefault(); break;
            case KEY.D: input.kb.d = pressed; e.preventDefault(); break;
            case KEY.T: input.kb.t = pressed; e.preventDefault(); break;
            case KEY.F: input.kb.f = pressed; e.preventDefault(); break;
            case KEY.G: input.kb.g = pressed; e.preventDefault(); break;
            case KEY.H: input.kb.h = pressed; e.preventDefault(); break;
            case KEY.Z: input.kb.z = pressed; e.preventDefault(); break;
        } 
    };
    var onMouse = function(e,button,pressed) {
        switch(button) {
            case 1: input.mouse.left = pressed; e.preventDefault(); break;
            case 3: input.mouse.right = pressed; e.preventDefault(); break;
        }
    };
    var BUILD = { w: 'RedirGateUp', a: 'RedirGateLeft', s: 'RedirGateDown', d: 'RedirGateRight',
        t: 'ReceiveGateUp', f: 'ReceiveGateLeft', g: 'ReceiveGateDown', h: 'ReceiveGateRight', z: 'HomeGate' };
    return {
        process: function(game) {
            for(var key in input.kb) { if(!input.kb.hasOwnProperty(key)) { continue; }
                if(input.kb[key] && BUILD.hasOwnProperty(key) && game.player.building != BUILD[key]) {
                    game.player.building = BUILD[key]; break; }
            }
            if(input.mouse.left) {
                // If building
                game.player.build = game.player.building ? game.player.building : false;
            }
            if(input.mouse.right) { // Cancel building
                game.player.building = game.player.build = false;
            }
        }
    }
});