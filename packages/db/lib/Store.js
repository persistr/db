const { EventEmitter } = require('events')
const DefaultKeyCodec = require('./DefaultKeyCodec')
const DefaultValueCodec = require('./DefaultValueCodec')
const _ = require('lodash')

class Store {
  constructor({ adapter, prefix, keyCodec, valueCodec }) {
    this._adapter = adapter
    this._prefix = prefix || []
    this._keyCodec = keyCodec || DefaultKeyCodec
    this._valueCodec = valueCodec || DefaultValueCodec
    this._emitter = new EventEmitter()
    this._adapter.on('set', (key, value) => key.startsWith(this._encodedPrefix()) && this._emitter.emit('set', key, this._decodedValue(value)))
    this._adapter.on('deleted', (key, value) => key.startsWith(this._encodedPrefix()) && this._emitter.emit('deleted', key, this._decodedValue(value)))
    this._adapter.on('renamed', (before, after, value) => before.startsWith(this._encodedPrefix()) && this._emitter.emit('renamed', before, after, this._decodedValue(value)))
    this._adapter.on('cleared', prefix => prefix.startsWith(this._encodedPrefix()) && this._emitter.emit('cleared', prefix))
  }

  async connect() {
    return this._adapter.connect()
  }

  async disconnect() {
    return this._adapter.disconnect()
  }

  get uri() {
    return this._adapter.options.uri
  }

  prefix(...args) {
    return new Store({
      adapter: this._adapter,
      prefix: [ ...this._prefix, ...args ],
      keyCodec: this._keyCodec,
      valueCodec: this._valueCodec
    })
  }

  unprefix() {
    return new Store({
      adapter: this._adapter,
      prefix: this._prefix.slice(0, -1),
      keyCodec: this._keyCodec,
      valueCodec: this._valueCodec
    })
  }

  async set(key, value, options) {
    return this._adapter.set(this._encodedKey(key), this._encodedValue(value), options)
  }

  async get(key) {
    const value = await this._adapter.get(this._encodedKey(key))
    if (value === undefined) return undefined
    return this._decodedValue(value)
  }

  async has(key) {
    return this._adapter.has(this._encodedKey(key))
  }

  async delete(key) {
    return this._adapter.delete(this._encodedKey(key))
  }

  async clear() {
    return this._adapter.clear(this._encodedPrefix())
  }

  async entries(options) {
    const prefix = this._encodedKey(options?.prefix ?? '')
    const results = await this._adapter.entries({ ...options, prefix })
    return results.map(([ key, value ]) => {
      return [ options?.decodeKeys ? this._decodedKey(key) : key, this._decodedValue(value) ]
    })
  }

  async keys(options) {
    const prefix = this._encodedKey(options?.prefix ?? '')
    const results = await this._adapter.keys({ ...options, prefix })
    return results.map(key => options?.decodeKeys ? this._decodedKey(key) : key)
  }

  async values(options) {
    const prefix = this._encodedKey(options?.prefix ?? '')
    const results = await this._adapter.values({ ...options, prefix })
    return results.map(value => this._decodedValue(value))
  }

  async rename(oldKey, newKey) {
    return this._adapter.rename(this._encodedKey(oldKey), this._encodedKey(newKey))
  }

  async count(options) {
    return this._adapter.count(options)
  }

  on(event, callback) {
    this._emitter.on(event, callback)
    return this
  }

  _encodedPrefix() {
    return this._keyCodec.encode(this._prefix)
  }

  _encodedKey(key) {
    validate(key)
    key = Array.isArray(key) ? key : [ key ]
    return this._keyCodec.encode([ ...this._prefix, ...key ])
  }

  _decodedKey(key) {
    return this._keyCodec.decode(key)
  }

  _encodedValue(value) {
    return this._valueCodec.encode(value)
  }

  _decodedValue(value) {
    return this._valueCodec.decode(value)
  }
}

function validate(key) {
  let isValid = true

  if (_.isArray(key)) {
    for (const item of key) {
      if (!_.isString(item) && !_.isNumber(item)) {
        isValid = false
        break
      }
    }
  }
  else if (!_.isString(key) && !_.isNumber(key)) {
    isValid = false
  }

  if (!isValid) {
    throw new Error(`key can only be composed of strings and intergers: ${key}`)
  }
}

module.exports = Store
