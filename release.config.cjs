const GITHUB_REPOSITORY = process.env.GITHUB_REPOSITORY

module.exports = {
  branches: ['trunk'],
  plugins: [
    '@semantic-release/commit-analyzer',
    '@semantic-release/release-notes-generator',
    [
      '@semantic-release/exec',
      {
        shell: true,
        publishCmd: [
          'docker tag GITHUB_REPOSITORY:latest GITHUB_REPOSITORY:${nextRelease.version}',
          'docker tag GITHUB_REPOSITORY:latest ghcr.io/GITHUB_REPOSITORY:latest',
          'docker tag GITHUB_REPOSITORY:latest ghcr.io/GITHUB_REPOSITORY:${nextRelease.version}',
          'docker push ghcr.io/GITHUB_REPOSITORY:latest',
          'docker push ghcr.io/GITHUB_REPOSITORY:${nextRelease.version}',
          'docker push GITHUB_REPOSITORY:latest',
          'docker push GITHUB_REPOSITORY:${nextRelease.version}',
          'npm run example:deploy'
        ]
          .map((string) =>
            string.replace(/GITHUB_REPOSITORY/g, GITHUB_REPOSITORY)
          )
          .join(' && \\\n')
      }
    ],
    '@semantic-release/github'
  ]
}
