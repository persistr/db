const { EventEmitter } = require('events')
const knex = require('knex')

/*
https://www.npmjs.com/package/knex-aurora-data-api-client

// Aurora Data API for MySQL
const knexDataApiClient = require("knex-aurora-data-api-client");
const knex = require("knex")({
  client: knexDataApiClient.mysql,
  connection: {
    secretArn: "secret-arn", // Required
    resourceArn: "db-resource-arn", // Required
    database: "db-name",
    region: "eu-west-2"
  }
});

//  Aurora Data API for Postgres
const knexDataApiClient = require("knex-aurora-data-api-client");
const knex = require("knex")({
  client: knexDataApiClient.postgres,
  connection: {
    secretArn: "secret-arn", // Required
    resourceArn: "db-resource-arn", // Required
    database: "db-name",
    region: "eu-west-2"
  }
});
*/

class Adapter {
  constructor(options) {
    this.options = options
    this.table = options.table || 'map'
    this.emitter = new EventEmitter()
  }

  async connect() {
    this.knex = knex({
      client: this.options.dialect,
      connection: this.options.uri
/*
//SQLite
      connection: {
        filename: './data.db',
      },
*/
    })
    await this.knex.schema.hasTable(this.table).then(exists => {
      if (!exists) return this.knex.schema.createTable(this.table, table => {
        table.string('key', this.options.keySize || 255).notNullable().primary()
        table.text('value', this.options.valueSize || 'mediumtext').notNullable()
        table.timestamp('ts', { precision: 6 }).notNullable().defaultTo(this.knex.fn.now(6))
        table.timestamp('expires', { precision: 6 }).nullable()
        table.index('expires')
      })
    })
  }

  async disconnect() {
    await this.knex.destroy()
  }

  async set(key, value, options) {
    if (options && options.ttl <= 0) {
      await this.delete(key)
      return
    }
    const expires = (options && options.ttl) ? new Date(Date.now() + options.ttl) : null
    try {
      await this.knex(this.table).insert({ key, value, expires })
    }
    catch (error) {
      if (error && error.errno === 1062 && error.code === 'ER_DUP_ENTRY') {
        await this.knex(this.table).where('key', key).update({ value, expires })
      }
      else {
        throw error
      }
    }
    this.emitter.emit('set', key, value)
  }

  async get(key) {
    const data = await this.knex(this.table).where('key', key).first()
    if (!data) return undefined
    if (data.expires && new Date(Date.now() + 0) > data.expires) {
      await this.knex(this.table).where('key', key).del()
      return undefined
    }
    return data.value
  }

  async has(key) {
    const value = await this.get(key)
    return (value !== undefined)
  }

  async delete(key) {
    const value = await this.get(key)
    if (value === undefined) return
    await this.knex(this.table).where('key', key).del()
    this.emitter.emit('deleted', key, value)
  }

  async clear(prefix) {
    const entries = await this.entries({ prefix })
    for (const [ key, value ] of entries) {
      await this.knex(this.table).where('key', key).del()
      this.emitter.emit('deleted', key, value)
    }
    this.emitter.emit('cleared', prefix)
  }

  async entries(options) {
    const { prefix, after, until, limit } = options ?? {}
    let query = this.knex(this.table)
    query.where(function() {
      this.whereNull('expires').orWhereNotNull('expires').andWhere('expires', '<', new Date())
    })
    if (prefix && !after) query.where('key', '>', prefix)
    if (prefix && !until) {
      const end = prefix.slice(0, -1) + String.fromCharCode(prefix.charCodeAt(prefix.length - 1) + 1)
      query.where('key', '<', end)
    }
    if (after) query.where('key', '>', after)
    if (until) query.where('key', '<=', until)
    if (limit) query.limit(limit)

    const results = await query
    return results.map(data => {
      return [ data.key, data.value ]
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
    const value = await this.get(oldKey)
    await this.knex(this.table).where('key', oldKey).update('key', newKey)
    this.emitter.emit('renamed', oldKey, newKey, value)
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
