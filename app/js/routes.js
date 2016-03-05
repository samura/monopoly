(function () {
  'use strict';

  angular.module('monopoly').config([
    '$stateProvider', '$urlRouterProvider',
    function($stateProvider, $urlRouterProvider) {

      // go to index if wrong route
      $urlRouterProvider.otherwise('/');

      // Now set up the states (we only have one for now)
      $stateProvider
        .state('monopoly', {
        url: '/',
        views: {'@': {
          controller: 'MonopolyController',
          templateUrl: '/views/view.html'
        }}
      });
    }
  ]);
}());