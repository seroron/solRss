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

app.config(['$routeProvider',
            function($routeProvider) {
                $routeProvider.
                    when('/rssindex', {
                        templateUrl: 'rssIndex.html',
                        controller: 'RssIndexController'
                    }).
                    when('/dateselect', {
                        templateUrl: 'dateSelect.html',
                        controller: 'DateSelectController'
                    }).
                    otherwise({
                        redirectTo: '/rssindex'
                    });
            }]);


app.controller(
    'NavberController',
    ["$scope", "$resource", "$routeParams",
     function($scope, $resource, $routeParams) {


         $scope.$on('$routeChangeSuccess', function(next, current) { 
             $scope.rssDate = parseDate($routeParams.date);
             // if(!$scope.rssDate) {
             //     $scope.rssDate = new Date();
             // }
             
         });


         $scope.$watch(function() {
             return $routeParams.date;
         }, function(nVal,oVal) {
             console.log("---", nVal);             
             console.log("---", oVal);
         });
     }]);


app.controller('DateSelectController', [
    '$scope', '$resource', "$routeParams", '$q', 
    function($scope, $resource, $routeParams, $q) {

        $scope.today = function() {
            $scope.rssDate = new Date();
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

        update_rss_view = function(newrss) {
            $scope.rsses   = $scope.rsses.concat($scope.rsses_bg);
            $scope.rsses_bg = [];
        };

        background_load = function(rssSite) {
            var rss = $resource('/rss/:id');
            
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
            rss.query(q, function(r, h) {
                r = _.map(r, function(i) {
                    i.date = new Date(i.date);
                    return i;
                });
                r =  r.sort(function(a, b) {
                    return b.date.getTime() - a.date.getTime();
                });
                // console.log("1 " + r);
                // console.log("2 " + $scope.rsses_bg);
                //$scope.rsses_bg.concat(r);
                $scope.rsses_bg = r;
                // console.log("3 " + $scope.rsses_bg);

                deferred.resolve("ok");
            }, function(err) {
                deferred.reject("load fail");
            });
            
            return deferred.promise;
        };

        update = function(rss) {
            rss.$save({id: rss._id},
                      function(i) {
                          i.date = new Date(i.date);
                          return i;
                      });
        };

        $scope.loadArticles = function() {
            $scope.load(true, '');
        };

        $scope.jump = function(rss) {
            window.open(rss.link , "_blank");
            rss.read = true;
            update(rss);
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
            update(rss);
        };

        $scope.changeFavorite = function(rss) {
            rss.favorite = !rss.favorite;
            update(rss);
        };
    }
]);
