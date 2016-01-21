'use strict';

/**
 * Source of audio links: http://www.mfiles.co.uk/
 */

var hapi = require('hapi'),
	server = new hapi.Server(),
	songList = [{
		id: 1,
		artist: 'Wolfgang Amadeus Mozart',
		name: 'Clarinet Concerto in A, 2nd movement',
		url: 'http://www.mfiles.co.uk/mp3-downloads/mozart-clarinet-concerto-2-piano-and-clarinet.mp3'
	}, {
		id: 2,
		artist: 'Ludwig van Beethoven',
		name: 'Sonata Pathétique (2nd movement)',
		url: 'http://www.mfiles.co.uk/mp3-downloads/beethoven-piano-sonata-pathetique-2.mp3'
	}, {
		id: 3,
		artist: 'Scott Joplin',
		name: 'Peacherine Rag',
		url: 'http://www.mfiles.co.uk/mp3-downloads/scott-joplin-peacherine-rag.mp3'
	}]

/*
 * TODO: Separate the configuration from this file
 */
server.connection({
	host: 'localhost',
	port: 8000
});

/**
 * TODO: Load the routes from an external file
 */
server.route({
	method: 'GET',
	path: '/songs',
	config: {
		cors: true,
		handler: function(request, replay) {
			/**
			 * Respond with the songlist
			 */
			replay(songList);
		}
	}
});

/**
 * Start the server up
 */
server.start(function() {
	console.log('Serving songs at:', server.info.uri);
});
