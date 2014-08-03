'use strict'
Application.Controllers.controller('Controls', function($scope, Game) {
    console.log('controls controller initialized',performance.now());
    $scope.test = Game.message;

    $scope.changeMessage = function() {
        Game.message.text = 'Controls rule!';
    }    

});