describe('Music player component suite', function() {
	var musicPlayerService = null,
		httpBackend = null;

	/**
	 * Inject the music-player module service before each spec
	 */
	beforeEach(function() {
		module('project.musicPlayer');

		/**
		 * Inject the services
		 */
		inject(function(_MusicPlayerService_, _$httpBackend_) {
			musicPlayerService = _MusicPlayerService_;

			/**
			 * Used to simulate a live $http service call response during a unit test
			 */
			httpBackend = _$httpBackend_;

			/**
			 * Test if the GET request, for our songs, gets to our server
			 */
			httpBackend.expectGET('http://localhost:8000/songs')
				.respond([1, 2]);
		});
	});

	it('Service loaded', function() {
		expect(musicPlayerService).not.toBe(null);
	});

	it('httpBackend loaded', function() {
		expect(httpBackend).not.toBe(null);
	});

	it('Retrieve resources', function() {
		var songList = [];

		musicPlayerService.getSongs().then(function(response) {
			songList = response;
		});

		httpBackend.flush();

		expect(songList.length).toBe(2);
	});
});
