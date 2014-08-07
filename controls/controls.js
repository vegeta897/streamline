'use strict';
Application.Controllers.controller('Controls', function($scope, Game) {
    console.log('controls controller initialized',performance.now());
    $scope.game = Game.game;
    $scope.pause = Game.pause;
    $scope.resume = Game.resume;
    $scope.oneFrame = Game.oneFrame;
    $scope.clearGates = Game.clearGates;
    $scope.buildGate = function(gateType) {
        Game.game.player.building = gateType;
    };
});