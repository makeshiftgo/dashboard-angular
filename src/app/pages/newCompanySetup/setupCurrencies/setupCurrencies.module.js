(function () {
    'use strict';

    angular.module('BlurAdmin.pages.newCompanySetup.setupCurrencies',[])
        .config(routeConfig)

    /** @ngInject */

    function routeConfig ($stateProvider) {
        $stateProvider
            .state('newCompanySetup.setupCurrencies',{
                url:'/currency-setup',
                views:{
                    'companySetupView': {
                        templateUrl: 'app/pages/newCompanySetup/setupCurrencies/setupCurrencies.html',
                        controller:'SetupCurrenciesCtrl'
                    }
                }
            })
    }

})();