// CONTROLLERS
function ListCtrl($scope, $route, $routeParams, $location, openSecrets, locationService) {

    $scope.states = openSecrets.getStates(); //TODO: change when new state service is built

    $scope.state = $routeParams.stateId;
    $scope.reps = [];
    $scope.rep = {};
    $scope.repIndustries = [];

    $scope.isMyDistrict = isMyDistrict;
    $scope.isMyRep = isMyRep;

    //Methods related to locationService
    $scope.submitZip = submitZip;
    $scope.geolocate = geolocate;
    $scope.myDistricts = locationService.myDistricts;
    $scope.myState = locationService.myState;
    $scope.clearMyLocation = clearMyLocation;

    if ($routeParams.repId) {
        //Arrived on a detail page. Perform appropriate AJAX calls.
        window.scrollTo(0, 0);

        openSecrets.getRepSummary($routeParams.repId)
        .then(function(data){
            $scope.rep = data;
        });

        openSecrets.getRepIndustry($routeParams.repId)
        .then(function(data){
            $scope.repIndustries = data;
        });
    }

    $scope.$watch('state', function(val) {
        if (typeof val !== 'undefined') {
            // Clear list of reps
            $scope.reps.splice(0, $scope.reps.length);
            // Update full name of state
            self.stateName = openSecrets.getStateName(val);

            // Updates list of congresspersons.
            openSecrets.getRepsByState(val)
            .then(function(list){
                $scope.reps = list;
            });
            
            // Changes URL path but doesn't refresh the page.
            $location.path('/' + val);
        }

    });

    // Prevents page refreshing when state change updates URL. Description below.
    // Angular watches for a location change (whether it’s accomplished through typing in the location bar, clicking a link or setting the location through  $location.path()). When it senses this change, it broadcasts an event, $locationChangeSuccess, and begins the routing process. What we do is capture the event and reset the route to what it was previously. http://stackoverflow.com/questions/12422611/angularjs-paging-with-location-path-but-no-ngview-reload
    var lastRoute = $route.current;
    $scope.$on('$locationChangeSuccess', function(event, next, current) {
        // TODO: Find a more ideal way to determine if we're moving from a state list page to another state list page. Preferably detecting stateId in the routeParams
        // If navigating between rep LIST pages, don't refresh the view.
        if (current.indexOf('/rep/') === -1 && next.indexOf('/rep/') === -1) {
            $route.current = lastRoute;
        }
    });

    function geolocate() {
        $scope.geolocatingInProgress = true;

        locationService.geolocate()
        .then(function() {
            showMyState();
            $scope.geolocatingInProgress = false;
        });
    }

    function submitZip(zip) {
        $scope.ziplocatingInProgress = true;

        locationService.submitZip(zip)
        .then(function () {
            //success
            showMyState();
        }, function(err){
            //error
        })
        .finally(function() {
            $scope.ziplocatingInProgress = false;
        });
    }

    function showMyState () {
        $scope.state = $scope.myState[0];
    }

    function clearMyLocation () {
        $scope.myDistricts.splice(0, $scope.myDistricts.length); 
        $scope.myState.splice(0, $scope.myState.length);
    }

    //Functions used by ng-hide/ng-show directives

    function isMyDistrict(rep) {
        return ($scope.myDistricts.indexOf(rep['district']) === -1) && ($scope.myState[0] === $scope.state);
    }

    function isMyRep(rep) {
        return (!isMyDistrict(rep) || rep['office'] === 'Sen.') && ($scope.myState[0] === $scope.state);
    }

};