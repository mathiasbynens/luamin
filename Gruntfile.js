module.exports = function(grunt) {

	grunt.initConfig({
		'meta': {
			'testFile': 'tests/tests.js'
		},
		'shell': {
			'cover': {
				'command': 'istanbul cover --report html --verbose --dir coverage <%= meta.testFile %>',
				'options': {
					'stdout': true,
					'stderr': true,
					'failOnError': true
				}
			}
		}
	});

	grunt.loadNpmTasks('grunt-shell');

	grunt.registerTask('cover', 'shell:cover');

	grunt.registerTask('default', ['shell']);

};
