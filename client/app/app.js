'use strict';

// Declare app level module which depends on views, and components
angular.module('newsApp', [
  'ngRoute',
  'newsApp.view1',
  'newsApp.view2'
]).
config(['$locationProvider', '$routeProvider', function($locationProvider, $routeProvider) {
  $locationProvider.hashPrefix('!');

  $routeProvider.otherwise({redirectTo: '/view1'});
}]);
