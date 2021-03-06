(function () {
    'use strict';

    angular.module('BlurAdmin.pages.transactions.history', [])
        .config(routeConfig);

    /** @ngInject */
    function routeConfig($stateProvider) {
        $stateProvider
            .state('transactions.history', {
                url: '/history',
                views: {
                    'transactionsViews': {
                        templateUrl: 'app/pages/transactions/history/history.html',
                        controller: "HistoryCtrl"
                    }
                },
                params: {
                    id: null,
                    transactionId: null,
                    currencyCode: null,
                    accountRef: null
                },
                title: 'History'
            });
    }

})();