angular.module('project.musicPlayer')
	.directive('musicPlayer', ['MusicPlayerService', '$interval', '$filter', function(MusicPlayerService, $interval, $filter) {
		return {
			restrict: 'E',
			scope: {

			},
			controller: ['$scope', '$element', function($scope, $element) {
				/**
				 * Expose the component's public API
				 */
				angular.extend($scope, {
					watchers: [], //Watchers registered to be notified of new data
					songs: [], //Songs retrieved from the server
					playingSong: {}, //This contains the HTML5 Audio instance and current playing song metadata
					genericPlayPause: genericPlayPause,
					pauseCurrentSong: pauseSong,
					playNextSong: playNextSong,
					playPreviousSong: playPreviousSong
				});

				/**
				 * Expose the component's controller public API here
				 */
				angular.extend(this, {
					retrieveSongs: retrieveSongs,
					notifyAllWatchers: notifyAllWatchers,
					playSong: playSong,
					pauseSong: pauseSong,
					playNextSong: playNextSong,
					playPreviousSong: playPreviousSong,
					sortSongs: sortSongs
				});

				/**
				 * [function Perform a GET request for songs data]
				 * @param  {[Object]} params  [Additional params for the request]
				 * @return {[Promise]}        [Promise object]
				 */
				function retrieveSongs(params) {
					return MusicPlayerService.getSongs(params);
				}

				/**
				 * [function Function to notify any components that might expect data from this component]
				 * @return {[void]}
				 */
				function notifyAllWatchers() {
					$scope.watchers.forEach(function(watcher) {
						watcher.notify();
					});
				}

				/**
				 * [sortSongs Sort the list of songs]
				 * @param  {[String]} sortProperty  [The property after which the sort is performed]
				 * @param  {[Boolean]} reverse      [If we should reverse the order of the sorting]
				 * @return {[void]}
				 */
				function sortSongs(sortProperty, reverse) {
					$scope.songs = $filter('orderBy')($scope.songs, sortProperty, reverse);
				}

				/**
				 * [playSong Plays the song passed as argument]
				 * @param  {[Object]}  songToPlay [The song object]
				 * @return {[void]}
				 */
				function playSong(songToPlay) {
					var currentSong = $scope.playingSong,
						currentSongMetadata = currentSong && currentSong.metadata,
						currentSongAudio = currentSong && currentSong.audio,
						currentSongIsPaused = currentSongAudio && currentSongAudio.paused,
						currentSongPausedAt = currentSongAudio && currentSongMetadata.pausedAt,
						resumedCorrectSong = (currentSongMetadata && currentSongMetadata.id) === (songToPlay && songToPlay.id);

					if (resumedCorrectSong && currentSongIsPaused) {
						currentSongAudio.currentTime = currentSongPausedAt;
						currentSongAudio.play();

						markSongAsPlaying(songToPlay.id);

						/**
						 * Start the progress tracking, keep a reference to pause/stop the interval
						 */
						$scope.songTracking = startSongTracking();
					} else {
						/**
						 * Start from the beginning, reset tracking and the Audio instance
						 */
						stopSongProgressTracking();

						/**
						 * Cleanup
						 */
						currentSongAudio && resetPlayingSong();

						var playingSong = new Audio(songToPlay.url);
						playingSong.play();

						markSongAsPlaying(songToPlay.id);

						if (playingSong) {
							$scope.playingSong.audio = playingSong;
							$scope.playingSong.metadata = songToPlay;

							/**
							 * Start the progress tracking, keep a reference to pause/stop the interval
							 */
							$scope.songTracking = startSongTracking();

							playingSong.addEventListener('ended', endedEventCallback);
						}
					}
				}

				/**
				 * [resetPlayingSong Resets the currently playing song namespace]
				 * @return {[void]}
				 */
				function resetPlayingSong() {
					var currentSong = $scope.playingSong,
						currentSongAudio = currentSong && currentSong.audio,
						currentSongMetadata = currentSong && currentSong.metadata;

					currentSongAudio.pause();
					currentSongAudio.currentTime = 0;

					currentSongAudio.removeEventListener('ended', endedEventCallback);

					$scope.playingSong = {};
				}

				/**
				 * [endedEventCallback Callback used for the 'ended' event thrown by the instance of the HTMLAudioElement]
				 * @return {[void]}
				 */
				function endedEventCallback() {
					var [currentSongIndex, currentSongObject] = getCurrentPlayingSong(),
						numberOfSongs = $scope.songs.length - 1,
						isLastSong = currentSongIndex === numberOfSongs;

					/**
					 * Reached the end of line, halt everything
					 */
					if (isLastSong) {
						resetPlayingSong();
						resetVisualProgress();
						markSongAsPaused(currentSongObject.id);
					} else {
						playNextSong();
					}
				}

				/**
				 * [genericPlayPause The main play / pause button]
				 * @return {[void]}
				 */
				function genericPlayPause() {
					var currentSong = $scope.playingSong,
						currentSongMetadata = currentSong && currentSong.metadata,
						currentSongAudio = currentSong && currentSong.audio,
						songToPlayResume = (!currentSongMetadata) ? $scope.songs[0] : currentSongMetadata;

					playSong(songToPlayResume);
				}

				/**
				 * [pauseSong Pauses the current playing song]
				 * @param {[Object]} songToPause  [Song to be played]
				 * @return {[void]}
				 */
				function pauseSong(songToPause) {
					var currentSong = $scope.playingSong,
						currentSongMetadata = currentSong && currentSong.metadata,
						currentSongAudio = currentSong && currentSong.audio,
						pausedCorrectSong = ((currentSong && currentSong.metadata.id) === (songToPause && songToPause.id)) || !songToPause,
						songNotPaused = currentSong && !currentSong.audio.paused;

					if (pausedCorrectSong && songNotPaused) {
						currentSongAudio.pause();

						currentSongMetadata.pausedAt = currentSongAudio.currentTime;

						(songToPause) ? markSongAsPaused(songToPause.id): markSongAsPaused(currentSongMetadata.id);

						/**
						 * Pause the tracking as well
						 */
						stopSongProgressTracking();
					}
				}

				/**
				 * [playNextSong Next song in line]
				 * @return {[void]}
				 */
				function playNextSong() {
					var [currentSongIndex, currentSongObject] = getCurrentPlayingSong(),
						numberOfSongs = $scope.songs.length - 1;

					if (currentSongIndex < numberOfSongs) {
						var nextSong = $scope.songs[currentSongIndex + 1];

						playSong(nextSong);

						resetVisualProgress();
					}
				}

				/**
				 * [playPreviousSong Previous song in line]
				 * @return {[void]}
				 */
				function playPreviousSong() {
					var [currentSongIndex, currentSongObject] = getCurrentPlayingSong();

					if (currentSongIndex > 0) {
						var previousSong = $scope.songs[currentSongIndex - 1];

						playSong(previousSong);

						resetVisualProgress();
					}
				}

				/**
				 * [resetVisualProgress Resets the style of the progress bar]
				 */
				function resetVisualProgress() {
					var progressBar = $element[0].getElementsByClassName('progress__bar')[0];

					progressBar.style.width = 0;
				}

				/**
				 * [stopSongProgressTracking Deregisters the progress tracking]
				 * @return {[void]}
				 */
				function stopSongProgressTracking() {
					$interval.cancel($scope.songTracking);
				}

				/**
				 * [startSongTracking Registers the song progress tracking]
				 * @return {[void]}
				 */
				function startSongTracking() {
					return $interval(songTracking(), 1000);
				}

				/**
				 * [songTracking Function to be executed every 1000ms, computing the progress and formating the elapsed time along with the passed time]
				 * @return {[void]}
				 */
				function songTracking() {
					var currentPlayingSong = $scope.playingSong,
						currentlyPlayingSongAudio = currentPlayingSong && currentPlayingSong.audio,
						currentlyPlayingSongMetadata = currentPlayingSong && currentPlayingSong.metadata;

					return function() {
						var currentSongPosition = currentlyPlayingSongAudio && currentlyPlayingSongAudio.currentTime,
							currentSongLength = currentlyPlayingSongAudio && currentlyPlayingSongAudio.duration,
							currentSongProgress = Number(((currentSongPosition / currentSongLength) * 100).toFixed(2));

						currentlyPlayingSongMetadata.remainingSeconds = (currentlyPlayingSongMetadata.remainingSeconds) ? currentlyPlayingSongMetadata.remainingSeconds - 1 : currentSongLength - 1;

						angular.extend(currentlyPlayingSongMetadata, {
							songProgress: currentSongProgress,
							songPosition: (currentSongPosition) ? formatTrackTime(currentSongPosition) : formatTrackTime(0),
							songLengthRemaining: (currentlyPlayingSongMetadata.remainingSeconds) ? formatTrackTime(currentlyPlayingSongMetadata.remainingSeconds) : formatTrackTime(0)
						});
					}
				}

				/**
				 * [formatTrackTime Format the given seconds as a human readable output]
				 * @param  {[Number]} seconds [Seconds to be formated]
				 * @return {[String]}         [String representation of the @seconds]
				 */
				function formatTrackTime(seconds) {
					var _seconds = Math.floor(seconds),
						_minutes = Math.floor(_seconds / 60),
						_minutes = (_minutes >= 10) ? _minutes : `0${_minutes}`,
						_seconds = Math.floor(_seconds % 60),
						_seconds = _seconds >= 10 ? _seconds : '0' + _seconds;

					return `${_minutes}:${_seconds}`;
				}

				/**
				 * [getCurrentPlayingSong Search and retrieve the object that coresponds to the currently playing song]
				 * @return {[Array]} [Structured representation composed of the song index and its object]
				 */
				function getCurrentPlayingSong() {
					var currentPlayingSongIndex = $scope.songs.findIndex(function(song) {
						return song.isPlaying;
					});

					currentPlayingSongIndex = (currentPlayingSongIndex !== -1) ? currentPlayingSongIndex : 0;

					return [currentPlayingSongIndex, $scope.songs[currentPlayingSongIndex]];
				}

				/**
				 * [markSongAsPlaying Mark the song with the @songId as currently playing]
				 * @param  {[String]} songId [Song id]
				 * @return {[void]}
				 */
				function markSongAsPlaying(songId) {
					return $scope.songs.filter(function(availableSong) {
						if (availableSong.id === songId) {
							availableSong.isPlaying = true;

							return availableSong;
						} else {
							availableSong.isPlaying = false;
						}
					});
				}

				/**
				 * [markSongAsPlaying Mark the song with the @songId as paused]
				 * @param  {[String]} songId [Song id]
				 * @return {[void]}
				 */
				function markSongAsPaused(songId) {
					return $scope.songs.filter(function(availableSong) {
						availableSong.isPlaying = false;

						if (availableSong.id === songId) {
							return availableSong;
						}
					});
				}
			}],
			require: '^musicPlayer',
			templateUrl: 'music-player/music-player.html',
			link: function($scope, $element, $attrs, musicPlayerController) {
				/**
				 * Everything loaded, get the data from the server and notify the subscribed components to get the required data
				 * (Observer pattern implemented to bypass the two-way binding attributes and watches for new data)
				 */
				musicPlayerController.retrieveSongs()
					.then(function(response) {
						angular.extend($scope, {
							songs: response
						});
					})
					.then(function() {
						musicPlayerController.notifyAllWatchers();
					});
			}
		}
	}]);
