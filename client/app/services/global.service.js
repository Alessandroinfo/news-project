/**
 * Created by Ale on 06/09/2016.
 */
(
    function () {

        angular.module('newsApp.global.service', [])
            .service('globalSvc', globalSvc);

        globalSvc.$inject = ['$http'];
        function globalSvc($http) {
            var self = this;

            // VARIABILI
            self.data = {};
            self.data.isAuthenticated = false;

            // FUNZIONI
            self.tryLogin = tryLogin;
            self.logout = logout;

            // Funzione per il login
            function tryLogin(credential) {
                return $http.post('/api/admin/tryLogin', credential).success(function (data) {  //Aspetto che ritorni la promise dal service per createArticle
                        if (data.payloads.length != 0) {
                            self.data.isAuthenticated = true;
                        }

                    })
                    .error(function (err) {
                        console.log('Error: ' + err);
                    });  //Post torna una promessa (promise) che è asincrona, le funzioni della promise success e error (o thenin cascata) vengono scaturiti al ritorno della promise
            };

            // Funzione per il logout
            function logout() {
                self.data.isAuthenticated = false;
            };
        };

    }()
);