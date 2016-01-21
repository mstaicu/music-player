require('./song-component/song-component');
require('./sort-component/sort-component');

angular.module('project.musicPlayer', [
	'ngResource',
	'project.songComponent',
	'project.sortComponent'
]);

require('./music-player-directive');
require('./music-player-service');
