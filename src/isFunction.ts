import { type Operation } from './Task'

export function isFunction(value: unknown): asserts value is Operation<unknown> {
  if (typeof value !== 'function') {
    throw new TypeError('Operation must be a function')
  }
}
