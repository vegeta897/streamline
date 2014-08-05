'use strict';
Application.Controllers.controller('Controls', function($scope, Game) {
    console.log('controls controller initialized',performance.now());
    $scope.game = Game.game;
    $scope.buildGate = function(gateType) {
        console.log('gate',gateType,'selected for building');
        Game.game.player.building = gateType;
    };
    $scope.pause = Game.pause;
    $scope.resume = Game.resume;
    $scope.oneFrame = Game.oneFrame;
});