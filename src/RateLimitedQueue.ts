import { Dequeue } from './Dequeue.js'
import { type Operation, Task } from './Task.js'

type Options = {
  /** The maximum number of operations to execute per time interval */
  maxConcurrency: number
  /** The length of each time interval in milliseconds */
  intervalLength: number
}

class RateLimitedQueue {
  #queue = new Dequeue<Task<unknown>>()

  #isPaused = false

  #isTerminated = false

  #inProgress = 0

  #timeoutId: NodeJS.Timeout = undefined

  #maxConcurrency = 10

  #intervalLength = 1000

  constructor(options: Partial<Options> = {}) {
    if (typeof options.maxConcurrency === 'number') {
      this.#maxConcurrency = options.maxConcurrency
    }

    if (typeof options.intervalLength === 'number') {
      this.#intervalLength = options.intervalLength
    }
  }

  #run() {
    if (this.#isPaused || this.#isTerminated || this.#timeoutId) return

    while (this.#inProgress < this.#maxConcurrency && this.#queue.size > 0) {
      const task = this.#queue.shift()

      this.#inProgress++

      void task.exec().finally(() => {
        this.#inProgress--
      })
    }

    if (this.#queue.size > 0) {
      this.#startInterval()
    }
  }

  #startInterval() {
    if (this.#timeoutId === undefined) {
      this.#timeoutId = setTimeout(() => this.#onInterval(), this.#intervalLength)
    }
  }

  #endInterval() {
    if (this.#timeoutId) {
      clearTimeout(this.#timeoutId)
      this.#timeoutId = undefined
    }
  }

  #onInterval() {
    this.#endInterval()
    this.#run()
  }

  pause() {
    if (this.#isPaused) return

    this.#endInterval()
    this.#isPaused = true
  }

  resume() {
    if (!this.#isPaused) return

    this.#isPaused = false
    this.#startInterval()
  }

  terminate() {
    if (this.#isTerminated) return

    this.#endInterval()

    while (this.#queue.size) {
      this.#queue.shift().reject()
    }

    this.#isTerminated = true
  }

  reset() {
    if (!this.#isTerminated) return

    this.#isTerminated = false

    this.#queue = new Dequeue()

    this.#startInterval()
  }

  async schedule<T>(operation: Operation<T>, addToFront = false): Promise<T> {
    if (this.#isTerminated) {
      throw new Error('Failed to schedule task, the queue has been terminated')
    }

    const task = new Task<T>(operation)

    if (addToFront) {
      this.#queue.unshift(task)
    } else {
      this.#queue.push(task)
    }

    this.#run()

    return task.promise
  }

  get pending() {
    return this.#queue.size
  }

  get inProgress() {
    return this.#inProgress
  }

  get isPaused() {
    return this.#isPaused
  }

  get isTerminated() {
    return this.#isTerminated
  }
}

export { type Operation, type Options, RateLimitedQueue }
