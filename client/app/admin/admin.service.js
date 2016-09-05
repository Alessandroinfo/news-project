/**
 * Created by Ale on 05/09/2016.
 */


(
    function () {

        angular.module('newsApp.admin')
            .service('adminSvc', adminSvc);

        adminSvc.$inject = ['$http'];
        function adminSvc($http) {

            var self = this;
            self.showArticles = showArticles;
            self.deleteArticles = deleteArticles;

            // Funzione per creare gli articoli
            function showArticles() {
                return $http.get('/api/article/showArticles');  //Post torna una promessa (promise) che è asincrona, le funzioni della promise success e error (o thenin cascata) vengono scaturiti al ritorno della promise
            };

            // Funzione per cancellare articoli
            function deleteArticles(ids) {
                return $http.post('/api/article/deleteArticles', ids);  //Post torna una promessa (promise) che è asincrona, le funzioni della promise success e error (o thenin cascata) vengono scaturiti al ritorno della promise
            };


        };

    }()
);