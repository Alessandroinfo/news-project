'use strict';  //Dichiaro che JavaScript deve essere eseguite nella modalità strict in modo da aiutare nell'individuazione degli errori
//Il controller viene utilizzato per la logica dell'applicazione separandolo dalla comunicazione col back-end

(function () {  //Utilizzo una funzione autoinnescante per l'esecuzione univoca del controller
    angular.module('newsApp.home')  //Nome del controller
        .controller('homeCtrl', homeCtrl);  //Istanziazione controller passando come primo parametro il nome del controller e secondo il nome della funzione

    homeCtrl.$inject = ['homeSvc'];  //Inietto le dipendenze del controller, tra cui il servizio homeSvc
    function homeCtrl(homeSvc) {
        var vm = this;

        //VARIABILI
        vm.articles;
        vm.category = category;
        vm.filterCategory = "";
        vm.relevant = {relevant: true};
        vm.isOneArticle = false;
        vm.selectedArticle = {};

        //FUNZIONI
        vm.showArticles = showArticles;
        vm.changeCategory = changeCategory;
        vm.goToArticle = goToArticle;
        vm.backToArticles = backToArticles;

        // Faccio visualizzare gli articoli
        vm.showArticles();

        // Funzione per visualizzare gli articoli su home
        function showArticles() {

            homeSvc.showArticles().success(function (data) {  //Aspetto che ritorni la promise dal service per createArticle
                    vm.articles = data.payloads;
                    console.log("Articoli:", vm.articles);
                })
                .error(function (err) {
                    console.log('Error: ' + err);
                });

        };

        // Funzione per il cambio di categoria
        function changeCategory(category) {
            vm.isOneArticle = false;
            if (category == '') {
                vm.filterCategory = '';
            } else {
                vm.filterCategory = {name: category};
            }

        }

        // Funzione per aprire l'articolo selezionato
        function goToArticle(article) {
            vm.isOneArticle = true;
            vm.selectedArticle = article;
        }

        // Funzione per tornare indietro
        function backToArticles() {
            vm.isOneArticle = false;
            vm.selectedArticle = {};
        }
    }
}());