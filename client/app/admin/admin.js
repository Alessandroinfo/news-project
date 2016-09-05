/**
 * Created by Ale on 04/09/2016.
 */
'use strict';

angular.module('newsApp.admin', ['ngRoute'])

    .config(['$routeProvider', function ($routeProvider) {
        $routeProvider.when('/admin', {
            templateUrl: '../app/admin/admin.html',
            controller: 'AdminCtrl',
            controllerAs: 'admin'
        });
    }])

    .controller('AdminCtrl', ['$scope', '$http', function ($scope, $http) {

    }]);