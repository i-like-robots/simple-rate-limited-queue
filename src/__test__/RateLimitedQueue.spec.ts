import { describe, it, expect, beforeAll, afterAll, vitest } from 'vitest'
import { RateLimitedQueue } from '../RateLimitedQueue'

describe('RateLimitedQueue', () => {
  beforeAll(() => {
    vitest.useFakeTimers()
  })

  afterAll(() => {
    vitest.useRealTimers()
  })

  describe('constructor', () => {
    it('initializes with the correct default state', () => {
      const queue = new RateLimitedQueue()

      expect(queue.pending).toBe(0)
      expect(queue.inProgress).toBe(0)
      expect(queue.isPaused).toBe(false)
      expect(queue.isTerminated).toBe(false)
    })
  })

  describe('.pause() and .resume()', () => {
    it('sets isPaused to reflect status', () => {
      const queue = new RateLimitedQueue()

      queue.pause()
      expect(queue.isPaused).toBe(true)

      queue.resume()
      expect(queue.isPaused).toBe(false)
    })

    it('stops executing pending callbacks', async () => {
      const queue = new RateLimitedQueue({ maxConcurrency: 1 })
      const mockFn = vitest.fn()

      queue.schedule(mockFn)
      queue.schedule(mockFn)
      queue.schedule(mockFn)
      queue.schedule(mockFn)

      expect(mockFn).toHaveBeenCalledTimes(1)

      await vitest.advanceTimersByTimeAsync(1000)
      expect(mockFn).toHaveBeenCalledTimes(2)

      queue.pause()

      await vitest.advanceTimersByTimeAsync(1000)
      expect(mockFn).toHaveBeenCalledTimes(2)

      await vitest.advanceTimersByTimeAsync(1000)
      expect(mockFn).toHaveBeenCalledTimes(2)

      queue.resume()

      await vitest.advanceTimersByTimeAsync(1000)
      expect(mockFn).toHaveBeenCalledTimes(3)

      await vitest.advanceTimersByTimeAsync(1000)
      expect(mockFn).toHaveBeenCalledTimes(4)
    })
  })

  describe('.terminate() and .reset()', () => {
    it('sets isTerminated to reflect status', () => {
      const queue = new RateLimitedQueue()

      queue.terminate()

      expect(queue.isTerminated).toBe(true)

      queue.reset()

      expect(queue.isTerminated).toBe(false)
    })

    it('clears all pending tasks', () => {
      const queue = new RateLimitedQueue()

      queue.pause()

      queue.schedule(vitest.fn()).catch(() => {})
      queue.schedule(vitest.fn()).catch(() => {})
      queue.schedule(vitest.fn()).catch(() => {})

      expect(queue.pending).toBe(3)

      queue.terminate()

      expect(queue.pending).toBe(0)
    })

    it('rejects all pending tasks', async () => {
      const queue = new RateLimitedQueue()

      queue.pause()

      const task1 = queue.schedule(vitest.fn())
      const task2 = queue.schedule(vitest.fn())
      const task3 = queue.schedule(vitest.fn())

      queue.terminate()

      await expect(task1).rejects.toThrow('Task cancelled')
      await expect(task2).rejects.toThrow('Task cancelled')
      await expect(task3).rejects.toThrow('Task cancelled')
    })

    it('enables the queue to accept tasks again', async () => {
      const queue = new RateLimitedQueue()
      const mockFn = vitest.fn(() => 42)

      queue.terminate()

      await vitest.advanceTimersByTimeAsync(1000)
      await expect(queue.schedule(mockFn)).rejects.toThrowError()

      queue.reset()

      await vitest.advanceTimersByTimeAsync(1000)
      await expect(queue.schedule(mockFn)).resolves.toBe(42)
    })
  })

  describe('.schedule()', () => {
    it('adds tasks to the queue', () => {
      const queue = new RateLimitedQueue({ maxConcurrency: 1 })
      const mockFn = vitest.fn()

      queue.pause()

      queue.schedule(mockFn)
      queue.schedule(mockFn)
      queue.schedule(mockFn)

      expect(queue.pending).toBe(3)
    })

    it('executes a task and returns its result', async () => {
      const queue = new RateLimitedQueue()
      const result = queue.schedule(() => 42)

      await expect(result).resolves.toBe(42)
    })

    it('rate limits concurrent tasks', async () => {
      const queue = new RateLimitedQueue({ maxConcurrency: 2 })
      const mockFns = [
        vitest.fn(() => 0),
        vitest.fn(() => 1),
        vitest.fn(() => 2),
        vitest.fn(() => 3),
        vitest.fn(() => 4),
        vitest.fn(() => 5),
      ]
      const scheduled = mockFns.map((fn) => queue.schedule(fn))

      await expect(scheduled[0]).resolves.toBe(0)
      await expect(scheduled[1]).resolves.toBe(1)

      expect(mockFns[2]).not.toHaveBeenCalled()
      expect(mockFns[3]).not.toHaveBeenCalled()
      expect(mockFns[4]).not.toHaveBeenCalled()
      expect(mockFns[5]).not.toHaveBeenCalled()

      await vitest.advanceTimersByTimeAsync(1000)

      await expect(scheduled[2]).resolves.toBe(2)
      await expect(scheduled[3]).resolves.toBe(3)

      expect(mockFns[4]).not.toHaveBeenCalled()
      expect(mockFns[5]).not.toHaveBeenCalled()

      await vitest.advanceTimersByTimeAsync(1000)

      await expect(scheduled[4]).resolves.toBe(4)
      await expect(scheduled[5]).resolves.toBe(5)
    })

    it('allows tasks to be added to the front of the queue', async () => {
      const queue = new RateLimitedQueue()
      const order: number[] = []

      queue.pause()

      queue.schedule(() => order.push(1), false)
      queue.schedule(() => order.push(2), true)
      queue.schedule(() => order.push(3), false)
      queue.schedule(() => order.push(4), true)

      queue.resume()

      await vitest.advanceTimersByTimeAsync(1000)

      expect(order).toEqual([4, 2, 1, 3])
    })

    it('throws if the queue is terminated', async () => {
      const queue = new RateLimitedQueue()
      const mockFn = vitest.fn(() => 42)

      queue.terminate()

      await expect(queue.schedule(mockFn)).rejects.toThrowError()
    })
  })
})
