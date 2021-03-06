(function () {
    'use strict';

    angular.module('BlurAdmin.pages.developers.webhooks')
        .controller('WebhooksCtrl', WebhooksCtrl);

    /** @ngInject */
    function WebhooksCtrl($rootScope,$scope,$location,$state) {

        var vm = this;
        vm.updatedWebhook = {};
        $rootScope.dashboardTitle = 'Webhooks | Rehive';
        $scope.loadingWebhooks = true;
        vm.location = $location.path();
        vm.locationArray = vm.location.split('/');
        $scope.locationIndicator = vm.locationArray[vm.locationArray.length - 1];

        $scope.$on('$locationChangeStart', function (event,newUrl) {
            vm.location = $location.path();
            vm.locationArray = vm.location.split('/');
            $scope.locationIndicator = vm.locationArray[vm.locationArray.length - 1];
        });

    }
})();
