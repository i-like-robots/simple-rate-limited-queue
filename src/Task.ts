export type Callback<T> = () => T | PromiseLike<T>

export enum Status {
  Pending,
  Fulfilled,
  Rejected,
}

function isFunction(value: unknown): asserts value is Callback<unknown> {
  if (typeof value !== 'function') {
    throw new TypeError('Callback must be a function')
  }
}

export class Task<T> {
  public promise: Promise<T>

  #status: Status = Status.Pending

  #callback: Callback<T>

  #resolve: (value: T) => void

  #reject: (value?: unknown) => void

  constructor(callback: Callback<T>) {
    isFunction(callback)

    this.#callback = callback

    // TODO: refactor to use Promise.withResolvers() in future
    this.promise = new Promise((resolve, reject) => {
      this.#resolve = resolve
      this.#reject = reject
    })
  }

  async exec() {
    if (this.#status !== Status.Pending) return

    try {
      const result = await this.#callback()
      this.resolve(result)
    } catch (error) {
      this.reject(error)
    }
  }

  resolve(value: T) {
    if (this.#status !== Status.Pending) return

    this.#status = Status.Fulfilled
    this.#resolve(value)
  }

  reject(reason: unknown = 'Task cancelled') {
    if (this.#status !== Status.Pending) return

    this.#status = Status.Rejected
    this.#reject(reason)
  }

  get status() {
    return this.#status
  }
}
