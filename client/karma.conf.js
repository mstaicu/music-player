module.exports = function(config) {
    config.set({
        browsers: ['Chrome'],
        frameworks: ['jasmine'],
        files: [
            'public/components/angular/angular.js',
            'public/components/angular-mocks/angular-mocks.js',
            'public/components/angular-resource/angular-resource.js',
            'build/*-bundle.js',
            'src/**/*-tests.js'
        ]
    });
};
