const { promises: fs } = require('fs')
const { EventEmitter } = require('events')
const path = require('path')
const untildify = require('untildify')
const util = require('util')

class Adapter {
  constructor(options) {
    this.options = options
    this.emitter = new EventEmitter()
  }

  async connect() {
    const options = { memStore: this.options?.transient === "true" }
    const { Db } = require('tingodb')(options)
    let pathName = this.options?.uri.replace(/(^fs:?|^)/, '') || '~/.persistr.db/store'
    pathName = untildify(path.normalize(pathName))
    const { dir, base } = path.parse(pathName)
    await fs.mkdir(dir, { recursive: true })
    this.db = new Db(dir, {})
    this.collection = this.db.collection(base)
  }

  async disconnect() {
    this.collection = null
    this.db = null
  }

  async set(key, value, options) {
    if (options && options.ttl <= 0) {
      await this.delete(key)
      return
    }

    // WORKAROUND: Due to an unknown issue with TingoDB, update results
    // in a duplicate index exception. Delete the document first.
    await this.delete(key)

    const expires = (options && options.ttl) ? (Date.now() + options.ttl) : undefined
    const insert = util.promisify(this.collection.insert).bind(this.collection)
    await insert({ key, value, expires })
    this.emitter.emit('set', key, value)
  }

  async get(key) {
    const findOne = util.promisify(this.collection.findOne).bind(this.collection)
    const data = await findOne({ key })
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
    const findAndRemove = util.promisify(this.collection.findAndRemove).bind(this.collection)
    const data = await findAndRemove({ key })
    if (data) this.emitter.emit('deleted', key, data.value)
  }

  async clear(prefix) {
    const entries = await this.entries({ prefix })
    for (const [ key, value ] of entries) {
      await this.delete(key)
    }
    this.emitter.emit('cleared', prefix)
  }

  async entries({ prefix, after, until, limit }) {
    let filter = {}
    if (prefix) filter.key = { $gte: prefix }
    if (after) filter.key = { $gt: after }
    if (until) filter.key = { $lt: until }

    const find = util.promisify(this.collection.find).bind(this.collection)
    const cursor = await find(filter)
    if (limit && limit > 0) cursor.limit(limit)
    cursor.sort({ key: 1 })

    const toArray = util.promisify(cursor.toArray).bind(cursor)
    const results = await toArray()

    let count = 0
    return results.filter(({ key, value, expires }) => {
      if (limit > 0 && count > limit) return false
      if (!key.startsWith(prefix)) return false
      if (after && key <= after) return false
      if (until && key > until) return false
      if (expires && Date.now() > expires) return false
      count++
      return true
    }).map(({ key, value }) => {
      return [ key, value ]
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
    const findAndModify = util.promisify(this.collection.findAndModify).bind(this.collection)
    const data = await findAndModify({ key: oldKey }, { key: 1 }, { $set: { key: newKey }}, { update: true })
    if (data) this.emitter.emit('renamed', oldKey, newKey, data.value)
  }

  async count(options) {
    const count = util.promisify(this.collection.count).bind(this.collection)
    return await count()
  }

  on(event, callback) {
    this.emitter.on(event, callback)
  }
}

module.exports = Adapter
