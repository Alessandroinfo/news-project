/**
 * Created by Ale on 04/09/2016.
 */
'use strict';

(function () {


    angular.module('newsApp.admin')
        .controller('adminCtrl', adminCtrl);


    adminCtrl.$inject = ['adminSvc'];
    function adminCtrl(adminSvc) {
        var vm = this;

        // VARIABILI
        vm.articles;
        vm.selectedArticles = {};

        // FUNZIONI
        vm.showArticles = showArticles;
        vm.deleteArticles = deleteArticles;
        vm.toggleArticle = toggleArticle;


        // Funzione per visualizzare gli articoli su admin
        function showArticles() {

            adminSvc.showArticles().success(function (data) {  //Aspetto che ritorni la promise dal service per createArticle
                    vm.articles = data.payloads;
                    console.log("Articoli creati:", data);
                })
                .error(function (err) {
                    console.log('Error: ' + err);
                });

        }

        // Funzione per eliminare una o più notizie
        function deleteArticles() {

            var array = [];

            for (var key in vm.selectedArticles) {
                if (vm.selectedArticles[key]) {
                    array.push(key);
                }
            }
            ;


            adminSvc.deleteArticles({"ids": array}).success(function (data) {  //Aspetto che ritorni la promise dal service per createArticle
                    console.log("Cancellazione effettuata", data);
                })
                .error(function (err) {
                    console.log('Error: ' + err);
                });

        }

        // Funzione per la selezione o deselzione degli articoli
        function toggleArticle(id) {
            vm.selectedArticles[id] = !vm.selectedArticles[id];
            console.log(id, vm.selectedArticles);
        }

    };


}());