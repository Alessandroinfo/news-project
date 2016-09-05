'use strict';  //Dichiaro che JavaScript deve essere eseguite nella modalità strict in modo da aiutare nell'individuazione degli errori
//Il controller viene utilizzato per la logica dell'applicazione separandolo dalla comunicazione col back-end

(function () {  //Utilizzo una funzione autoinnescante per l'esecuzione univoca del controller
    angular.module('newsApp.home')  //Nome del controller
        .controller('homeCtrl', homeCtrl);  //Istanziazione controller passando come primo parametro il nome del controller e secondo il nome della funzione

    homeCtrl.$inject = ['homeSvc'];  //Inietto le dipendenze del controller, tra cui il servizio homeSvc
    function homeCtrl(homeSvc) {
        var vm = this;

        //VARIABILI
        vm.dati;

        //FUNZIONI
        vm.createArticle = createArticle;

        function createArticle() {


            homeSvc.createArticle(vm.formData).success(function (data) {  //Aspetto che ritorni la promise dal service per createArticle
                    vm.dati = data;
                    console.log("Articoli creati:", data);
                })
                .error(function (err) {
                    console.log('Error: ' + err);
                });

        }
    };

}());