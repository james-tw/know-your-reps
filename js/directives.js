

// DIRECTIVES
function repList (openSecrets){
	return {
		restrict: 'EA',
		templateUrl: 'partials/rep-list.html',
		replace: true
	};
}

function repPanel (){
	return {
		restrict: 'EA',
		templateUrl: 'partials/rep-panel.html',
		replace: true
	};
}

function repDetailIndustry (){
	return {
		restrict: 'EA',
		templateUrl: 'partials/rep-detail-industry.html',
		replace: true
	};
}

function mapWidget ($timeout){
	return {
		restrict: 'EA',
		templateUrl: 'partials/map-widget.html',
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
					scope.state = data.name;
					$timeout(function() {
						scope.$apply();
					})

					$("#map > svg > path").each(function(){
						$(this).css('fill', '');
					});

					$('#' + data.name).css('fill', '#FFC279');

				}
			});
			
		},
		controller: function($scope, $routeParams, $timeout) {

			$scope.$watch('state', function(val) {
				$('[data-hit=' + val + ']').trigger('click');
			});

		}
	};
}