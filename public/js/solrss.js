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

app.controller(
    'NavberController',
    ["$scope", "$resource", "$routeParams", "$location", "$filter",
     function($scope, $resource, $routeParams, $location, $filter) {
         $scope.$on('$routeChangeSuccess', function(next, current) {
             switch($location.path()) {
             case '/rssindex':
                 var d = parseDate($routeParams.date);
                 if(!d) {
                     d = new Date();
                 }
                 $scope.brandText = $filter('date')(d, 'yyyy/MM/dd');
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

app.controller('DateSelectController', [
    '$scope', '$resource', "$routeParams", '$q', '$location', '$filter',
    function($scope, $resource, $routeParams, $q, $location, $filter) {

        $scope.today = function() {
            $scope.rssDate = new Date();
        };

        $scope.view = function() {
            $location.path('/rssindex').search({date: $filter('date')($scope.rssDate, 'yyyyMMdd')});
        };

        $scope.rssDate = parseDate($routeParams.date);
        if(!$scope.rssDate) {
            $scope.rssDate = new Date();
        }

        $scope.maxRssDate = new Date();
    }]);

app.controller('RssIndexController', [
    '$scope', '$resource', "$routeParams", '$q', 
    function($scope, $resource, $routeParams, $q) {
        
        var RssService = $resource('/rss/:id', 
                                   {id: '@id'},
                                   {update: {method: 'POST', 
                                             headers: {
                                                 'Content-Type': 'application/json'
                                             }}});

        $scope.load = function(reload, rssSite) {

            if(!reload) {
                $scope.rsses = [];
                $scope.rsses_bg = [];
            }

            $scope.rssDate = parseDate($routeParams.date);
            if(!$scope.rssDate) {
                $scope.rssDate = new Date();
            }

            $scope.maxRssDate = new Date();


            if ($scope.rsses_bg.length > 0) {
                update_rss_view();
                background_load(rssSite);
            } else {
                background_load(rssSite).then(
                    function(result) {
                        update_rss_view();
                        background_load(rssSite);
                    },
                    function(reason) {
                        alert(reason);
                    }
                );
            }
        };

        var update_rss_view = function(newrss) {
            $scope.rsses   = $scope.rsses.concat($scope.rsses_bg);
            $scope.rsses_bg = [];
        };

        var background_load = function(rssSite) {
            
            var q = {};
            if(rssSite) {
                q.rssSite = rssSite;
            }

            var rd = $scope.rssDate;

            q.beginDate = new Date(rd.getFullYear(), rd.getMonth(), rd.getDate(), 23, 59, 59, 999).getTime();

            if($scope.rsses.length > 0) {
                var last = $scope.rsses[$scope.rsses.length - 1];
                q.beginDate = last.mili_time;
                q.beginID   = last._id;
            }
            
            q.endDate   = new Date(rd.getFullYear(), rd.getMonth(), rd.getDate(), 0, 0, 0, 0).getTime();

            console.log("q=", q);

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
            $scope.load(true, '');
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
    }
]);

app.controller('RssSiteIndexController', [
    '$scope', '$resource', "$routeParams", '$q', 
    function($scope, $resource, $routeParams, $q) {
        
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
            RssSiteService.remove({id: rss._id});
            $scope.rssSites = _.reject($scope.rssSites, 
                                       function(i){return i._id == rss._id;});
        };
    }
]);
