(function () {
    'use strict';

    angular.module('BlurAdmin.pages.services.productService.ordersList')
        .controller('OrdersCtrl', OrdersCtrl);

    /** @ngInject */
    function OrdersCtrl($scope,$http,Rehive,localStorageManagement,serializeFiltersService,
                        $uibModal,errorHandler,typeaheadService) {

        var vm = this;
        vm.token = localStorageManagement.getValue('TOKEN');
        vm.serviceUrl = localStorageManagement.getValue('SERVICEURL');
        vm.companyIdentifier = localStorageManagement.getValue('companyIdentifier');
        $scope.statusOptions = ['Pending','Complete','Failed'];
        $scope.loadingOrders = false;
        $scope.ordersFiltersCount = 0;
        $scope.showingOrdersFilters = false;
        $scope.ordersList = [];
        $scope.currencyOptions = [];

        $scope.ordersPagination = {
            itemsPerPage: 25,
            pageNo: 1,
            maxSize: 5
        };

        $scope.ordersFiltersObj = {
            idFilter: false,
            userFilter: false,
            statusFilter: false,
            currencyFilter: false,
            totalPriceFilter: false
        };
        $scope.applyOrdersFiltersObj = {
            idFilter: {
                selectedId: null
            },
            userFilter: {
                selectedUser: null
            },
            statusFilter: {
                selectedStatus: 'Pending'
            },
            currencyFilter: {
                selectedCurrency: {}
            },
            totalPriceFilter: {
                selectedTotalPrice: null
            }
        };

        vm.getCompanyCurrencies = function () {
            Rehive.admin.currencies.get({filters: {
                page_size: 250,
                archived: false
            }}).then(function (res) {
                if(res.results.length > 0){
                    $scope.currencyOptions = res.results;
                    $scope.applyOrdersFiltersObj.currencyFilter.selectedCurrency = res.results[0];
                    $scope.$apply();
                }
            }, function (error) {
                errorHandler.evaluateErrors(error);
                errorHandler.handleErrors(error);
                $scope.$apply();
            });
        };
        vm.getCompanyCurrencies();

        $scope.clearOrdersFilters = function () {
            $scope.ordersFiltersObj = {
                idFilter: false,
                userFilter: false,
                statusFilter: false,
                currencyFilter: false,
                totalPriceFilter: false
            };
        };

        $scope.getUsersEmailTypeahead = typeaheadService.getUsersEmailTypeahead();

        $scope.showOrdersFilters = function () {
            $scope.showingOrdersFilters = !$scope.showingOrdersFilters;
        };

        vm.getOrdersUrl = function(){
            $scope.ordersFiltersCount = 0;

            for(var x in $scope.ordersFiltersObj){
                if($scope.ordersFiltersObj.hasOwnProperty(x)){
                    if($scope.ordersFiltersObj[x]){
                        $scope.ordersFiltersCount = $scope.ordersFiltersCount + 1;
                    }
                }
            }

            var searchObj = {
                page: $scope.ordersPagination.pageNo,
                page_size: $scope.ordersPagination.itemsPerPage || 25,
                id: $scope.ordersFiltersObj.idFilter ? $scope.applyOrdersFiltersObj.idFilter.selectedId : null,
                user: $scope.ordersFiltersObj.userFilter ? ($scope.applyOrdersFiltersObj.userFilter.selectedUser ? $scope.applyOrdersFiltersObj.userFilter.selectedUser : null) : null,
                status: $scope.ordersFiltersObj.statusFilter ? ($scope.applyOrdersFiltersObj.statusFilter.selectedStatus ? $scope.applyOrdersFiltersObj.statusFilter.selectedStatus.toLowerCase() : null): null,
                currency: $scope.ordersFiltersObj.currencyFilter ? ($scope.applyOrdersFiltersObj.currencyFilter.selectedCurrency.code ? $scope.applyOrdersFiltersObj.currencyFilter.selectedCurrency.code : null): null,
                total_price: $scope.ordersFiltersObj.totalPriceFilter ? ($scope.applyOrdersFiltersObj.totalPriceFilter.selectedTotalPrice ? $scope.applyOrdersFiltersObj.totalPriceFilter.selectedTotalPrice : null): null
            };

            return vm.serviceUrl + 'admin/orders/?' + serializeFiltersService.serializeFilters(searchObj);
        };

        $scope.getOrdersLists = function (applyFilter) {
            $scope.loadingOrders = true;

            $scope.showingOrdersFilters = false;

            if (applyFilter) {
                // if function is called from history-filters directive, then pageNo set to 1
                $scope.ordersPagination.pageNo = 1;
            }

            if ($scope.ordersList.length > 0) {
                $scope.ordersList.length = 0;
            }

            var ordersUrl = vm.getOrdersUrl();

            if(vm.token) {
                $http.get(ordersUrl, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': vm.token
                    }
                }).then(function (res) {
                    if (res.status === 200) {
                        if(res.data.data.results.length > 0){
                            $scope.ordersListData = res.data.data;
                            $scope.ordersList = $scope.ordersListData.results;
                            $scope.loadingOrders = false;
                        } else {
                            $scope.loadingOrders = false;
                        }
                    }
                }).catch(function (error) {
                    $scope.loadingOrders = false;
                    errorHandler.evaluateErrors(error.data);
                    errorHandler.handleErrors(error);
                });
            }
        };
        $scope.getOrdersLists();

        $scope.displayOrderModal = function (page,size,orderObj) {
            vm.theModal = $uibModal.open({
                animation: true,
                templateUrl: page,
                size: size,
                controller: 'DisplayOrderModalCtrl',
                resolve: {
                    order: function () {
                        return orderObj;
                    }
                }
            });

            vm.theModal.result.then(function(order){
                if(order){
                    $scope.getOrdersLists();
                }
            }, function(){
            });
        };

    }
})();
