export class Dequeue<T> {
  #queue: T[] = []

  unshift(item: T) {
    this.#queue.unshift(item)
  }

  push(item: T) {
    this.#queue.push(item)
  }

  shift() {
    return this.#queue.shift()
  }

  pop() {
    return this.#queue.pop()
  }

  peekBack() {
    return this.#queue.at(-1)
  }

  peekFront() {
    return this.#queue.at(0)
  }

  get size() {
    return this.#queue.length
  }

  clear() {
    this.#queue.length = 0
  }
}
