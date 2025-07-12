import { describe, it, expect, vi } from 'vitest'
import { withRetry } from '../withRetry'

describe('withRetry', () => {
  it('returns a function that resolves when operation succeeds', async () => {
    const mockOp = vi.fn().mockResolvedValue('success')
    const mockShouldRetry = vi.fn()

    const wrappedOp = withRetry(mockOp, mockShouldRetry)
    const result = await wrappedOp()

    expect(result).toBe('success')
    expect(mockOp).toHaveBeenCalled()
    expect(mockShouldRetry).not.toHaveBeenCalled()
  })

  it('retries shouldRetry returns a delay', async () => {
    const mockOp = vi.fn().mockRejectedValueOnce(new Error()).mockResolvedValueOnce('success')
    const mockShouldRetry = vi.fn().mockReturnValueOnce(10)

    const wrappedOp = withRetry(mockOp, mockShouldRetry)
    const result = await wrappedOp()

    expect(result).toBe('success')
    expect(mockOp).toHaveBeenCalledTimes(2)
    expect(mockShouldRetry).toHaveBeenCalledWith(expect.any(Error), 1)
  })

  it('rejects when shouldRetry does not return a number', async () => {
    const mockOp = vi.fn().mockRejectedValue(new Error('Oh no!'))
    const mockShouldRetry = vi.fn().mockReturnValue(null)

    const wrappedOp = withRetry(mockOp, mockShouldRetry)

    await expect(wrappedOp()).rejects.toThrow('Oh no!')

    expect(mockOp).toHaveBeenCalledTimes(1)
    expect(mockShouldRetry).toHaveBeenCalledTimes(1)
  })

  it('retries until the operation succeeds', async () => {
    const mockOp = vi
      .fn()
      .mockRejectedValueOnce(new Error('Oh no!'))
      .mockRejectedValueOnce(new Error('Oh no!'))
      .mockResolvedValueOnce('success')
    const mockShouldRetry = vi.fn().mockReturnValueOnce(5).mockReturnValueOnce(10)

    const wrappedOp = withRetry(mockOp, mockShouldRetry)
    const result = await wrappedOp()

    expect(result).toBe('success')
    expect(mockOp).toHaveBeenCalledTimes(3)
    expect(mockShouldRetry).toHaveBeenCalledTimes(2)
  })

  it('respects delay between retries', async () => {
    vi.useFakeTimers()

    const mockOp = vi
      .fn()
      .mockRejectedValueOnce(new Error('Oh no!'))
      .mockRejectedValueOnce(new Error('Oh no!'))
      .mockResolvedValueOnce('success')

    const shouldRetry = vi.fn().mockReturnValueOnce(1000).mockReturnValueOnce(1000)

    const wrappedOp = withRetry(mockOp, shouldRetry)
    const result = wrappedOp()

    await vi.advanceTimersByTimeAsync(1000)

    expect(shouldRetry).toHaveBeenCalledTimes(2)

    await vi.advanceTimersByTimeAsync(1000)

    await expect(result).resolves.toBe('success')
    expect(mockOp).toHaveBeenCalledTimes(3)

    vi.useRealTimers()
  })
})
