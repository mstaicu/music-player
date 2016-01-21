angular.module('project.songComponent').directive('songComponent', function() {
	return {
		restrict: 'E',
		scope: {
			song: '='
		},
		require: '^musicPlayer',
		templateUrl: 'music-player/song-component/song-component.html',
		link: function($scope, $element, $attrs, musicPlayerController) {
			/**
			 * Expose the API to the template
			 */
			angular.extend($scope, {
				playSong: playSong,
				pauseSong: pauseSong
			});

			/**
			 * [playSong Calls the @playSong function on the parent component, music-player, controller]
			 * @return {[void]}
			 */
			function playSong() {
				musicPlayerController.playSong($scope.song);
			}

			/**
			 * [playSong Calls the @pauseSong function on the parent component, music-player, controller]
			 * @return {[void]}
			 */
			function pauseSong() {
				musicPlayerController.pauseSong($scope.song);
			}
		}
	}
});
