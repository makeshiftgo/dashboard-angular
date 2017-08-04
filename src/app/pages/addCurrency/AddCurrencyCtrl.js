(function () {
    'use strict';

    angular.module('BlurAdmin.pages.addCurrency')
        .controller('AddCurrencyCtrl', AddCurrencyCtrl);

    /** @ngInject */
    function AddCurrencyCtrl($rootScope,$scope,$http,environmentConfig,cookieManagement,errorToasts,errorHandler) {

        var vm = this;
        vm.token = cookieManagement.getCookie('TOKEN');

        $scope.addCurrency = {};
        $scope.addCurrency.currencyChoice = {};
        $scope.showConfirmCurrency = false;
        $scope.showCompleteCurrency = false;
        $scope.loadingCurrencies = true;

        vm.getCurrencies = function(){
            if(vm.token) {
                $scope.loadingCurrencies = true;
                $http.get(environmentConfig.API + '/admin/currencies/?page_size=250', {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': vm.token
                    }
                }).then(function (res) {
                    if (res.status === 200) {
                        $scope.addCurrency.currencyChoice = res.data.data.results.find(function (currency) {
                            return currency.code == 'USD';
                        });
                        $scope.currencyOptions = res.data.data.results;
                        $scope.loadingCurrencies = false;
                    }
                }).catch(function (error) {
                    $scope.loadingCurrencies = false;
                    errorToasts.evaluateErrors(error.data);
                });
            }
        };
        vm.getCurrencies();

        $scope.addCompanyCurrency = function(){

            var code = $scope.addCurrency.currencyChoice.code;

            $scope.loadingCurrencies = true;
            $http.patch(environmentConfig.API + '/admin/currencies/' + code+'/', {enabled: true}, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': vm.token
                }
            }).then(function (res) {
                $scope.loadingCurrencies = false;
                if (res.status === 200) {
                    $scope.showConfirmCurrency = false;
                    $scope.showCompleteCurrency = true;
                    $rootScope.selectedCurrency = res.data.data;
                }
            }).catch(function (error) {
                $scope.loadingCurrencies = false;
                if(error.status == 403){
                    errorHandler.handle403();
                    return
                }
                errorToasts.evaluateErrors(error.data);
            });
        };

        $scope.next = function(){
            $scope.showConfirmCurrency = true;
        };

        $scope.back = function(){
            $scope.showConfirmCurrency = false;
        };

    }
})();
