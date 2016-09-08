'use strict';

(function () {


    angular.module('newsApp.global.service')
        .service('articleUpload', articleUpload);

    articleUpload.$inject = ['$http'];

    // Funzione che simula un form multipart
    function articleUpload($http) {

        this.uploadDataToUrl = function (file, data, uploadUrl) {
            // fd è l'oggetto form data
            var fd = new FormData();
            // Append file
            fd.append('file', file);
            fd.append('_id', data._id);
            fd.append('title', data.title);
            fd.append('category', data.category);
            fd.append('body', data.body);
            fd.append('relevant', data.relevant);
            // Chiamo l'API fornita come parametro e i dati del form
            return $http.post(uploadUrl, fd, {
                    transformRequest: angular.identity,
                    headers: {'Content-Type': undefined}
                })
                .success(function (data) {
                    return data;
                })
                .error(function (err) {
                    return err;
                });
        }

    }


})();

