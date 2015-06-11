


// CONTROLLERS
function ListCtrl($scope, $route, $routeParams, $location, openSecrets) {
	var self = this;

	$scope.state = $routeParams.stateId;

	self.query = '';
	self.reps = [];
	self.states = openSecrets.getStates();

	$scope.$watch('state', function(val) {
		if (typeof val !== 'undefined') {
			// Update full name of state
			self.stateName = openSecrets.getStateName($scope.state);

			// Updates list of congresspersons.
			updateList(val);
			
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

	function updateList(state_id){
		if (state_id) {
			openSecrets.getRepsByState(state_id, function(data){
				self.reps = data.response['legislator'];
				// self.reps = self.reps.reverse();
			});
		}
	}	

	function updateState() {
		$scope.state = selectedState;
	}

	// self.clearSearch = clearSearch;

	// function clearSearch() {
	// 	self.query = '';
	// }
};

function RepPanelCtrl ($scope) {
	var self = this;

	self.parseOffice = {
		getTitle: function (code) {
			//Check the office code for S to indicate Senator.
			if (code.charAt(2) === 'S') {
				self.rep = false;
				return 'Sen.';
			} 
			else {
				self.rep = true;
				return 'Rep.';
			}
		},
		getDistrict: function(code) {
			return parseInt(code.slice(2,4), 10);
		}
		
	}
}

function IndustryCtrl ($scope) {}


function DetailCtrl($scope, openSecrets, $routeParams) {
	var self = this;

	self.repId = $routeParams.repId;
	self.hasDebt = false;

	// if ($routeParams.repId != null) {
	//     $scope.rep = $scope.openSecrets($routeParams.repId);
	// }

	openSecrets.getRepSummary(self.repId, function(data){
		self.summary = data.response['summary']['@attributes'];
		self.chamber = getChamber();
		self.party = getParty();
		self.name = reverseName(self.summary['cand_name']);
		self.hasDebt = self.summary['debt'] > 0 ? true : false;
	});

	openSecrets.getRepIndustry(self.repId, function(data){
		self.industries = data.response['industries']['industry'];
	});

	function reverseName(name) {
		var namePieces = name.split(' ');

		if (namePieces[namePieces.length - 1] === "Jr" || namePieces[namePieces.length - 1] === "Sr") {
			var suffix = namePieces.pop();
		}

		namePieces = namePieces.join(' ').split(',').reverse();

		if (suffix) { namePieces.push(suffix); }

		return namePieces.join(' ');
	}

	function getChamber() {
		var chamberId = self.summary['chamber'];
		if (chamberId === "H") {
			return "Representative"
		} else if (chamberId === "S") {
			return "Senator"
		}
	}

	function getParty() {
		var partyId = self.summary['party'];
		if (partyId === "R") {
			return "Republican"
		} else if (partyId === "D") {
			return "Democrat"
		} else {
			return "Independent"
		}
	}

}