'use strict';
Application.Controllers.controller('Arena', function($scope, Game) {
    console.log('arena controller initialized',performance.now());
    $scope.game = Game.game;
});