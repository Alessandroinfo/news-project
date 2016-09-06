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
        vm.openCreatedtMsg = false;
        vm.editing = false;
        vm.articleOnEditing;
        vm.create = false;
        vm.category = category;

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
        vm.createArticle = createArticle;
        vm.backToArticles = backToArticles;
        vm.deselectAll = deselectAll;

        // Funzione per visualizzare gli articoli su admin
        function showArticles() {

            adminSvc.showArticles().success(function (data) {  //Aspetto che ritorni la promise dal service per createArticle
                    vm.articles = data.payloads;

                    vm.deselectAll();
                    vm.toggleEdit();
                    console.log("Articoli:", vm.articles);
                })
                .error(function (err) {
                    console.log('Error: ' + err);
                });

        }

        // Funzione per la creazione degli articoli
        function createArticle() {
            vm.editing = true;
            vm.create = true;
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


            adminSvc.deleteArticles({"ids": array})
                .success(function (data) {  //Aspetto che ritorni la promise dal service per createArticle
                    console.log("Cancellazione effettuata", data);
                    if (data.payloads.n > 0) {
                        vm.showArticles();
                        vm.openCreatedtMsg = false;
                        vm.openDeleteMsg = true;
                        vm.backToArticles();
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
                            vm.openErrorAccessMsg = false;
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
            vm.openCreatedtMsg = false;
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
            if (vm.create) {
                adminSvc.createArticle(vm.articleOnEditing)
                    .success(function (data) {
                        vm.openCreatedtMsg = true;
                        console.log('Articolo creato con successo: ', data.article);
                        vm.articles.push(data.article)

                        for (var key in vm.articles) {
                            if (vm.articles[key]._id == data.article._id) {
                                vm.articles[key].selected = true;
                            }
                        }
                        ;


                    }).error(function (err) {
                    console.log('Error: ' + err);
                });
            } else {
                adminSvc.saveArticle(vm.articleOnEditing)
                    .success(function (data) {  //Aspetto che ritorni la promise dal service per createArticle
                        console.log("Modifica effettuata", data);
                        if (data.n > 0) {
                            vm.openEditMsg = true;
                            vm.showArticles();
                            vm.backToArticles();
                        }
                    })
                    .error(function (err) {
                        console.log('Error: ' + err.message);
                    });
            }


        }

        // Funzione per tornare alla lista degli articoli
        function backToArticles() {
            vm.editing = false;
            vm.create = false;
            vm.articleOnEditing = {};
            vm.deselectAll();
        }

        // Funzione deseleziona tutto
        function deselectAll() {
            for (var key in vm.articles) {
                vm.articles[key].selected = false;
            }
            ;
        }


    };


}());