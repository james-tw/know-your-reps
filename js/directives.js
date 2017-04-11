// DIRECTIVES
function pageHeader (){
	return {
		restrict: 'EA',
		templateUrl: 'partials/page-header.html',
		replace: true
	};
}

function pageFooter (){
	return {
		restrict: 'EA',
		templateUrl: 'partials/page-footer.html',
		replace: true
	};
}

function repList (){
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
				stateStyles: {fill: '#93C5DA'},
				stateHoverStyles: {fill: '#FFD6A8'},
				stateHoverAnimation: 180,
				click: function(event, data) {
					// Update the $scope.state based on which state is clicked
					scope.state = data.name;
					$timeout(function() {
						scope.$apply();
					});

					$(this).trigger('colorize', [data.name]);

				}
			})
			.on('colorize', function(event, state) {
				// Un-color all states...
				$("#map > svg > path").each(function(){
					$(this).css('fill', '');
				});
				// then color the one that was clicked.
				$('#' + state).css('fill', '#FFD6A8');
			});
		},
		controller: 'MapCtrl'
	};
}
mapWidget.$inject = ["$timeout"];

// Calls passed function on keyUp enter event.
function onEnter() {
	return function (scope, elem, attrs) {
		elem.bind("keyup", function(event) {
			if (event.which === 13) {
				scope.$apply(function() {
					scope.$eval(attrs.onEnter);
				});

				event.preventDefault();
			}
		});
	};
}
