

angular.module('app', ['ngResource']).
    directive('jqlist', function() {
        return function($scope, el, attr) {
            el.listview('refresh');
        }
    });

function RssCtrl($scope,$resource) {
    var rss = $resource('/rss');
    
    rss.query({}, function(r, h) {
        r = _.map(r, function(i) {
            i.date = new Date(i.date);
//            i.read = i.read ? "read_rss" : ""
            return i;
        });
        r =  r.sort(function(a, b) {
            return b.date.getTime() - a.date.getTime();
        });
        r = _.groupBy(r,
                      function(i) {
                          return "" + i.date.getFullYear() + 
                              "/" + (i.date.getMonth()+1) + 
                              "/" + i.date.getDate();
                      });
        r = _.pairs(r);
        $scope.rsses = r;
    });

    $scope.jump = function(rss) {
        rss.read = true;
        t = $scope.rsses;
        $scope.rsses = t;
        console.log($scope.rsses );
        window.open("/rss/"+rss._id , "_blank");
    }

    $scope.rssStyle = function(rss) {
        return rss.read ? {color: "rgb(128, 128, 128)"} : {};
    }
}
