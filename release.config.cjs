module.exports = {
  branches: ['trunk'],
  plugins: [
    '@semantic-release/commit-analyzer',
    '@semantic-release/release-notes-generator',
    [
      '@semantic-release/exec',
      {
        shell: true,
        publishCmd: 'node ./scripts/publish.mjs ${nextRelease.version}'
      }
    ],
    '@semantic-release/github'
  ]
}
