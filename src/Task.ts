import { isFunction } from './isFunction'

export type Operation<T> = () => T | PromiseLike<T>

export enum Status {
  Pending,
  Executing,
  Fulfilled,
  Rejected,
}

export class Task<T> {
  public promise: Promise<T>

  #status: Status = Status.Pending

  #operation: Operation<T>

  #resolve: (value: T) => void

  #reject: (value?: unknown) => void

  constructor(operation: Operation<T>) {
    isFunction(operation)

    this.#operation = operation

    // TODO: refactor to use Promise.withResolvers() in future
    this.promise = new Promise((resolve, reject) => {
      this.#resolve = resolve
      this.#reject = reject
    })
  }

  async exec() {
    if (this.#status !== Status.Pending) return

    this.#status = Status.Executing

    try {
      const result = await this.#operation()
      this.resolve(result)
    } catch (error) {
      this.reject(error)
    }
  }

  resolve(value: T) {
    if (this.settled) return

    this.#status = Status.Fulfilled
    this.#resolve(value)
  }

  reject(reason: unknown = 'Task cancelled') {
    if (this.settled) return

    this.#status = Status.Rejected
    this.#reject(reason)
  }

  get settled() {
    return this.#status === Status.Fulfilled || this.#status === Status.Rejected
  }

  get status() {
    return this.#status
  }
}
