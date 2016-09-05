/**
 * Created by Ale on 05/09/2016.
 */


(
    function () {

        angular.service('newsApp.admin')
            .service('adminSvc', adminSvc);

        adminSvc.$inject = ['$http'];
        function adminSvc($http) {


        };

    }()
);