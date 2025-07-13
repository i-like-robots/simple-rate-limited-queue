import { isFunction } from './isFunction'
import { type Operation } from './Task'

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export type ShouldRetry = (error: unknown, executions: number) => number | void

export function withRetry<T>(operation: Operation<T>, shouldRetry: ShouldRetry) {
  isFunction(operation)
  isFunction(shouldRetry)

  let executions = 0

  const exec = async () => {
    while (true) {
      try {
        return await operation()
      } catch (error) {
        executions++

        const delay = shouldRetry(error, executions)

        if (typeof delay !== 'number') {
          return Promise.reject(error)
        }

        await wait(delay)
      }
    }
  }

  return exec
}
