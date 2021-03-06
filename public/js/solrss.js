var parseDate = function(str) {
    if(!str) return new Date();

    var y = str.slice(0, 4);
    var m = str.slice(4, 6);
    var d = str.slice(6, 8);
    var dt = new Date(y, m-1, d);
    if(dt == null || dt.getFullYear() != y || dt.getMonth() + 1 != m || dt.getDate() != d) {
        return new Date();
    }

    return dt;
};

var app = angular.module('app', ['ngRoute', 'ngResource', 'ui.bootstrap']);

app.config(['$locationProvider', function($locationProvider) {
    $locationProvider.html5Mode(true);
}]);

app.config(['$routeProvider',
            function($routeProvider, $locationProvider) {
                $routeProvider.
                    when('/rssindex', {
                        templateUrl: 'rssIndex.html',
                        controller: 'RssIndexController'
                    }).
                    when('/dateselect', {
                        templateUrl: 'dateSelect.html',
                        controller: 'DateSelectController'
                    }).
                    when('/rssSiteIndex', {
                        templateUrl: 'rssSiteIndex.html',
                        controller: 'RssSiteIndexController'
                    }).                    
                    otherwise({
                        redirectTo: '/rssindex'
                    });
            }]);

app.directive('whenScrolled', function($window) {
  return function(scope,  elem,  attr) {
    var raw = elem[0];
    angular.element($window).bind('scroll',  function() {
        if (raw.offsetTop < (window.scrollY || window.pageYOffset) + window.innerHeight) {
            scope.$apply(attr.whenScrolled);
        }
    });
  };
});

app.controller(
    'NavberController',
    ["$scope", "$resource", "$routeParams", "$location", "$filter",
     function($scope, $resource, $routeParams, $location, $filter) {
         $scope.$on('$routeChangeSuccess', function(next, current) {
             switch($location.path()) {
             case '/rssindex':
                 if($routeParams.rssSite) {
                     $scope.brandText = 'Site';                     
                 } else if($routeParams.favorite) {
                     $scope.brandText = 'Favorite';                     
                 } else {
                     var d = parseDate($routeParams.date);
                     if(!d) {
                         d = new Date();
                     }
                     $scope.brandText = $filter('date')(d, 'yyyy/MM/dd');
                 }
                 break;

             case '/rssSiteIndex':
                 $scope.brandText = 'SiteIndex';
                 break;
             }
         });

         $scope.jump = function() {
             switch($location.path()) {
             case '/rssindex':
                 $location.path('/dateselect').search($routeParams);
                 break;

             case '/rssSiteIndex':
                 // do nothing
                 break;
             }

         };
     }]);

app.controller(
    'AlertController',
    ["$scope", "$resource", "$routeParams", "$location", "$filter",
     function($scope, $resource, $routeParams, $location, $filter) {
         $scope.alerts = [];
         
         $scope.$on('AlertController_showAlert', function(event, args) {
             $scope.alerts.push(args);
         });

         $scope.closeAlert = function(index) {
             $scope.alerts.splice(index, 1);
         };
     }]);

app.controller('DateSelectController', [
    '$scope', '$resource', "$routeParams", '$q', '$location', '$filter',
    function($scope, $resource, $routeParams, $q, $location, $filter) {

        $scope.today = function() {
            $scope.rssDate = new Date();
        };

        $scope.showSelectedDate = function() {
            $location.path('/rssindex').search({date: $filter('date')($scope.rssDate, 'yyyyMMdd')});
        };

        $scope.showFavorite = function() {
            $location.path('/rssindex').search({favorite: true});
        };

        $scope.rssDate = parseDate($routeParams.date);
        if(!$scope.rssDate) {
            $scope.rssDate = new Date();
        }

        $scope.maxRssDate = new Date();
    }]);

app.controller('RssIndexController', [
    '$scope', '$resource', "$routeParams", '$q', "$location", "$filter", "$rootScope", 
    function($scope, $resource, $routeParams, $q, $location, $filter, $rootScope) {
        
        var RssService = $resource('/rss/:id', 
                                   {id: '@id'},
                                   {update: {method: 'POST', 
                                             headers: {
                                                 'Content-Type': 'application/json'
                                             }}});

        $scope.load = function(reload) {
            if($scope.rssLoading) {
                return;
            }
            
            $scope.rssLoading = true;
            
            if(!reload) {
                $scope.rsses = [];
                $scope.rsses_bg = [];
                $scope.rssLast = false;
            }

            $scope.rssDate = parseDate($routeParams.date);
            if(!$scope.rssDate) {
                $scope.rssDate = new Date();
            }

            $scope.maxRssDate = new Date();

            if ($scope.rsses_bg.length > 0) {
                $scope.rsses   = $scope.rsses.concat($scope.rsses_bg);
                $scope.rsses_bg = [];
                $scope.rssLoading = false;
                background_load();
            } else {
                background_load().then(
                    function(result) {
                        if($scope.rsses_bg.length > 0) {
                            $scope.rsses   = $scope.rsses.concat($scope.rsses_bg);
                            $scope.rsses_bg = [];
                            $scope.rssLoading = false;
                            background_load();
                        } else {
                            $scope.rssLoading = false;
                            $scope.rssLast = true;
                        }
                    },
                    function(reason) {
                        $scope.rssLoading = false;
                        $rootScope.$broadcast('AlertController_showAlert', {type: 'error', msg: reason});
                    }
                );
            }
        };

        var background_load = function(rssSite) {
            
            var day0oclock = new Date($scope.rssDate.getFullYear(), $scope.rssDate.getMonth(),
                                      $scope.rssDate.getDate(), 0, 0, 0, 0).getTime();

            var q = {};
            if($routeParams.rssSite) {
                q.rssSite = $routeParams.rssSite;
            } else if($routeParams.favorite) {
                q.favorite = true;
            } else {
                q.endDate = day0oclock;
            }
            
            if($scope.rsses.length > 0) {
                var last = $scope.rsses[$scope.rsses.length - 1];
                q.beginDate = last.mili_time;
                q.beginID   = last._id;
            } else {
                q.beginDate = day0oclock + 60*60*24*1000;
            }
            
            var deferred = $q.defer();
            RssService.query(q, function(r, h) {                
                r = _.map(r, function(i) {
                    i.date = new Date(i.date);
                    return i;
                });
                r =  r.sort(function(a, b) {
                    return b.mili_time - a.mili_time;
                });
                $scope.rsses_bg = r;

                deferred.resolve("ok");
            }, function(err) {
                deferred.reject("load fail");
            });
            
            return deferred.promise;
        };

        $scope.loadArticles = function() {
            $scope.load(true);
        };

        $scope.jump = function(rss) {
            rss.read = true;
            window.open(rss.link , "_blank");
            RssService.update({id: rss._id}, {read: true});
        };

        $scope.rssStyle = function(rss) {
            return rss.read ? {color: "rgb(128, 128, 128)"} : {};
        };

        $scope.rssReadStyle = function(rss) {
            return rss.read ? {color: "rgb(128, 128, 128)"} : {};
        };

        $scope.isRead = function(rss) {
            return rss.read;
        };        

        $scope.isFavorite = function(rss) {
            return rss.favorite;
        };

        $scope.changeRead = function(rss) {
            rss.read = !rss.read;
            RssService.update({id: rss._id}, {read: rss.read});
        };

        $scope.changeFavorite = function(rss) {
            rss.favorite = !rss.favorite;
            RssService.update({id: rss._id}, {favorite: rss.favorite});
        };

        $scope.goTomorrow = function() {
            var d = $scope.rssDate.getTime() + 60*60*24*1000;
            $location.path('/rssindex').search({date: $filter('date')(new Date(d), 'yyyyMMdd')});
        };

        $scope.goYesterday = function() {
            var d = $scope.rssDate.getTime() - 60*60*24*1000;
            $location.path('/rssindex').search({date: $filter('date')(new Date(d), 'yyyyMMdd')});
        };

        $scope.isToday = function() {
            var a = new Date();
            var b = $scope.rssDate;
            return a.getFullYear() == b.getFullYear() &&
                a.getMonth() == b.getMonth() &&
                a.getDate() == b.getDate();
        };
    }
]);

app.controller('RssSiteIndexController', [
    '$scope', '$resource', "$routeParams", '$q', '$rootScope', '$location', 
    function($scope, $resource, $routeParams, $q, $rootScope, $location) {
        
        var RssSiteService = $resource('/rssSite/:id', 
                                       {id: '@_id'});

        $scope.load = function(reload, rssSite) {

            var deferred = $q.defer();
            RssSiteService.query({}, function(r, h) {
                $scope.rssSites = r;
                deferred.resolve("ok");
            }, function(err) {
                deferred.reject("load fail");
            });
            
            return deferred.promise;            
        };

        $scope.delSite = function(rss) {
            if (confirm("削除してよろしいですか？")) {
                RssSiteService.remove({id: rss._id});
                $scope.rssSites = _.reject($scope.rssSites, 
                                           function(i){return i._id == rss._id;});
            }
        };

        $scope.addSite = function() {
            RssSiteService.save({url: this.url},
                                function(value, responseHeaders) {
                                    $rootScope.$broadcast('AlertController_showAlert', {type: 'success', msg: "OK"});
                                },
                                function(httpResponse) {
                                    $rootScope.$broadcast('AlertController_showAlert', {type: 'danger', msg: httpResponse});
                                });
        };

        $scope.jump = function(rss) {
            $location.path('/rssindex').search({rssSite: rss._id});            
        };
    }
]);
