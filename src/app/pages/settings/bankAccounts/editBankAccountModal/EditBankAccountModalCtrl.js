(function () {
    'use strict';

    angular.module('BlurAdmin.pages.settings.bankAccounts')
        .controller('EditBankAccountModalCtrl', EditBankAccountModalCtrl);

    function EditBankAccountModalCtrl($scope,$uibModalInstance,bankAccount,toastr,$http,$timeout,
                                      Rehive,environmentConfig,localStorageManagement,errorHandler,_) {

        var vm = this;

        $scope.bankAccount = bankAccount;
        vm.token = localStorageManagement.getValue('TOKEN');
        $scope.updatingBankAccount = false;
        $scope.editBankData = {};
        vm.updatedBankAccount = {};
        $scope.editBankAccountCurrencies = {
            list: []
        };
        $scope.originalBankAccountCurrencies = {
            list: []
        };

        vm.getCompanyCurrencies = function(){
            if(vm.token){
                Rehive.admin.currencies.get({filters: {
                    enabled: true,
                    page_size: 250
                }}).then(function (res) {
                    $scope.currenciesList = res.results;
                    $scope.$apply();
                }, function (error) {
                    errorHandler.evaluateErrors(error);
                    errorHandler.handleErrors(error);
                    $scope.$apply();
                });
            }
        };
        vm.getCompanyCurrencies();

        vm.getBankAccount = function () {
            $scope.updatingBankAccount = true;
            Rehive.admin.bankAccounts.get({id: bankAccount.id}).then(function (res) {
                $scope.editBankData = res;
                vm.getBankAccountCurrencies();
                $scope.$apply();
            }, function (error) {
                $scope.updatingBankAccount = false;
                errorHandler.evaluateErrors(error);
                errorHandler.handleErrors(error);
                $scope.$apply();
            });
        };
        vm.getBankAccount();

        vm.getBankAccountCurrencies = function () {
            $scope.updatingBankAccount = true;
            $http.get(environmentConfig.API + '/admin/bank-accounts/' + bankAccount.id + '/currencies/', {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': vm.token
                }
            }).then(function (res) {
                $scope.updatingBankAccount = false;
                if (res.status === 200) {
                    $scope.editBankAccountCurrencies.list = res.data.data.results;
                    $scope.originalBankAccountCurrencies = {
                        list: _.pluck(res.data.data.results,'code')
                    };
                }
            }).catch(function (error) {
                $scope.updatingBankAccount = false;
                errorHandler.evaluateErrors(error.data);
                errorHandler.handleErrors(error);
            });
        };

        $scope.bankAccountChanged = function(field){
            vm.updatedBankAccount[field] = $scope.editBankData[field];
        };

        $scope.updateBankAccount = function () {
            $scope.updatingBankAccount = true;
            Rehive.admin.bankAccounts.update($scope.editBankData.id, vm.updatedBankAccount).then(function (res) {
                $scope.separateCurrencies($scope.editBankAccountCurrencies);
                $scope.$apply();
            }, function (error) {
                $scope.updatingBankAccount = false;
                errorHandler.evaluateErrors(error);
                errorHandler.handleErrors(error);
                $scope.$apply();
            });
        };

        $scope.separateCurrencies = function (editBankAccountCurrencies) {
            var newCurrencyArray = [],deleteCurrencyArray = [],currencies = [];

            currencies = _.pluck(editBankAccountCurrencies.list,'code');
            newCurrencyArray = _.difference(currencies,$scope.originalBankAccountCurrencies.list);
            deleteCurrencyArray = _.difference($scope.originalBankAccountCurrencies.list,currencies);

            if(deleteCurrencyArray.length > 0){
                deleteCurrencyArray.forEach(function (currencyCode,index,array) {
                    $scope.deleteBankAccountCurrency(editBankAccountCurrencies,currencyCode);
                    if(index === (array.length -1)){
                        if(newCurrencyArray.length > 0){
                            newCurrencyArray.forEach(function (currencyCode,index,array) {
                                if(index === (array.length -1)){
                                    $scope.createBankAccountCurrency(editBankAccountCurrencies,currencyCode,'last');
                                } else{
                                    $scope.createBankAccountCurrency(editBankAccountCurrencies,currencyCode);
                                }
                            });
                        } else {
                            $timeout(function () {
                                vm.updatedBankAccount = {};
                                $scope.updatingBankAccount = false;
                                $uibModalInstance.close(true);
                                toastr.success('Bank account successfully updated');
                            },800);
                        }
                    }
                });
            } else {
                if(newCurrencyArray.length > 0){
                    newCurrencyArray.forEach(function (currencyCode,index,array) {
                        if(index === (array.length -1)){
                            $scope.createBankAccountCurrency(editBankAccountCurrencies,currencyCode,'last');
                        } else{
                            $scope.createBankAccountCurrency(editBankAccountCurrencies,currencyCode);
                        }
                    });
                } else {
                    $timeout(function () {
                        vm.updatedBankAccount = {};
                        $scope.updatingBankAccount = false;
                        $uibModalInstance.close(true);
                        toastr.success('Bank account successfully updated');
                    },800);
                }
            }


        };

        $scope.deleteBankAccountCurrency = function(editBankAccountCurrencies,currencyCode){
            $scope.updatingBankAccount = true;
            $http.delete(environmentConfig.API + '/admin/bank-accounts/' + $scope.editBankData.id + '/currencies/' + currencyCode + '/', {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': vm.token
                }
            }).then(function (res) {
                if (res.status === 200) {

                }
            }).catch(function (error) {
                $scope.updatingBankAccount = false;
                errorHandler.evaluateErrors(error.data);
                errorHandler.handleErrors(error);
            });
        };

        $scope.createBankAccountCurrency = function(editBankAccountCurrencies,currencyCode,last){
            $scope.updatingBankAccount = true;
            $http.post(environmentConfig.API + '/admin/bank-accounts/' + $scope.editBankData.id + '/currencies/',{currency: currencyCode}, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': vm.token
                }
            }).then(function (res) {
                if (res.status === 201) {
                    if(last){
                        $timeout(function () {
                            vm.updatedBankAccount = {};
                            $uibModalInstance.close(true);
                            $scope.updatingBankAccount = false;
                            toastr.success('Bank account successfully updated');
                        },800);
                    }
                }
            }).catch(function (error) {
                $scope.updatingBankAccount = false;
                errorHandler.evaluateErrors(error.data);
                errorHandler.handleErrors(error);
            });
        };

    }
})();
