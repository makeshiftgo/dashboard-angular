(function () {
    'use strict';

    angular.module('BlurAdmin.pages.services.rewardsService.rewardsServiceCampaigns')
        .controller('RewardsServiceCampaignsCtrl', RewardsServiceCampaignsCtrl);

    /** @ngInject */
    function RewardsServiceCampaignsCtrl($scope,$http,localStorageManagement,$location,
                                         $uibModal,$ngConfirm,toastr,errorHandler) {

        var vm = this;
        vm.token = localStorageManagement.getValue('TOKEN');
        vm.baseUrl = localStorageManagement.getValue('SERVICEURL');
        $scope.loadingCampaigns =  false;
        $scope.campaignList = [];

        $scope.campaignsId = '';

        $scope.closeCampaignOptionsBox = function () {
            $scope.campaignsId = '';
        };

        $scope.showCampaignOptionsBox = function (campaign) {
            $scope.campaignsId = campaign.identifier;
        };

        $scope.goToCreateCampaignView = function () {
            $location.path('/services/rewards/campaigns/create');
        };

        $scope.getCampaignList = function () {
            $scope.loadingCampaigns =  true;
            if(vm.token) {
                $http.get(vm.baseUrl + 'admin/campaigns/', {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': vm.token
                    }
                }).then(function (res) {
                    if (res.status === 200) {
                        $scope.loadingCampaigns =  false;
                        if(res.data.data.results.length > 0){
                            $scope.campaignListData = res.data.data;
                            $scope.campaignListData.results.forEach(function (campaign) {
                                campaign.start_date = moment(campaign.start_date).format('MM/DD/YYYY');
                                campaign.end_date = moment(campaign.end_date).format('MM/DD/YYYY');
                            });
                            $scope.campaignList = $scope.campaignListData.results;
                        }
                    }
                }).catch(function (error) {
                    $scope.loadingCampaigns =  false;
                    errorHandler.evaluateErrors(error.data);
                    errorHandler.handleErrors(error);
                });
            }
        };
        $scope.getCampaignList();

        $scope.deleteCampaignPrompt = function(campaign) {
            $ngConfirm({
                title: 'Delete campaign',
                contentUrl: 'app/pages/services/rewardsService/rewardsServiceCampaigns/deleteCampaignPrompt.html',
                animationBounce: 1,
                animationSpeed: 100,
                scope: $scope,
                buttons: {
                    Add: {
                        text: "Delete",
                        btnClass: 'btn-default dashboard-btn',
                        keys: ['enter'], // will trigger when enter is pressed
                        action: function(scope){
                            if(scope.deleteText === 'DELETE'){
                                scope.deleteCampaign(campaign.identifier);
                            } else {
                                toastr.error('DELETE text did not match.');
                            }
                        }
                    },
                    close: {
                        text: "Cancel",
                        btnClass: 'btn-primary dashboard-btn'
                    }
                }
            });
        };

        $scope.deleteCampaign = function (campaignIdentifier) {
            if(vm.token) {
                $scope.loadingCampaigns = true;
                $http.delete(vm.baseUrl + 'admin/campaigns/' + campaignIdentifier + '/', {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': vm.token
                    }
                }).then(function (res) {
                    if (res.status === 200) {
                        toastr.success('Reward campaign has been successfully deleted');
                        $scope.getCampaignList();
                    }
                }).catch(function (error) {
                    $scope.loadingCampaigns =  false;
                    errorHandler.evaluateErrors(error.data);
                    errorHandler.handleErrors(error);
                });
            }
        };

        $scope.openRewardUserModal = function (page, size,campaign) {
            vm.theModal = $uibModal.open({
                animation: true,
                templateUrl: page,
                size: size,
                controller: 'RewardUserModalCtrl',
                resolve: {
                    campaign: function () {
                        return campaign;
                    }
                }
            });

            vm.theModal.result.then(function(){

            }, function(){
            });
        };

        $scope.openEditCampaignView = function (campaign) {
            $location.path('/services/rewards/campaigns/' + campaign.identifier + '/edit');
        };


    }
})();
