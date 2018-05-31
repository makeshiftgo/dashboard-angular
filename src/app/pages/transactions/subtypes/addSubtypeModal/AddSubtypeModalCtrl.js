(function () {
    'use strict';

    angular.module('BlurAdmin.pages.transactions.subtypes')
        .controller('AddSubtypeModalCtrl', AddSubtypeModalCtrl);

    function AddSubtypeModalCtrl($scope,Rehive,$uibModalInstance,toastr,$filter,localStorageManagement,errorHandler) {

        var vm = this;
        vm.token = localStorageManagement.getValue('TOKEN');
        $scope.addingSubtype = false;
        $scope.newSubtype = {tx_type: 'credit'};

        $scope.subtypeNameChanged = function (subtype) {
            if(subtype.name){
                subtype.name = subtype.name.toLowerCase();
                subtype.label = $filter('capitalizeWord')(subtype.name).replace(/_/g, " ").replace(/-/g, " ");
            } else {
                subtype.label = '';
            }
        };

        $scope.addSubtype = function(){
            $scope.addingSubtype = true;
            Rehive.admin.subtypes.create($scope.newSubtype).then(function (res) {
                $scope.addingSubtype = false;
                toastr.success('You have successfully added a new subtype');
                $uibModalInstance.close(true);
                $scope.$apply();
            }, function (error) {
                $scope.addingSubtype = false;
                errorHandler.evaluateErrors(error);
                errorHandler.handleErrors(error);
                $scope.$apply();
            });
        };



    }
})();
