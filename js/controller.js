// CONTROLLERS
function ListCtrl($scope, $route, $routeParams, $location, openSecrets, locationService) {
	var self = this;

	self.states = openSecrets.getStates(); ///////change when new state service is built

	$scope.geolocate = geolocate;
	$scope.getDistrict = getDistrict;
	$scope.isMyDistrict = isMyDistrict;
	$scope.isMyRep = isMyRep;
	$scope.submitZip = submitZip;
	$scope.position = [];
	$scope.myDistricts = [];
	$scope.myState;

	$scope.state = $routeParams.stateId;
	$scope.reps = [];

	$scope.$watch('state', function(val) {
		if (typeof val !== 'undefined') {
			// Update full name of state
			self.stateName = openSecrets.getStateName(val);

			// Updates list of congresspersons.
			openSecrets.getRepsByState(val, function(list){
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
    	// If we're not going to a rep detail page, don't refresh.
    	if ($location.path().indexOf('rep') === -1) {
	        $route.current = lastRoute;
    	}
    });

    function geolocate() {
    	if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(function(pos){
				$scope.$apply(function(){

					$scope.position = [];
					$scope.position.push(pos.coords.latitude.toFixed(2));
					$scope.position.push(pos.coords.longitude.toFixed(2));

					$scope.getDistrict();

				});
			});
		}
    }

    function submitZip(zip) {

    	$scope.position = [];
    	$scope.position.push(zip);

    	$scope.getDistrict();
    }

    function getDistrict(){
		locationService.getDistrict($scope.position, function(data, state) {
			$scope.myState = state;
			$scope.myDistricts = [];
			$scope.state = state;

			angular.forEach(data, function(item) {
				$scope.myDistricts.push(item['district']);
			});
		});
	}

	function isMyDistrict(rep) {
		return ($scope.myDistricts.indexOf(rep['district']) === -1) && ($scope.myState === $scope.state);
	}

	function isMyRep(rep) {
		return (!isMyDistrict(rep) || rep['office'] === 'Sen.') && $scope.state === $scope.myState;
	}

};


//TODO: Marge with ListCtrl and then fix the resulting bug where updating $scope.state from the detail page doesn't update the view.
function DetailCtrl($scope, openSecrets, $routeParams) {
	var self = this;

	$scope.rep = {};

	if ($routeParams.repId != null) {

		openSecrets.getRepSummary($routeParams.repId, function(data){
			$scope.rep = data;
		});

		openSecrets.getRepIndustry($routeParams.repId, function(data){
			$scope.rep.industries = data;
		});
	}

}