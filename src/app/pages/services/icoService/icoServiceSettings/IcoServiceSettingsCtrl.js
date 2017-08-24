(function () {
    'use strict';

    angular.module('BlurAdmin.pages.services.icoService.icoServiceSettings')
        .controller('IcoServiceSettingsCtrl', IcoServiceSettingsCtrl);

    /** @ngInject */
    function IcoServiceSettingsCtrl($scope,$http,cookieManagement,errorToasts,$state) {

        var vm = this;
        vm.token = cookieManagement.getCookie('TOKEN');
        vm.serviceUrl = cookieManagement.getCookie('SERVICEURL');
        $scope.defaultImageUrl = "/assets/img/app/placeholders/hex_grey.svg";
        $scope.icoSettingView = '';

        $scope.goToIcoSetting = function (setting) {
            $scope.icoSettingView = setting;
        };

        vm.getCompanyDetails = function () {
            $scope.updatingCompanyDetails =  true;
            if(vm.token) {
                $http.get(vm.serviceUrl + 'admin/company/', {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': vm.token
                    }
                }).then(function (res) {
                    $scope.updatingCompanyDetails =  false;
                    if (res.status === 200) {
                        $scope.company = res.data.data;
                    }
                }).catch(function (error) {
                    $scope.updatingCompanyDetails =  false;
                    errorToasts.evaluateErrors(error.data);
                });
            }
        };
        vm.getCompanyDetails();

        $scope.goToTransactionsWebhooks = function(secret){
            $state.go('webhooks.transactionWebhooks',{"secret": secret});
        };


        $scope.goToUsersWebhooks = function(secret){
            $state.go('webhooks.userWebhooks',{"secret": secret});
        };

    }

})();
