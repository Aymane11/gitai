import { getGitDiff, getCompletion } from '../src/index.js'
import { describe, it, expect, vi, beforeEach } from 'vitest'

describe('getGitDiff', () => {
  it('should return a string', () => {
    const mockExecSync = vi.fn().mockReturnValue('mock diff')
    const diff = getGitDiff(mockExecSync)

    expect(typeof diff).toBe('string')
    expect(diff).toBe('mock diff')
    expect(mockExecSync).toHaveBeenCalled(
      expect.stringContaining('git diff --staged'),
      expect.any(Object)
    )
  })

  it('should handle errors', () => {
    const mockExecSync = vi.fn().mockImplementation(() => {
      throw new Error('Git error')
    })

    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => { })
    const diff = getGitDiff(mockExecSync)
    expect(diff).toBe('')
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Unable to get git diff'))
  })
})

describe('getCompletion', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return a completion object', async () => {
    const mockDiff = 'mock diff'
    const mockOpenAPIClient = {
      chat: {
        completions: {
          create: vi.fn().mockReturnValue({
            choices: [{ message: { content: 'Mock commit message' } }]
          })
        }
      }
    }

    const completion = await getCompletion(mockDiff, mockOpenAPIClient)

    expect(mockOpenAPIClient.chat.completions.create).toHaveBeenCalledWith({
      messages: [{ role: 'user', content: expect.stringContaining(mockDiff) }],
      model: 'gpt-4o-mini'
    })

    expect(completion).toEqual({
      choices: [{ message: { content: 'Mock commit message' } }]
    })
  })
})
