'use strict';

// Declare app level module which depends on views, and components
angular.module('newsApp', [
  'ngRoute',
    'newsApp.home',
  'newsApp.view2'
]).
config(['$locationProvider', '$routeProvider', function($locationProvider, $routeProvider) {
  $locationProvider.hashPrefix('!');

    $routeProvider
        .when("/admin", {
            templateUrl: 'app/admin/admin.html',
            controller: 'AdminCtrl',
            controllerAs: 'admin'
        })
        .otherwise({redirectTo: '/home'});
}]);
