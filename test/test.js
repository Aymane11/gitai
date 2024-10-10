const assert = require('node:assert')
const test = require('node:test')
const { getGitDiff } = require('../src/index.js')

test('getGitDiff', async (t) => {
  await t.test('should return a string', () => {
    const diff = getGitDiff()
    assert.strictEqual(typeof diff, 'string')
  })
})
