angular.module('app', ['ngResource']).
    directive('jqlist', function() {
        return function($scope, el, attr) {
            el.listview('refresh');
        }
    });

function RssCtrl($scope,$resource) {

    $scope.load = function(rssSite) {
        var rss = $resource('/rss/:id');
        
        var q = {};
        if(rssSite) {
            q.rssSite = rssSite;
        }

        rss.query(q, function(r, h) {
            r = _.map(r, function(i) {
                i.date = new Date(i.date);
                return i;
            });
            // r =  r.sort(function(a, b) {
            //     return b.date.getTime() - a.date.getTime();
            // });
            r = _.groupBy(r,
                          function(i) {
                              return "" + i.date.getFullYear() + 
                                  "/" + (i.date.getMonth()+1) + 
                                  "/" + i.date.getDate();
                          });
            r = _.pairs(r);
            $scope.rsses = r;
        });
    }

    update = function(rss) {
        rss.$save({id: rss._id},
                  function(i) {
                      i.date = new Date(i.date);
                      return i;
                  });
    },

    $scope.jump = function(rss) {
        window.open(rss.link , "_blank");
        rss.read = true;
        update(rss);
    }

    $scope.rssStyle = function(rss) {
        return rss.read ? {color: "rgb(128, 128, 128)"} : {};
    }

    $scope.rssReadStyle = function(rss) {
        return rss.read ? {color: "rgb(128, 128, 128)"} : {};
    }

    $scope.rssReadValue = function(rss) {
        return rss.read ? "既読" : "未読";
    }

    $scope.rssFavoriteStyle = function(rss) {
        return rss.favorite ? {} : {color: "rgb(128, 128, 128)"};
    }

    $scope.rssFavoriteTheme = function(rss) {
        return rss.favorite ? "e" : "c";
    }

    $scope.changeRead = function(rss) {
        rss.read = !rss.read;
        update(rss);
    }

    $scope.changeFavorite = function(rss) {
        rss.favorite = !rss.favorite;
        update(rss);
    }
}
