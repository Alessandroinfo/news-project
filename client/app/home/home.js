'use strict';

angular.module('newsApp.home', ['ngRoute'])

    .config(['$routeProvider', function ($routeProvider) {
        $routeProvider.when('/home', {
            templateUrl: '../app/home/home.html',
            controller: 'HomeCtrl',
            controllerAs: 'home'
        });
    }])

    .controller('HomeCtrl', ['$scope', '$http', function ($scope, $http) {
        var vm = this;
        vm.ciao = "asdasd";
        vm.createTodo = createTodo;

        function createTodo() {
            $http.post('/api/todos', vm.formData)
                .success(function (data) {
                    vm.todos = data;
                    console.log(data);
                })
                .error(function (data) {
                    console.log('Error: ' + data);
                });
        };

    }]);