angular.
    module('app', ['ngResource']).
    directive('jqlist', function() {
        return function($scope, el, attr) {
            el.listview('refresh');
        }
    }).
    directive('jqButton', function() {
        return function(scope, element, attrs) {
            element.button();

            scope.$watch(attrs.jqButtonDisabled, function(value) {
                //element.button("option", "disabled", value);
                element.button(value ? 'disable' : 'enable');
                element.button('refresh');
            });
        };
    });

function RssCtrl($scope,$resource) {

    $scope.load = function(reload, rssSite) {
        var rss = $resource('/rss/:id');

        $scope.loadArticleDisable = true;
        
        var q = {};
        if(rssSite) {
            q.rssSite = rssSite;
        }

        console.log(reload);
        if(reload) {
            var last = $scope.rsses[$scope.rsses.length - 1];
            q.beginDate = last.mili_time;
            q.beginID   = last._id;
        } else {
            $scope.rsses = []
        }

        rss.query(q, function(r, h) {
            r = _.map(r, function(i) {
                i.date = new Date(i.date);
                return i;
            });
            r =  r.sort(function(a, b) {
                return b.date.getTime() - a.date.getTime();
            });
            $scope.rsses   = $scope.rsses.concat(r);

            $scope.rssGrps = _.pairs(_.groupBy($scope.rsses,
                                               function(i) {
                                                   return "" + i.date.getFullYear() + 
                                                       "/" + (i.date.getMonth()+1) + 
                                                       "/" + i.date.getDate();
                                               }));

            $scope.loadArticleDisable = false;
        });
    }

    update = function(rss) {
        rss.$save({id: rss._id},
                  function(i) {
                      i.date = new Date(i.date);
                      return i;
                  });
    }

    $scope.loadArticles = function() {
        //   rss_buf = $scope.rsses;
        // console.log($scope.rsses);
        // console.log("" + $scope.lastArticle.date);
        $scope.load(true, '');
    }

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
