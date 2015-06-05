(function(){

angular.module('congressApp', ['ngRoute'])
	.directive('mapWidget', mapWidget)
	.directive('repList', repList)
	.directive('repPanel', repPanel)
	.directive('repDetailIndustry', repDetailIndustry)
	.factory('openSecrets', openSecrets)
	.controller('ListCtrl', ['$scope', '$routeParams', '$location', 'openSecrets', ListCtrl])
	.controller('DetailCtrl', ['$scope', 'openSecrets', '$routeParams', DetailCtrl])
	.config(routeConfig)
	;



//ROUTE CONFIG 
function routeConfig($routeProvider, $httpProvider) {

	$routeProvider
		.when('/:stateId', {
			templateUrl: 'rep-list.html',
			controller: 'ListCtrl',
			controllerAs: 'list'
		})
		.when('/rep/:repId', {
			templateUrl: 'rep-detail.html',
			controller: 'DetailCtrl',
			controllerAs: 'detail'
		})
		.when('/', {
			templateUrl: 'rep-list.html',
			controller: 'ListCtrl',
			controllerAs: 'list'
		})
		.otherwise({
			redirectTo: '/'
		});
}

// SERVICES
function openSecrets ($http) {

	var key = 'e083ad78821ccd23756c34c26b0713ff';

	function getStateName(abbr) {
		var states = {
		    "AL": "Alabama", "AK": "Alaska", "AZ": "Arizona", "AR": "Arkansas", "CA": "California", "CO": "Colorado", "CT": "Connecticut", "DE": "Delaware", "DC": "District Of Columbia", "FL": "Florida", "GA": "Georgia", "HI": "Hawaii", "ID": "Idaho", "IL": "Illinois", "IN": "Indiana", "IA": "Iowa", "KS": "Kansas", "KY": "Kentucky", "LA": "Louisiana", "ME": "Maine", "MD": "Maryland", "MA": "Massachusetts", "MI": "Michigan", "MN": "Minnesota", "MS": "Mississippi", "MO": "Missouri", "MT": "Montana", "NE": "Nebraska", "NV": "Nevada", "NH": "New Hampshire", "NJ": "New Jersey", "NM": "New Mexico", "NY": "New York", "NC": "North Carolina", "ND": "North Dakota", "OH": "Ohio", "OK": "Oklahoma", "OR": "Oregon", "PA": "Pennsylvania", "RI": "Rhode Island", "SC": "South Carolina", "SD": "South Dakota", "TN": "Tennessee", "TX": "Texas", "UT": "Utah", "VT": "Vermont", "VA": "Virginia", "WA": "Washington", "WV": "West Virginia", "WI": "Wisconsin", "WY": "Wyoming"
		}

		return states[abbr];
	}


	function getRepsByState(state, callback) {
		$http({
			method: 'GET',
			url: 'http://www.opensecrets.org/api/?method=getLegislators&output=json&id=' + state + '&apikey=' + key,
			// headers: headers,
			cache: true
		}).success(function(data) {
			callback(data);
		});
	}

	function getRepSummary(cid, callback) {
		$http({
			method: 'GET',
			url: 'http://www.opensecrets.org/api/?method=candSummary&output=json&cid=' + cid + '&apikey=' + key,
			cache: true
		}).success(function(data) {
			callback(data);
		});
	}

	function getRepIndustry(cid, callback) {
		$http({
			method: 'GET',
			url: 'http://www.opensecrets.org/api/?method=candIndustry&output=json&cid=' + cid + '&apikey=' + key,
			cache: true
		}).success(function(data) {
			callback(data);
		});
	}

	return {
		getRepsByState: getRepsByState,
		getRepSummary: getRepSummary,
		getRepIndustry: getRepIndustry,
		getStateName: getStateName
	};
}


// DIRECTIVES
function repList (openSecrets){
	return {
		restrict: 'EA',
		templateUrl: 'rep-list.html',
		replace: true,
		controllerAs: 'list',
		controller: ListCtrl
	};
}

function repPanel (){
	return {
		restrict: 'EA',
		templateUrl: 'rep-panel.html',
		replace: true,
		controllerAs: 'panel',
		controller: RepPanelCtrl
	};
}

function repDetailIndustry (){
	return {
		restrict: 'EA',
		templateUrl: 'rep-detail-industry.html',
		replace: true,
		controllerAs: 'industry',
		controller: IndustryCtrl
	};
}

function mapWidget (){
	return {
		restrict: 'EA',
		templateUrl: 'map-widget.html',
		replace: false,
        scope: {
            state: "="
        },
		link: function(scope, elem, attrs) {
			$('#map').usmap({
				stateStyles: {fill: '#ADE5C0'},
				stateHoverStyles: {fill: '#FFC279'},
				stateHoverAnimation: 180,
				click: function(event, data) {
					//TODO: Update to just change the URL param, which will be the trigger to 
					//		update the list. Currently updates twice.
					scope.state = data.name;
					scope.$apply();

					$("#map > svg > path").each(function(){
						$(this).css('fill', '');
					});

					$('#' + data.name).css('fill', '#FFC279');

				}
			});
			
		},
		controller: function($routeParams, $timeout) {
			// If RouteParams has a stateId, click that state to highlight it.
			$timeout(function(){
				var stateId = $routeParams.stateId;
				if (stateId) { $('[data-hit=' + stateId + ']').trigger('click'); }
			}, 1)
			
			
		}
	};
}


// CONTROLLERS
function ListCtrl($scope, $routeParams, $location, openSecrets) {
	var self = this;

	$scope.state = $routeParams.stateId;
	self.query = '';
	self.reps = [];

	self.stateName = openSecrets.getStateName($scope.state);

	$scope.$watch('state', function(val) {
		if (typeof val !== 'undefined') {
			updateList(val);
			$location.path('/' + val);			
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

		if (namePieces[namePieces.length - 1] == "Jr" || namePieces[namePieces.length - 1] == "Sr") {
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


})();