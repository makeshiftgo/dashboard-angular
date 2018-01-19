(function () {
    'use strict';

    angular.module('BlurAdmin.pages.newCompanySetup')
        .controller("NewCompanySetupCtrl", NewCompanySetupCtrl);

    function NewCompanySetupCtrl($rootScope, $scope, $location,cookieManagement,userVerification) {
        var vm=this;
        vm.token=cookieManagement.getCookie("TOKEN");
        $scope.companySetupView = 'initialSetupScreen';
        $rootScope.setupUsers = 0;
        $rootScope.setupCurrencies = 0;
        $rootScope.setupAccounts = 0;
        $rootScope.setupSubtypes = 0;
        $rootScope.activeSetupRoute = 0;
        $scope.goToView = function(path){
            $scope.companySetupView = '';
            $location.path(path);
        };
        $rootScope.skipAllView=function () {
            $location.path('/currencies');
        }
    }
})();