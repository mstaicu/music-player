angular.module('project.sortComponent').directive('sortComponent', function() {
	return {
		restrict: 'E',
		scope: {
			sortBy: '@',
			sortLabel: '@'
		},
		require: '^musicPlayer',
		templateUrl: 'music-player/sort-component/sort-component.html',
		link: function($scope, $element, $attrs, musicPlayerController) {
			/**
			 * Expose the API to the template
			 */
			angular.extend($scope, {
				sort: sort,
				reverseOrder: false
			});

			/**
			 * [sort Sort the list of songs by @sortBy. Reverse the order if @reverseOrder]
			 * @return {[void]}
			 */
			function sort() {
				var reverseOrder = $scope.reverseOrder;

				musicPlayerController.sortSongs($scope.sortBy, reverseOrder);

				angular.extend($scope, {
					reverseOrder: !reverseOrder
				});
			}
		}
	}
});
