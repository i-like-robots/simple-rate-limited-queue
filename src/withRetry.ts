import { type Operation } from './Task'

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export type ShouldRetry = (error: unknown, executions: number) => number | void

export function withRetry<T>(operation: Operation<T>, shouldRetry: ShouldRetry) {
  if (typeof operation !== 'function') {
    throw new TypeError('Operation must be a function')
  }

  if (typeof shouldRetry !== 'function') {
    throw new TypeError('Should retry callback must be a function')
  }

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
