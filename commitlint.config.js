export default {
	extends: ['@commitlint/config-conventional'],
	rules: {
		'type-enum': [
			2,
			'always',
			[
				'feat', // New feature
				'fix', // Bug fix
				'docs', // Documentation
				'style', // Formatting, no code change
				'refactor', // Code change that neither fixes a bug nor adds a feature
				'perf', // Performance improvement
				'test', // Adding tests
				'chore', // Maintain
				'revert', // Revert commit
				'build', // Build system or dependencies
				'ci', // CI configuration
			],
		],
		'subject-case': [0], // Allow any case for subject
	},
};
