import { describe, expect, it, vitest } from 'vitest'
import { Task, Status } from '../Task'

const wait = (ms = 100) => new Promise((resolve) => setTimeout(resolve, ms))

describe('Task', () => {
  describe('constructor', () => {
    it('throws if the callback is not a function', () => {
      expect(() => new Task(null)).toThrow()
    })

    it('initializes with Status.Pending', () => {
      const task = new Task(() => {})
      expect(task.status).toBe(Status.Pending)
    })
  })

  describe('.exec()', () => {
    it('resolves a synchronous callback', async () => {
      const task = new Task(() => 42)

      task.exec()

      await expect(task.promise).resolves.toBe(42)
      expect(task.status).toBe(Status.Fulfilled)
    })

    it('resolves an asynchronous callback', async () => {
      const task = new Task(async () => {
        await wait()
        return 42
      })

      task.exec()

      await expect(task.promise).resolves.toBe(42)
      expect(task.status).toBe(Status.Fulfilled)
    })

    it('rejects when the synchronous callback throws', async () => {
      const task = new Task(() => {
        throw new Error('Oh no!')
      })

      task.exec()

      await expect(task.promise).rejects.toThrow('Oh no!')
      expect(task.status).toBe(Status.Rejected)
    })

    it('rejects when the asynchronous callback rejects', async () => {
      const task = new Task(async () => {
        await wait()
        throw new Error('Oh no!')
      })

      task.exec()

      await expect(task.promise).rejects.toThrow('Oh no!')
      expect(task.status).toBe(Status.Rejected)
    })

    it('executes callback only once', async () => {
      const mockFn = vitest.fn()
      const task = new Task(mockFn)

      await task.exec()
      await task.exec()
      await task.exec()

      expect(mockFn).toHaveBeenCalledTimes(1)
    })
  })

  describe('.resolve()', () => {
    it('supports manual resolution before exec', async () => {
      const task = new Task(() => 42)

      task.resolve(13.7)

      await expect(task.promise).resolves.toBe(13.7)
      expect(task.status).toBe(Status.Fulfilled)
    })

    it('does not resolve more than once', async () => {
      const task = new Task(() => 42)

      task.resolve(13.7)
      task.resolve(3.14)
      task.reject()

      await expect(task.promise).resolves.toBe(13.7)
      expect(task.status).toBe(Status.Fulfilled)
    })
  })

  describe('.reject()', () => {
    it('supports rejection before exec', async () => {
      const task = new Task(() => 42)

      task.reject('Oh no!')

      await expect(task.promise).rejects.toBe('Oh no!')
      expect(task.status).toBe(Status.Rejected)
    })

    it('does not reject more than once', async () => {
      const task = new Task(() => 42)

      task.reject('Oh no!')
      task.reject('Failed')
      task.resolve(13.7)

      await expect(task.promise).rejects.toBe('Oh no!')
      expect(task.status).toBe(Status.Rejected)
    })
  })
})
