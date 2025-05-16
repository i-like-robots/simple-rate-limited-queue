export type Callback<T extends unknown> = (() => T) | (() => PromiseLike<T>)

export enum Status {
  Pending,
  Fulfilled,
  Rejected,
}

export class Task<T> {
  public promise: Promise<T>

  #status: Status = Status.Pending

  #callback: Callback<T>

  #resolve: (value: T) => void

  #reject: (value?: any) => void

  constructor(callback: Callback<T>) {
    this.#callback = callback

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

  reject(reason: any = 'Task cancelled') {
    if (this.#status !== Status.Pending) return

    this.#status = Status.Rejected
    this.#reject(reason)
  }

  get status() {
    return this.#status
  }
}
