'use strict';

angular.module('BlurAdmin', [
    'ngFileUpload',
    'ngCookies',
    'ngAnimate',
    'ui.bootstrap',
    'ui.router',
    'toastr',
    'countrySelect',
    'iso-3166-country-codes',

    'BlurAdmin.theme',
    'BlurAdmin.pages'
])

    .constant('API', 'https://staging.rehive.com/api/3')

    .run(function($cookies,$rootScope,cookieManagement,userVerification,$http,API,$location,_){

        //using to check if user is in changing password or setting up 2 factor authentication
        $rootScope.securityConfigured = true;


        var locationChangeStart = $rootScope.$on('$locationChangeStart', function (event,newUrl) {
            routeManagement(event,newUrl);
        });

        function routeManagement(event,newUrl){

            console.log($rootScope);

            var token = cookieManagement.getCookie('TOKEN');

            //using to check if user has a verified email address
            userVerification.verify(function(err,verified){
                if(verified){
                    $rootScope.userVerified = true;
                } else {
                    $rootScope.userVerified = false;
                }
            });

            //using to check if user has a company name
            var getCompanyInfo = function () {
                if(token && $rootScope.userVerified) {
                    $http.get(API + '/admin/company/', {
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': token
                        }
                    }).then(function (res) {
                        if (res.status === 200) {
                            if(res.data.data && res.data.data.name){
                                $rootScope.haveCompanyName = true;
                                $rootScope.companyName = res.data.data.name;
                            }
                        }
                    }).catch(function (error) {
                        $rootScope.haveCompanyName = false;
                    });
                }
            };
            getCompanyInfo();

            var newUrlArray = newUrl.split('/'),
                newUrlLastElement = _.last(newUrlArray);

            if(newUrlLastElement == 'login'){
                cookieManagement.deleteCookie('TOKEN');
                $rootScope.gotToken = false;
                $location.path('/login');
            } else{
                if(token) {
                    $rootScope.gotToken = true;
                } else if(newUrlLastElement == 'register' || newUrlLastElement == 'reset'
                    || newUrlLastElement == 'verification' || newUrlLastElement == 'name_request'){
                    // do nothing
                } else {
                    cookieManagement.deleteCookie('TOKEN');
                    $rootScope.gotToken = false;
                    $location.path('/login');
                }

            }

            //checking if changing password or setting up 2 factor authentication
            if(newUrlLastElement == 'change' || newUrlLastElement == 'two-factor'){
                $rootScope.securityConfigured = false;
            }
        }
    });


