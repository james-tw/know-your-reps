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
			controllerAs: 'rep'
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

	function reverseName(name) {
		var namePieces = name.split(' ');

		if (namePieces[namePieces.length - 1] === "Jr" || namePieces[namePieces.length - 1] === "Sr") {
			var suffix = namePieces.pop();
		}

		namePieces = namePieces.join(' ').split(',').reverse();

		if (suffix) { namePieces.push(suffix); }

		return namePieces.join(' ').trim();
	}

	function getTitle(code) {
		//Check the office code for S to indicate Senator.
		if (code.charAt(2) === 'S') {
			return 'Sen.';
		} 
		else {
			return 'Rep.';
		}
	}

	function getDistrict(code) {
		return parseInt(code.slice(2,4), 10);
	}

	function getChamber(chamberId) {
		if (chamberId === "H") {
			return "Representative"
		} else if (chamberId === "S") {
			return "Senator"
		}
	}

	function getPartyFull(partyId) {
		if (partyId === "R") {
			return "Republican"
		} else if (partyId === "D") {
			return "Democrat"
		} else {
			return "Independent"
		}
	}


	function getRepsByState(state, callback) {
		$http({
			method: 'GET',
			url: 'http://www.opensecrets.org/api/?method=getLegislators&output=json&id=' + state + '&apikey=' + key,
			cache: true
		}).success(function(data) {
			var dataList = data.response.legislator, 
				list = [];

			// Clean up the object, only returning desired attributes of each rep.
			angular.forEach(dataList, function(item){
				var rep = {};
				item = item['@attributes'];
				rep['party'] = item['party'];
				rep['office'] = getTitle(item['office']);
				rep['fullName'] = item['firstlast'];
				rep['district'] = getDistrict(item['office']);
				rep['phone'] = item['phone'];
				rep['website'] = item['website'];
				rep['cid'] = item['cid'];

				list.push(rep);
			});

			callback(list);
		});
	}

	function getRepSummary(cid, callback) {
		$http({
			method: 'GET',
			url: 'http://www.opensecrets.org/api/?method=candSummary&output=json&cid=' + cid + '&apikey=' + key,
			cache: true
		}).success(function(data) {
			var repData = data['response']['summary']['@attributes'],
				rep = {};

			// Clean up the object, only returning desired attributes of each rep.
			rep['fullName'] = reverseName(repData['cand_name']);
			rep['state'] = repData['state'];
			rep['party'] = repData['party'];
			rep['partyFull'] = getPartyFull(repData['party']);
			rep['cycle'] = repData['cycle'];
			rep['chamber'] = getChamber(repData['chamber']);
			rep['total'] = repData['total'];
			rep['spent'] = repData['spent'];
			rep['cashOnHand'] = repData['cash_on_hand'];
			rep['debt'] = repData['debt'];

			callback(rep);
		});
	}

	function getRepIndustry(cid, callback) {
		$http({
			method: 'GET',
			url: 'http://www.opensecrets.org/api/?method=candIndustry&output=json&cid=' + cid + '&apikey=' + key,
			cache: true
		}).success(function(data) {
			var dataList = data['response']['industries']['industry'], 
				list = [];

			// Clean up the object, only returning desired attributes of each industry.
			angular.forEach(dataList, function(item){
				var industry = {};
				item = item['@attributes'];

				industry['name'] = item['industry_name'];
				industry['indivs'] = item['indivs'];
				industry['pacs'] = item['pacs'];
				industry['total'] = item['total'];

				list.push(industry);
			});

			callback(list);
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