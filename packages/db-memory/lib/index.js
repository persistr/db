const { EventEmitter } = require('events')

class Adapter {
  constructor(options) {
    this.options = options
    this.map = new Map()
    this.emitter = new EventEmitter()
  }

  async connect() {
  }

  async disconnect() {
  }

  async set(key, value, options) {
    if (options && options.ttl <= 0) {
      await this.delete(key)
      return
    }
    const expires = (options && options.ttl) ? (Date.now() + options.ttl) : undefined
    this.map.set(key, { value, expires })
    this.emitter.emit('set', key, value)
  }

  async get(key) {
    const data = this.map.get(key)
    if (!data) return undefined
    if (data.expires && Date.now() > data.expires) {
      await this.delete(key)
      return undefined
    }
    return data.value
  }

  async has(key) {
    const value = await this.get(key)
    return (value !== undefined)
  }

  async delete(key) {
    const data = this.map.get(key)
    this.map.delete(key)
    if (data) this.emitter.emit('deleted', key, data.value)
  }

  async clear(prefix) {
    const entries = await this.entries({ prefix })
    for (const [ key, value ] of entries) {
      this.map.delete(key)
      this.emitter.emit('deleted', key, value)
    }
    this.emitter.emit('cleared', prefix)
  }

  async entries(options) {
    const { prefix, after, until, limit } = options ?? {}
    let count = 0
    return Array.from(this.map.entries()).filter(([ key, data ]) => {
      if (limit > 0 && count >= limit) return false
      if (prefix && !key.startsWith(prefix)) return false
      if (after && key <= after) return false
      if (until && key > until) return false
      if (data.expires && Date.now() > data.expires) return false
      count++
      return true
    }).map(([ key, data ]) => {
      return [ key, data.value ]
    })
  }

  async keys(options) {
    const entries = await this.entries(options)
    return entries.map(([ key, value ]) => key)
  }

  async values(options) {
    const entries = await this.entries(options)
    return entries.map(([ key, value ]) => value)
  }

  async rename(oldKey, newKey) {
    const data = this.map.get(oldKey)
    this.map.set(newKey, data)
    this.map.delete(oldKey)
    this.emitter.emit('renamed', oldKey, newKey, data.value)
  }

  async count(options) {
    const entries = await this.entries(options)
    return entries.length
  }

  on(event, callback) {
    this.emitter.on(event, callback)
  }
}

module.exports = Adapter
