import { Dequeue } from './Dequeue.js'
import { type Callback, Task } from './Task.js'

export type Priority = 0 | 1

export type Options = {
  maxConcurrency: number
  intervalLength: number
}

export class QueueManager {
  #queue = new Dequeue<Task<unknown>>()

  #isPaused = false

  #isTerminated = false

  #inProgress = 0

  // #controller = new AbortController()

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

  schedule<T>(callback: Callback<T>, priority: Priority = 0): Promise<T> {
    if (this.#isTerminated) return null

    const task = new Task<T>(callback)

    if (priority === 1) {
      this.#queue.unshift(task)
    } else {
      this.#queue.push(task)
    }

    this.#startInterval()

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
