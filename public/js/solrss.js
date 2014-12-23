var app = angular.module('app', ['ngResource', 'mobile-angular-ui']);

app.controller('RssCtrl', [
    '$scope', '$resource', '$q', 
    function($scope, $resource, $q) {

        $scope.load = function(reload, rssSite) {

            if(!reload) {
                $scope.rsses = [];
                $scope.rsses_bg = [];
            }

            if ($scope.rsses_bg.length > 0) {
                update_rss_view($scope.rsses_bg);
                background_load(rssSite);
            } else {
                background_load(rssSite).then(
                    function(result) {
                        update_rss_view($scope.rsses_bg);
                        background_load(rssSite);
                    },
                    function(reason) {
                        alert(reason);
                    }
                );
            }
        };

        update_rss_view = function(newrss) {
            $scope.rsses   = $scope.rsses.concat(newrss);

            $scope.rssGrps = _.pairs(_.groupBy($scope.rsses,
                                               function(i) {
                                                   return "" + i.date.getFullYear() + 
                                                       "/" + (i.date.getMonth()+1) + 
                                                       "/" + i.date.getDate();
                                               }));    
        };

        background_load = function(rssSite) {
            $scope.rsses_bg = [];

            var rss = $resource('/rss/:id');
            
            var q = {};
            if(rssSite) {
                q.rssSite = rssSite;
            }

            if($scope.rsses.length > 0) {
                var last = $scope.rsses[$scope.rsses.length - 1];
                q.beginDate = last.mili_time;
                q.beginID   = last._id;
            }
            //q.endDate   = (new Date(2014,12-1,14)).getTime();

            var deferred = $q.defer();
            rss.query(q, function(r, h) {
                r = _.map(r, function(i) {
                    i.date = new Date(i.date);
                    return i;
                });
                r =  r.sort(function(a, b) {
                    return b.date.getTime() - a.date.getTime();
                });
                $scope.rsses_bg = r;

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
