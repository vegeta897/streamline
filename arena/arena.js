'use strict'
Application.Controllers.controller('Arena', function($scope, Game) {
    console.log('arena controller initialized');
    $scope.test = Game.message;
    
    
});