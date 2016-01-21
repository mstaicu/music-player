angular.module('project.musicPlayer')
	.service('MusicPlayerService', ['$resource', function($resource) {
		/**
		 * [function Creates a resource object that lets you interact with RESTful server-side data sources]
		 * @return {[Object]} [Resource object]
		 */
		this.createResource = function() {
			return $resource('http://localhost:8000/songs/:id', {}, {
				retrieveSongs: {
					method: 'GET',
					isArray: true,
					cache: false
				},
				addSong: {
					method: 'POST',
					isArray: false
				},
				deleteSong: {
					method: 'DELETE',
					isArray: false
				},
				updateSong: {
					method: 'PUT',
					isArray: false
				}
			});
		}

		/**
		 * [function Gets the list of songs from the server]
		 * @return {[Promise]} [A promise which will resolve to our list of songs]
		 */
		this.getSongs = function() {
			return this.createResource().retrieveSongs().$promise;
		}

		/**
		 * [function Adds a new song on the server]
		 * @param  {[Object]} params [Additional params]
		 * @return {[Promise]}
		 */
		this.addSong = function(params) {
			return this.createResource().addSong(params).$promise;
		}

		/**
		 * [function Deletes a song from the server]
		 * @param  {[Object]} params [Additional params]
		 * @return {[Promise]}
		 */
		this.deleteSong = function(params) {
			return this.createResource().deleteSong(params).$promise;
		}

		/**
		 * [function Updates a new song on the server]
		 * @param  {[Object]} params [Additional params]
		 * @return {[Promise]}
		 */
		this.updateSong = function(params) {
			return this.createResource().updateSong(params).$promise;
		}
	}]);
