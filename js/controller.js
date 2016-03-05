(function () {
  'use strict';

  /**
   * main game controller
   */
  angular.module('monopoly').controller('MonopolyController', [
    '$scope', 'Game', 'Table', '$uibModal',
    function ($scope, Game, Table, $uibModal) {

      $scope.tab = 'actions';

      // start a new game
      $scope.init = function() {
        Game.init();
        // play the first move
        $scope.play();
      };

      // set some pointers that will never change
      $scope.history = Game.history;
      $scope.players = Game.players;
      $scope.properties = Table.properties;

      // "next turn" click
      $scope.play = function() {
        $scope.turnInfo = Game.play();
        // refresh the build table
        $scope.whereBuildings = Table.whereCanIBuild($scope.turnInfo.player);
      };

      // pay if some rent/tax has to be paid
      $scope.pay = function() {
        $scope.turnInfo = Game.pay($scope.turnInfo.property, $scope.turnInfo.player);
      };

      // buy a property, shows a popup if not enough funds
      $scope.buy = function() {
        if(!Game.buy($scope.turnInfo.property, $scope.turnInfo.player)) {
          return $scope.showNoFunds();
        }
        // refresh the build table
        $scope.whereBuildings = Table.whereCanIBuild($scope.turnInfo.player);
      };

      // sells a building if buildings > 0 or the property
      $scope.sell = function(property) {
        Table.sell(property);
        // refresh the build table
        $scope.whereBuildings = Table.whereCanIBuild($scope.turnInfo.player);
      };

      // buy a house
      $scope.build = function(property) {
        if(!Table.build(property)) {
          $scope.showNoFunds();
        } else {
          // refresh the build table
          $scope.whereBuildings = Table.whereCanIBuild($scope.turnInfo.player);
        }
      };

      // check for bankrupsy
      $scope.$watch('turnInfo', function(){
        // need to pay && not enough cash && nothing to sell
        if($scope.turnInfo.pay > 0 && $scope.turnInfo.pay > $scope.turnInfo.player.account && $scope.turnInfo.player.properties.length === 0) {

          // show modal if any user is bankrupt - ends the game
          var modalInstance = $uibModal.open({
            templateUrl: 'backrupt.html',
            controller: 'PopupController',
            backdrop: 'static',
            resolve: {
              turnInfo: function () {
                return $scope.turnInfo;
              }
            }
          });

          modalInstance.result.then(function (restart) {
            // check if user wants to start a new game
            if(restart) {
              $scope.init();
            }
          });
        }
      });

      // show a popup stating you don't have enough funds
      // to do the action you're trying to do
      $scope.showNoFunds = function() {
        $uibModal.open({
          templateUrl: 'noFunds.html',
          controller: 'PopupController',
          backdrop: 'static',
          resolve: { turnInfo: false }
        });
      };

      // this assumes you bought 2 properties (so you can test selling or building houses from start)
      $scope.handicap = function() {
        $scope.turnInfo.player.properties.push($scope.properties[1]);
        $scope.properties[1].owner = $scope.turnInfo.player;
        $scope.turnInfo.player.properties.push($scope.properties[3]);
        $scope.properties[3].owner = $scope.turnInfo.player;
        // this avoids clicking twice and get errors
        $scope.handicap = function(){};
        // we need to play to get every variable updated
        $scope.play();
      };

      // generates an array to use on the ng-repeat to draw the houses
      $scope.getTimes = function(n) {
        return new Array(n);
      };
    }
  ]);

  /**
   * popup controller
   */
  angular.module('monopoly').controller('PopupController', function ($scope, $uibModalInstance, turnInfo) {

    // set the turn information
    $scope.turnInfo = turnInfo;

    // start a new game
    $scope.rematch = function () {
      $uibModalInstance.close(true);
    };

    // close the modal to view the current state
    $scope.cancel = function () {
      $uibModalInstance.dismiss('cancel');
    };
  });
}());