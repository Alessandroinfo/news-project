/**
 * Created by Ale on 04/09/2016.
 */
'use strict';

(function () {


    angular.module('newsApp.admin')
        .controller('adminCtrl', adminCtrl);


    adminCtrl.$inject = ['adminSvc', 'globalSvc', 'articleUpload'];
    function adminCtrl(adminSvc, globalSvc, articleUpload) {
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
        vm.articleOnEditing = {};
        vm.create = false;
        vm.category = category;
        vm.selectedCategory = vm.category[0]; // Seleziono la prima categoria
        vm.filterCategory = "";
        vm.ByDate = "date";

        // FUNZIONI
        vm.showArticles = showArticles;
        vm.deleteArticles = deleteArticles;
        vm.toggleArticle = toggleArticle;
        vm.tryLogin = tryLogin;
        vm.logout = logout;
        vm.fadeOut = fadeOut;
        vm.toggleEdit = toggleEdit;
        vm.editArticle = editArticle;
        vm.createArticle = createArticle;
        vm.backToArticles = backToArticles;
        vm.deselectAll = deselectAll;
        vm.uploadArticle = uploadArticle;
        vm.selectImage = selectImage;
        vm.resetData = resetData;
        vm.orderForData = orderForData;


        // Controllo per il caricamento degli articoli quando autenticato
        if (vm.globalData.isAuthenticated) {
            vm.showArticles();
        }


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
            vm.deselectAll();
            vm.fadeOut();
            vm.resetData();
            vm.editing = true;
            vm.create = true;
            vm.articleOnEditing = {};
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
                        vm.fadeOut();
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
                            vm.fadeOut();
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
            vm.backToArticles();
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
            vm.resetData();
            if (vm.editIsDisables) {
                vm.editing = true;

                for (var key in vm.articles) {
                    if (vm.articles[key].selected) {
                        vm.articleOnEditing = vm.articles[key];
                        // Ciclo per trovare la stessa categoria dell'array per assegnarlo di default alla select
                        for (var id in vm.category) {
                            if (vm.category[id].name == vm.articleOnEditing.category) {
                                vm.selectedCategory = vm.category[id];
                            }
                        }
                    }
                }
                ;


            }

        }

        // Funzione per tornare alla lista degli articoli
        function backToArticles() {
            vm.resetData();
            vm.articleOnEditing = {};
            vm.selectedCategory = vm.category[0]; // Seleziono la prima categoria
            vm.showArticles();
            vm.editing = false;
            vm.create = false;
        }

        // Funzione deseleziona tutto
        function deselectAll() {
            for (var key in vm.articles) {
                vm.articles[key].selected = false;
            }
            ;
        }

        // Funzione modifica o inserimento articolo tramite il servizio globale articleUpload
        function uploadArticle() {

            if (vm.create) {

                // Rotta per l'API
                var route = '/api/article/createArticle/';

                vm.articleOnEditing.category = vm.selectedCategory.name;

                // Invio l'articolo per la creazione tramite servizio upload globale
                articleUpload.uploadDataToUrl(vm.importedFile, vm.articleOnEditing, route)
                    .then(
                        function (response) {
                            vm.fadeOut();
                            vm.importedFile = undefined;
                            vm.openCreatedtMsg = true;
                            console.log('Articolo creato con successo: ', response.data.article);
                            vm.create = false; //Per andare nella modalità modifica successivamente alla creazione
                            vm.articles.push(response.data.article)
                            vm.articleOnEditing = response.data.article;

                            for (var key in vm.articles) {
                                if (vm.articles[key]._id == response.data.article._id) {
                                    vm.articles[key].selected = true;
                                }
                            }
                            ;
                        },
                        function (err) {
                            console.log('ERRORE su caricamento file', err);
                        }
                    );


            } else {


                // Rotta per l'API
                var route = '/api/article/editArticle/';

                vm.articleOnEditing.category = vm.selectedCategory.name;

                // Invio l'articolo per la creazione tramite servizio upload globale
                articleUpload.uploadDataToUrl(vm.importedFile, vm.articleOnEditing, route)
                    .then(
                        function (response) {
                            console.log("Modifica effettuata", response.data);
                            if (response.data.success > 0) {

                                // Resetto l'oggetto con le nuove modifiche
                                vm.articleOnEditing = response.data.payloads;

                                vm.importedFile = undefined;
                                vm.fadeOut();
                                vm.openEditMsg = true;
                            }
                        });
            }

        };

        // Funzione avviata dalla direttiva che seleziona il file
        function selectImage() {
            // Seleziono il file immagine inserito
            vm.importedFile = event.target.files[0];
        }


        // Funzione per resettare i campi
        function resetData() {
            vm.articleOnEditing.body = "";
        }

        // Funzione per l'ordinamento per data
        function orderForData() {
            vm.ByDate = vm.ByDate == "date" ? "-date" : "date";

        }

    };


}());