'use strict'
Application.Controllers.controller('Controls', function($scope, Game) {
    console.log('controls controller initialized',performance.now());
    $scope.game = Game.game;
});