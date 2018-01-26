(function () {
    'use strict';

    angular.module('BlurAdmin.pages.services.currencyConversionService.currencyConversionRates')
        .controller('AddCurrencyConversionRatesModalCtrl', AddCurrencyConversionRatesModalCtrl);

    function AddCurrencyConversionRatesModalCtrl($scope,$uibModalInstance,toastr,currencyModifiers,$http,cookieManagement,errorHandler) {

        var vm = this;
        vm.token = cookieManagement.getCookie('TOKEN');
        vm.baseUrl = cookieManagement.getCookie('SERVICEURL');
        $scope.addingRate = true;
        $scope.invalidAmount = false;
        $scope.rateParams = {
            fromCurrency: {
                code: ''
            },
            toCurrency: {
                code: ''
            }
        };
        $scope.currenciesList = [];

        $scope.getCurrencies = function () {
            $scope.addingRate = true;
            $http.get(vm.baseUrl + 'admin/currencies/', {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': vm.token
                }
            }).then(function (res) {
                $scope.addingRate = false;
                if (res.status === 200) {
                    $scope.currenciesList = res.data.data.results;
                }
            }).catch(function (error) {
                $scope.addingRate = false;
                errorHandler.evaluateErrors(error.data);
                errorHandler.handleErrors(error);
            });
        };
        $scope.getCurrencies();

        $scope.validateNumberInput = function (value,currencyType) {
            var validAmount = currencyModifiers.validateCurrency(value,$scope.rateParams[currencyType].divisibility);
            if(!validAmount){
                $scope.invalidAmount = true;
                toastr.error('Please input amount to ' + $scope.rateParams[currencyType].divisibility + ' decimal places');
            } else {
                $scope.invalidAmount = false;
            }
        };

        $scope.addRate = function () {
            $scope.addingRate = true;

            var newRate = {
                from_currency: $scope.rateParams.fromCurrency.code,
                to_currency: $scope.rateParams.toCurrency.code,
                from_percentage_fee: $scope.rateParams.from_percentage_fee || null,
                from_value_fee: $scope.rateParams.from_value_fee ? currencyModifiers.convertToCents($scope.rateParams.from_value_fee,$scope.rateParams.fromCurrency.divisibility) : null,
                fixed_rate: $scope.rateParams.fixed_rate ? currencyModifiers.convertToCents($scope.rateParams.fixed_rate,$scope.rateParams.toCurrency.divisibility) : null
            };

            $http.post(vm.baseUrl + 'admin/rates/', newRate, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': vm.token
                }
            }).then(function (res) {
                $scope.addingRate = false;
                if (res.status === 201) {
                    toastr.success('Rate successfully added');
                    $uibModalInstance.close(res.data);
                }
            }).catch(function (error) {
                $scope.addingRate = false;
                errorHandler.evaluateErrors(error.data);
                errorHandler.handleErrors(error);
            });
        };



    }
})();
