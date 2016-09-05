/**
 * Created by Ale on 05/09/2016.
 */
'use strict';
//Utilizzo un servizio per suddividere la parte del controller dalla parte che gestisce i dati in condivisione o per le operazioni da e verso il back-end

(function () {


    angular.module('newsApp.home')
        .service('homeSvc', homeSvc);

    homeSvc.$inject = ['$http'];
    function homeSvc($http) {
        var self = this;
        self.createArticle = createArticle;

        // Funzione per creare gli articoli
        function createArticle(article) {
            return $http.post('/api/createArticle', article);  //Post torna una promessa (promise) che è asincrona, le funzioni della promise success e error (o thenin cascata) vengono scaturiti al ritorno della promise
        };

    };


}());