(function(){

var repsApp = angular.module('knowYourReps', ['ngRoute'])
	.directive('mapWidget', ['$timeout', mapWidget])
	.directive('repList', repList)
	.directive('repPanel', repPanel)
	.directive('repDetailIndustry', repDetailIndustry)
	.factory('openSecrets', openSecrets)
	.controller('ListCtrl', ['$scope', '$route', '$routeParams', '$location', 'openSecrets', ListCtrl])
	.controller('DetailCtrl', ['$scope', 'openSecrets', '$routeParams', DetailCtrl])
	.config(routeConfig)
	;



//ROUTE CONFIG 
function routeConfig($routeProvider, $httpProvider) {

	$routeProvider
		.when('/:stateId', {
			templateUrl: 'partials/rep-list.html',
			controller: 'ListCtrl',
			controllerAs: 'list'
		})
		.when('/rep/:repId', {
			templateUrl: 'partials/rep-detail.html',
			controller: 'DetailCtrl',
			controllerAs: 'detail'
		})
		.when('/', {
			templateUrl: 'partials/rep-list.html',
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
	var states = {
		"AL": "Alabama", "AK": "Alaska", "AZ": "Arizona", "AR": "Arkansas", "CA": "California", "CO": "Colorado", "CT": "Connecticut", "DE": "Delaware", "FL": "Florida", "GA": "Georgia", "HI": "Hawaii", "ID": "Idaho", "IL": "Illinois", "IN": "Indiana", "IA": "Iowa", "KS": "Kansas", "KY": "Kentucky", "LA": "Louisiana", "ME": "Maine", "MD": "Maryland", "MA": "Massachusetts", "MI": "Michigan", "MN": "Minnesota", "MS": "Mississippi", "MO": "Missouri", "MT": "Montana", "NE": "Nebraska", "NV": "Nevada", "NH": "New Hampshire", "NJ": "New Jersey", "NM": "New Mexico", "NY": "New York", "NC": "North Carolina", "ND": "North Dakota", "OH": "Ohio", "OK": "Oklahoma", "OR": "Oregon", "PA": "Pennsylvania", "RI": "Rhode Island", "SC": "South Carolina", "SD": "South Dakota", "TN": "Tennessee", "TX": "Texas", "UT": "Utah", "VT": "Vermont", "VA": "Virginia", "WA": "Washington", "WV": "West Virginia", "WI": "Wisconsin", "WY": "Wyoming"
	}

	function getStateName(abbr) {
		return states[abbr];
	}

	function getStates () {
		return states;
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
		getStateName: getStateName,
		getStates: getStates
	};
}


})();