export function isFunction(value: unknown): asserts value is Function {
  if (typeof value !== 'function') {
    throw new TypeError('Value must be a function')
  }
}
