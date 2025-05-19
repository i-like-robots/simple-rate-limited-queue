import { beforeEach, describe, expect, it } from 'vitest'
import { Dequeue } from '../Dequeue'

describe('Dequeue', () => {
  let instance: Dequeue<number>

  beforeEach(() => {
    instance = new Dequeue<number>()
  })

  it('starts empty', () => {
    expect(instance.size).toBe(0)
  })

  describe('.push()', () => {
    it('adds elements to the back of the queue', () => {
      instance.push(1)
      instance.push(2)
      instance.push(3)

      expect(instance.size).toBe(3)
      expect(instance.peekBack()).toBe(3)
      expect(instance.peekFront()).toBe(1)
    })
  })

  describe('.unshift()', () => {
    it('adds elements to the front of the queue', () => {
      instance.unshift(1)
      instance.unshift(2)
      instance.unshift(3)

      expect(instance.size).toBe(3)
      expect(instance.peekFront()).toBe(3)
      expect(instance.peekBack()).toBe(1)
    })
  })

  describe('.pop()', () => {
    it('removes elements from the back of the queue', () => {
      instance.push(1)
      instance.push(2)

      expect(instance.pop()).toBe(2)
      expect(instance.pop()).toBe(1)
      expect(instance.pop()).toBeUndefined()
    })
  })

  describe('.shift()', () => {
    it('removes elements from the front of the queue', () => {
      instance.push(1)
      instance.push(2)

      expect(instance.shift()).toBe(1)
      expect(instance.shift()).toBe(2)
      expect(instance.shift()).toBeUndefined()
    })
  })

  describe('.clear()', () => {
    it('empties the queue', () => {
      instance.push(1)
      instance.push(2)
      instance.push(3)
      instance.clear()

      expect(instance.size).toBe(0)
      expect(instance.peekFront()).toBeUndefined()
      expect(instance.peekBack()).toBeUndefined()
    })
  })
})
