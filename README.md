# simple-rate-limited-queue

[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/i-like-robots/simple-rate-limited-queue/blob/main/LICENSE) ![build status](https://github.com/i-like-robots/simple-rate-limited-queue/actions/workflows/test.yml/badge.svg?branch=main) [![npm version](https://img.shields.io/npm/v/simple-rate-limited-queue.svg?style=flat)](https://www.npmjs.com/package/simple-rate-limited-queue)

A simple rate limited queue for asynchronous operations. Restricts the number of operations executed per time interval and the number of concurrent operations in progress. No dependencies, under 1Kb gzipped.

```js
import { RateLimitedQueue } from 'simple-rate-limited-queue'

const queue = new RateLimitedQueue()

function getUser(id) {
  return queue.schedule(() => get(`/user/${id}`))
}

const user = await getUser(123)
```

## Installation

This is a [Node.js] module available through the [npm] registry. Node.js 20 or higher is required.

```sh
$ npm install --save simple-rate-limited-queue
```

[Node.js]: https://nodejs.org/en/
[npm]: https://www.npmjs.com/
[npm install]: https://docs.npmjs.com/getting-started/installing-npm-packages-locally

## API

### `new RateLimitedQueue([options = {}])`

Creates a new queue instance. The options are:

| Name             | Type   | Description                                                    |
| ---------------- | ------ | -------------------------------------------------------------- |
| `maxPerInterval` | number | The maximum number of operations to execute per time interval. |
| `maxInProgress`  | number | The maximum number of concurrent operations in progress        |
| `intervalLength` | number | The length of each time interval in milliseconds.              |

All of the options and their defaults are shown below:

```js
const queue = new RateLimitedQueue({
  maxPerInterval: 10,
  maxInProgress: 20,
  intervalLength: 1000,
})
```

#### `queue.schedule(operation[, scheduleFirst = false])`

Adds an operation to the queue and returns a promise which will resolve or reject with the result of the operation when it is executed. Will reject if the queue is terminated. Optionally, the operation can be placed at the front of the queue.

#### `queue.token([scheduleFirst = false])`

Returns a promise which will resolve when the token reaches the front of the queue. Will reject if the queue is terminated. Optionally, the token can be placed at the front of the queue.

#### `queue.pause()`

Pauses the queue. Cancels the current interval. Allows in progress jobs finish and new operations may still be scheduled.

#### `queue.resume()`

Resumes the queue after pausing. Starts a new interval.

#### `queue.terminate()`

Terminates the queue. Cancels the current interval and cancels all queued operations. Prevents new operations being scheduled.

#### `queue.reset()`

Resets the queue after termination. Starts a new interval and allows new operations to be scheduled again.

#### `queue.pending`

Returns the number of operations currently queued.

#### `queue.inProgress`

Returns the number of operations currently in progress.

#### `queue.isPaused`

Returns a boolean indicating whether the queue has been paused.

#### `queue.isTerminated`

Returns a boolean indicating whether the queue has been terminated.

### `withRetry(operation, shouldRetry)`

A higher-order function to wrap operations and optionally retry them on failure.

To retry, return a number from the `shouldRetry` callback. The number returned is how many milliseconds to wait before retrying the operation. Return `0` to retry immediately or any other value to reject with the original error.

```js
import { withRetry } from 'simple-rate-limited-queue'

// Try a request up to 3 times with a 1 second delay between executions
const getWithRetry = withRetry(get, (error, count) => {
  console.error('Request failed', error)
  if (count <= 3) return 1000
})

function getUser(id) {
  return queue.schedule(() => getWithRetry(`/user/${id}`))
}
```

_NOTE:_ When you retry an operation it will not go to the back of the queue. Instead, it will stay in the executing state until it is settled or you stop retrying it. This means that it counts as an in progress operation even while it's waiting to be retried.

## License

This package is MIT licensed.
