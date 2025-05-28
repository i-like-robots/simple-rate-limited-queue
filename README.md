# simple-rate-limited-queue

[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/i-like-robots/simple-rate-limited-queue/blob/main/LICENSE) ![build status](https://github.com/i-like-robots/simple-rate-limited-queue/actions/workflows/test.yml/badge.svg?branch=main) [![npm version](https://img.shields.io/npm/v/simple-rate-limited-queue.svg?style=flat)](https://www.npmjs.com/package/simple-rate-limited-queue)

A simple rate limited queue for asynchronous operations. Restricts the number of operations executed per time interval.

```js
import { RateLimitedQueue } from 'simple-rate-limited-queue'

const queue = new RateLimitedQueue()

await queue.schedule(() => { … })
```

## Installation

This is a [Node.js] module available through the [npm] registry. Node.js 20 or higher is required.

```sh
$ npm install --save simple-rate-limited-queue
```

[Node.js]: https://nodejs.org/en/
[npm]: https://www.npmjs.com/
[npm install]: https://docs.npmjs.com/getting-started/installing-npm-packages-locally

## Features

...

## API

### `new RateLimitedQueue([options] = {})`

Creates a new queue instance. The options are:

| Name             | Type     | Description                                                    |
| ---------------- | -------- | -------------------------------------------------------------- |
| `maxConcurrency` | `number` | The maximum number of operations to execute per time interval. |
| `intervalLength` | `number` | The length of each time interval in milliseconds.              |

All of the options and their defaults are shown below:

```js
const queue = new RateLimitedQueue({
  maxConcurrency: 10,
  intervalLength: 1000,
})
```

#### `queue.schedule(operation[, addToFront])`

Adds an operation to the queue and returns a promise which will resolve or reject with the result of the operation. Optionally place the operation at the front of the queue.

#### `queue.pause()`

Pauses the queue. Cancels the current interval.

#### `queue.resume()`

Resumes the queue after pausing. Starts a new interval.

#### `queue.terminate()`

Terminates the queue. Cancels all queued operations. Prevents new operations being scheduled.

#### `queue.reset()`

Resets the queue after termination. Enables new operations to be scheduled.

#### `queue.pending`

Returns the number of operations currently queued.

#### `queue.inProgress`

Returns the number of operations currently in progress.

#### `queue.isPaused`

Returns a boolean indicating whether the queue has been paused.

#### `queue.isTerminated`

Returns a boolean indicating whether the queue has been terminated.

## License

This package is MIT licensed.
