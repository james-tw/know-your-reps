(function(){

var repsApp = angular.module('knowYourReps', ['ngRoute'])
    .directive('pageHeader', pageHeader)
    .directive('mapWidget', ['$timeout', mapWidget])
    .directive('repList', repList)
    .directive('repPanel', repPanel)
    .directive('repDetailIndustry', repDetailIndustry)
    .directive('onEnter', onEnter)
    .factory('openSecrets', openSecrets)
    .factory('locationService', locationService)
    .controller('ListCtrl', ['$scope', '$route', '$routeParams', '$location', 'openSecrets', 'locationService', ListCtrl])
    .config(routeConfig)
    ;


//ROUTE CONFIG 
function routeConfig($routeProvider) {

    // $httpProvider.defaults.useXDomain = true;
    // delete $httpProvider.defaults.headers.common["X-Requested-With"];

    $routeProvider
        .when('/:stateId', {
            templateUrl: 'partials/rep-list.html',
            controller: 'ListCtrl'
        })
        .when('/rep/:repId', {
            templateUrl: 'partials/rep-detail.html',
            controller: 'ListCtrl'
        })
        .when('/', {
            templateUrl: 'partials/rep-list.html',
            controller: 'ListCtrl'
        })
        .otherwise({
            redirectTo: '/'
        });
}

// SERVICES
function openSecrets ($http, $q) {

    var key = 'e083ad78821ccd23756c34c26b0713ff';
    var states = {
        "AL": "Alabama", "AK": "Alaska", "AZ": "Arizona", "AR": "Arkansas", "CA": "California", "CO": "Colorado", "CT": "Connecticut", "DE": "Delaware", "FL": "Florida", "GA": "Georgia", "HI": "Hawaii", "ID": "Idaho", "IL": "Illinois", "IN": "Indiana", "IA": "Iowa", "KS": "Kansas", "KY": "Kentucky", "LA": "Louisiana", "ME": "Maine", "MD": "Maryland", "MA": "Massachusetts", "MI": "Michigan", "MN": "Minnesota", "MS": "Mississippi", "MO": "Missouri", "MT": "Montana", "NE": "Nebraska", "NV": "Nevada", "NH": "New Hampshire", "NJ": "New Jersey", "NM": "New Mexico", "NY": "New York", "NC": "North Carolina", "ND": "North Dakota", "OH": "Ohio", "OK": "Oklahoma", "OR": "Oregon", "PA": "Pennsylvania", "RI": "Rhode Island", "SC": "South Carolina", "SD": "South Dakota", "TN": "Tennessee", "TX": "Texas", "UT": "Utah", "VT": "Vermont", "VA": "Virginia", "WA": "Washington", "WV": "West Virginia", "WI": "Wisconsin", "WY": "Wyoming"
    }

    function getStateName(abbr) { return states[abbr]; }

    function getStates () { return states; }

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

    function getRepsByState(state) {
        var defer = $q.defer();

        $http({
            method: 'GET',
            url: 'http://crossorigin.me/http://www.opensecrets.org/api/?method=getLegislators&output=json&id=' + state + '&apikey=' + key,
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

            defer.resolve(list);
        }).error(function(err, status){
            defer.reject(err);
        });

        return defer.promise;
    }

    function getRepSummary(cid) {
        var defer = $q.defer();

        $http({
            method: 'GET',
            url: 'http://crossorigin.me/http://www.opensecrets.org/api/?method=candSummary&output=json&cid=' + cid + '&apikey=' + key,
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

            defer.resolve(rep);
            // callback(rep);
        }).error(function(err, status){
            console.log(err);
            defer.reject(err);
        });

        return defer.promise;
    }

    function getRepIndustry(cid) {
        var defer = $q.defer();

        $http({
            method: 'GET',
            url: 'http://crossorigin.me/http://www.opensecrets.org/api/?method=candIndustry&output=json&cid=' + cid + '&apikey=' + key,
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

            defer.resolve(list);
        }).error(function(err, status){
            console.log(err);
            defer.reject(err);
        });

        return defer.promise;
    }

    return {
        getRepsByState: getRepsByState,
        getRepSummary: getRepSummary,
        getRepIndustry: getRepIndustry,
        getStateName: getStateName,
        getStates: getStates
    };
}

function locationService ($http, $q) {
    var key = '49bc7837f5f649c5b0e70b55e84cc722';

    var position = [];

    var myDistricts = [];
    var myState = [];

    function geolocate() {
        var defer = $q.defer();

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function(pos){

                //Clear previous position, then set new position.
                position.splice(0, position.length);
                position.push(pos.coords.latitude.toFixed(2));
                position.push(pos.coords.longitude.toFixed(2));

                //Once we lookup the district via API, resolve.
                getDistrict().then(function () {
                    defer.resolve();
                });

            },
            function(err) {
                if (err.code === 3) {
                    alert("Couldn't find your location in a reasonable amount of time. Try using your ZIP code.")
                }

                defer.resolve();

            }, {timeout: 5000});
        }

        return defer.promise;
    }

    function submitZip(zip) {
        var defer = $q.defer();

        //Clear previous position, then set new position.
        position.splice(0, position.length);
        position.push(zip);

        getDistrict().then(function(){
            defer.resolve();
        }, function(err){
            defer.reject();
        });

        return defer.promise;
    }


    function getDistrict() {
        var defer = $q.defer();

        if (position.length === 2) {
            var location = 'latitude=' + position[0] + '&longitude=' + position[1];
        } else {
            var location = 'zip=' + position[0];
        }

        $http({
            method: 'GET',
            url: 'http://congress.api.sunlightfoundation.com/legislators/locate?' + location + '&apikey=' + key,
            cache: true
        }).success(function(data) {
            // If actual ZIP code...
            if (data['results'].length) {
                var dataList = data['results'];
                //Clear myDistricts array without re-assigning to a new array.
                myDistricts.splice(0, myDistricts.length);
                //Set myState to the state of the first returned Rep. (All reps have the same State value)
                myState[0] = dataList[0]['state'];

                angular.forEach(dataList, function(item) {
                    if (item['district'] !== null) {
                        myDistricts.push(item['district']);
                    }
                });

                //Sends a callback to controller to set $scope.state = myState
                defer.resolve();
            } else {
                alert ('Please enter a valid ZIP code');
                defer.reject();
            }
            
        }).error(function(err, status){
            defer.reject();
        });

        return defer.promise;
    }

    return {
        getDistrict: getDistrict,
        submitZip: submitZip,
        geolocate: geolocate,
        myDistricts: myDistricts,
        myState: myState
    };
}

})();