/**
 * Created by Ale on 04/09/2016.
 */
'use strict';

(function () {


    angular.module('newsApp.admin')
        .controller('adminCtrl', adminCtrl);


    adminCtrl.$inject = ['adminSvc', 'globalSvc'];
    function adminCtrl(adminSvc, globalSvc) {
        var vm = this;

        // VARIABILI
        vm.articles;
        vm.selectedArticles = {};
        vm.globalData = globalSvc.data;
        vm.username;
        vm.password;
        vm.openDeleteMsg = false;
        vm.openErrorAccessMsg = false;
        vm.openEditMsg = false;
        vm.editing = false;
        vm.articleOnEditing;

        // FUNZIONI
        vm.showArticles = showArticles;
        vm.deleteArticles = deleteArticles;
        vm.toggleArticle = toggleArticle;
        vm.tryLogin = tryLogin;
        vm.logout = logout;
        vm.fadeOut = fadeOut;
        vm.toggleEdit = toggleEdit;
        vm.editArticle = editArticle;
        vm.saveArticle = saveArticle;


        // Funzione per visualizzare gli articoli su admin
        function showArticles() {

            adminSvc.showArticles().success(function (data) {  //Aspetto che ritorni la promise dal service per createArticle
                    vm.articles = data.payloads;
                    for (var key in vm.articles) {
                        vm.articles[key].selected = false;
                    }
                    ;
                    vm.toggleEdit();
                    console.log("Articoli:", vm.articles);
                })
                .error(function (err) {
                    console.log('Error: ' + err);
                });

        }

        // Funzione per eliminare una o più notizie
        function deleteArticles() {

            var array = [];

            for (var key in vm.articles) {
                if (vm.articles[key].selected) {
                    array.push(vm.articles[key]._id);
                }
            }
            ;


            adminSvc.deleteArticles({"ids": array}).success(function (data) {  //Aspetto che ritorni la promise dal service per createArticle
                    console.log("Cancellazione effettuata", data);
                    if (data.payloads.n > 0) {
                        vm.openDeleteMsg = true;
                        vm.showArticles();
                    }
                })
                .error(function (err) {
                    console.log('Error: ' + err);
                });

        }

        // Funzione per la selezione o deselezione degli articoli
        function toggleArticle(id) {


            for (var key in vm.articles) {
                if (vm.articles[key]._id == id) {
                    vm.articles[key].selected = !vm.articles[key].selected;
                }
            }
            ;

            vm.toggleEdit();
            console.log("Selezionati:", id, vm.articles);
        }

        // Funzione per il login
        function tryLogin() {
            if (vm.username != undefined) {
                globalSvc.tryLogin({username: vm.username, password: vm.password})
                    .success(function (data) {  //Aspetto che ritorni la promise dal service per createArticle
                        if (data.payloads.length != 0) {

                            console.log("Login effettuato", data);
                            // Visualizzo gli articoli
                            vm.showArticles();
                        } else {
                            vm.openErrorAccessMsg = true;
                        }

                    })
                    .error(function (err) {
                        console.log('Error: ' + err);
                    });
            }
            console.log("Credenziali", vm.username, vm.password);
        }

        // Funzione per il logout
        function logout() {
            globalSvc.logout();
        }

        // Funzione elimina messaggio di conferma cancellazione
        function fadeOut() {
            vm.openDeleteMsg = false;
            vm.openErrorAccessMsg = false;
            vm.openEditMsg = false;
        }

        // Funzione disabilita pulsante modifica per più articoli
        function toggleEdit() {
            var array = [];

            for (var key in vm.articles) {
                if (vm.articles[key].selected) {
                    array.push(vm.articles[key]._id);
                }
            }
            ;

            if (array.length == 1 && array != undefined) {
                vm.editIsDisables = true;
            } else {
                vm.editIsDisables = false;
            }
        }

        // Funzione per modificare un articolo
        function editArticle() {

            if (vm.editIsDisables) {
                vm.editing = true;

                for (var key in vm.articles) {
                    if (vm.articles[key].selected) {
                        vm.articleOnEditing = vm.articles[key];
                    }
                }
                ;


            }

        }

        // Funzione salvataggio modifiche articolo
        function saveArticle() {

            adminSvc.saveArticle(vm.articleOnEditing)
                .success(function (data) {  //Aspetto che ritorni la promise dal service per createArticle
                    console.log("Modifica effettuata", data);
                    if (data.n > 0) {
                        vm.openEditMsg = true;
                        vm.showArticles();
                    }
                })
                .error(function (err) {
                    console.log('Error: ' + err.message);
                });


        }


    };


}());